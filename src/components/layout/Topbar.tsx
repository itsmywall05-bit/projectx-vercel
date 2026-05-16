"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useSidebar } from "./SidebarContext";

const TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/mind-feed": "Mind Feed",
  "/the-map": "The Map",
  "/plan/trading": "Trading Plan",
  "/plan/general": "General Plan",
  "/instruments": "Instruments",
  "/strategy-vault": "Strategy Vault",
  "/playbook": "Playbook",
  "/backtest": "Backtesting",
  "/trade-log": "Trade Log",
  "/products": "Products",
  "/risk-console": "Risk Console",
  "/performance": "Performance Lab",
  "/market-context": "Market Context",
  "/watchlist": "Watchlist Engine",
  "/feedback": "Feedback Loop",
  "/side-brain": "Side Brain",
  "/learning": "Learning Engine",
  "/data-conn": "Data Connectivity",
  "/deferred": "Deferred Queue",
  "/backlog": "Feature Backlog",
  "/blueprint": "Blueprint",
};

export default function Topbar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const { toggle } = useSidebar();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const title = TITLES[pathname] ?? "Overview";

  return (
    <div
      style={{
        height: 46,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        background: "var(--bg2)",
        flexShrink: 0,
      }}
    >
      <button 
        className="md:hidden flex items-center justify-center p-1 text-muted hover:text-text"
        onClick={toggle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--muted)" }}>
        <span className="hidden sm:inline">projectX</span>
        <span className="hidden sm:inline" style={{ color: "var(--muted2)" }}>/</span>
        <span style={{ color: "var(--text)", fontSize: 11.5, fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontSize: 8.5,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "rgba(184,240,80,0.07)",
            border: "1px solid rgba(184,240,80,0.15)",
            padding: "2px 9px",
            borderRadius: 2,
          }}
        >
          Phase 0 → 1
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)" }}>
          {now ? now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </div>
        <div style={{ fontSize: 10, color: "var(--muted2)" }}>
          {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
        </div>
      </div>
    </div>
  );
}
