"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Zone = {
  id: string;
  href: string;
  className: string; // mz-as, mz-pl, etc.
  zoneLabel: string;
  title: string;
  desc: string;
  corner: string;
  style: React.CSSProperties;
  labelColor: string;
};

const ZONES: Zone[] = [
  {
    id: "aspirations", href: "/plan/general", className: "mz-as",
    zoneLabel: "Future", title: "Aspirations",
    desc: "Long-term vision · Wannabe trades · Where this journey leads",
    corner: "→ General Plan", labelColor: "var(--purple)",
    style: { top: 35, left: 50, width: 230, height: 170, background: "rgba(136,80,240,0.05)", borderColor: "rgba(136,80,240,0.18)" },
  },
  {
    id: "trading-plan", href: "/plan/trading", className: "mz-pl",
    zoneLabel: "Now", title: "Trading Plan",
    desc: "5 rules live · Pre-trade checklist · Session structure · 1% sizing · 2K limit",
    corner: "→ Trading Plan", labelColor: "var(--accent)",
    style: { top: 35, left: 320, width: 230, height: 170, background: "rgba(184,240,80,0.04)", borderColor: "rgba(184,240,80,0.16)" },
  },
  {
    id: "execution", href: "/trade-log", className: "mz-ex",
    zoneLabel: "Execution", title: "Active Trades",
    desc: "Live positions · CL, spreads, flies · Open P&L",
    corner: "0 active → Trade Log", labelColor: "var(--teal)",
    style: { top: 35, left: 590, width: 220, height: 170, background: "rgba(56,240,176,0.04)", borderColor: "rgba(56,240,176,0.15)" },
  },
  {
    id: "strategies", href: "/strategy-vault", className: "mz-st",
    zoneLabel: "Method", title: "Strategies",
    desc: "ORB (Opening Range Breakout) · VWAP Std Scalp · Rules · Edge · Version history",
    corner: "2 strategies → Vault", labelColor: "var(--blue)",
    style: { top: 250, left: 50, width: 320, height: 175, background: "rgba(56,136,240,0.04)", borderColor: "rgba(56,136,240,0.15)" },
  },
  {
    id: "playbook", href: "/playbook", className: "mz-pb",
    zoneLabel: "Response", title: "Playbook",
    desc: "Rule 1: Aggressive outright bullish → hold short entries · More rules to follow",
    corner: "1 rule → Playbook", labelColor: "var(--cyan)",
    style: { top: 250, left: 410, width: 220, height: 175, background: "rgba(48,216,240,0.04)", borderColor: "rgba(48,216,240,0.15)" },
  },
  {
    id: "risk", href: "/risk-console", className: "mz-ri",
    zoneLabel: "Guard", title: "Risk",
    desc: "1% per trade · Max loss 2K · 2-trade fail limit · Drawdown",
    corner: "→ Risk Console", labelColor: "var(--red)",
    style: { top: 250, left: 670, width: 185, height: 175, background: "rgba(240,60,92,0.04)", borderColor: "rgba(240,60,92,0.15)" },
  },
  {
    id: "side-brain", href: "/side-brain", className: "mz-br",
    zoneLabel: "Meta", title: "Side Brain",
    desc: "Health · Gaps · Feedback · Evolution",
    corner: "Online → Side Brain", labelColor: "var(--purple)",
    style: { top: 470, left: 50, width: 190, height: 150, background: "rgba(136,80,240,0.07)", borderColor: "rgba(136,80,240,0.22)" },
  },
  {
    id: "learning", href: "/learning", className: "mz-le",
    zoneLabel: "Knowledge", title: "Learning",
    desc: "7 principles live · Queue building",
    corner: "→ Learning Engine", labelColor: "var(--teal)",
    style: { top: 470, left: 280, width: 190, height: 150, background: "rgba(56,240,176,0.04)", borderColor: "rgba(56,240,176,0.13)" },
  },
  {
    id: "deferred", href: "/deferred", className: "mz-df",
    zoneLabel: "Parked", title: "Deferred",
    desc: "4 items waiting · TT direct · Auth · Mobile · Advanced BT",
    corner: "4 items → Queue", labelColor: "var(--muted)",
    style: { top: 470, left: 510, width: 190, height: 150, background: "rgba(80,80,100,0.06)", borderColor: "rgba(80,80,100,0.18)" },
  },
];

export default function MapCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
    moved: boolean;
  }>({ dragging: false, startX: 0, startY: 0, startTx: 0, startTy: 0, moved: false });

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragState.current.dragging) return;
      dragState.current.moved = true;
      setTx(dragState.current.startTx + (e.clientX - dragState.current.startX));
      setTy(dragState.current.startTy + (e.clientY - dragState.current.startY));
    }
    function onMouseUp() {
      dragState.current.dragging = false;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest(".mbtn")) return;
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
      moved: false,
    };
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setScale((s) => Math.min(1.4, Math.max(0.35, s + (e.deltaY > 0 ? -0.06 : 0.06))));
  }

  function reset() {
    setScale(0.75);
    setTx(0);
    setTy(0);
  }

  // Block link navigation if it was actually a drag
  function onZoneClick(e: React.MouseEvent) {
    if (dragState.current.moved) {
      e.preventDefault();
    }
  }

  return (
    <div
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      style={{
        width: "100%",
        height: 500,
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        cursor: dragState.current.dragging ? "grabbing" : "grab",
        marginBottom: 13,
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          width: 1400,
          height: 900,
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* connector lines */}
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          viewBox="0 0 1400 900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="280" y1="122" x2="320" y2="122" stroke="#28283a" strokeWidth="1" strokeDasharray="4,3" />
          <line x1="550" y1="122" x2="590" y2="122" stroke="#28283a" strokeWidth="1" strokeDasharray="4,3" />
          <line x1="435" y1="205" x2="380" y2="250" stroke="#28283a" strokeWidth="1" strokeDasharray="4,3" />
          <line x1="700" y1="205" x2="520" y2="250" stroke="#28283a" strokeWidth="1" strokeDasharray="4,3" />
          <line x1="370" y1="340" x2="670" y2="340" stroke="#28283a" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="145" y1="470" x2="145" y2="430" stroke="#6030b0" strokeWidth="1" strokeDasharray="3,3" opacity="0.35" />
        </svg>

        {ZONES.map((zone) => (
          <Link
            key={zone.id}
            href={zone.href}
            onClick={onZoneClick}
            className="mz"
            style={{
              position: "absolute",
              borderRadius: 4,
              padding: 13,
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.15s",
              userSelect: "none",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              ...zone.style,
            }}
          >
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5, color: zone.labelColor }}>
              {zone.zoneLabel}
            </div>
            <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {zone.title}
            </div>
            <div style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.55 }}>{zone.desc}</div>
            <div style={{ position: "absolute", bottom: 9, right: 10, fontSize: 8.5, color: "var(--muted2)" }}>
              {zone.corner}
            </div>
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(8,8,9,0.88)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          padding: "9px 11px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {[
          ["Aspirations", "var(--purple)"],
          ["Trading Plan", "var(--accent)"],
          ["Execution", "var(--teal)"],
          ["Strategies", "var(--blue)"],
          ["Playbook", "var(--cyan)"],
          ["Risk", "var(--red)"],
        ].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "var(--muted)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 3 }}>
        <button
          type="button"
          className="mbtn"
          onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
          style={mbtnStyle}
        >
          +
        </button>
        <button
          type="button"
          className="mbtn"
          onClick={() => setScale((s) => Math.max(0.35, s - 0.1))}
          style={mbtnStyle}
        >
          −
        </button>
        <button type="button" className="mbtn" onClick={reset} style={mbtnStyle}>
          ⌂
        </button>
      </div>
    </div>
  );
}

const mbtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  background: "var(--bg4)",
  border: "1px solid var(--border2)",
  borderRadius: 2,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  color: "var(--muted)",
  transition: "all 0.1s",
};
