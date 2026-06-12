"use client";

import { useMemo, useRef, useState } from "react";
import type { TaxonomyStrategy } from "@/lib/taxonomy";
import { useLivePrices } from "@/hooks/useLivePrices";
import { addMonthsToAnchor } from "@/lib/pricing";
import { Card, SectionHeader } from "@/components/ui";
import TaxonomyDropdown from "@/components/ui/TaxonomyDropdown";

const FUTURES_CODE: Record<string, string> = {
  JAN: "F", FEB: "G", MAR: "H", APR: "J", MAY: "K", JUN: "M",
  JUL: "N", AUG: "Q", SEP: "U", OCT: "V", NOV: "X", DEC: "Z",
};

function toFuturesCode(anchorMonth: string): string {
  const m = anchorMonth.toUpperCase().match(/^([A-Z]{3})(\d{2})$/);
  if (!m) return anchorMonth;
  const code = FUTURES_CODE[m[1]];
  return code ? `${code}${m[2].slice(-1)}` : anchorMonth;
}

interface Outright {
  anchorMonth: string;
  last: number;
  code: string;
  expiryDate: string;
}

interface CurvePoint {
  code: string;
  value: number;
}

const TOOLTIP_W = 52, TOOLTIP_H = 28;

function StructureCurve({ strat, points }: { strat: TaxonomyStrategy; points: CurvePoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  // Suppress TS "unused" warning — useRef used to keep hover target stable
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length < 2) {
    return (
      <div className="p-3 text-xs text-center" style={{ color: "var(--muted)" }}>
        Not enough outrights for {strat.sym}
      </div>
    );
  }

  const W = 560, H = 60;
  const PAD = { top: 7, right: 8, bottom: 14, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 0.0001;
  const pad = range * 0.12;

  const mapX = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const mapY = (v: number) => PAD.top + (1 - (v - (min - pad)) / (range + pad * 2)) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(i).toFixed(1)} ${mapY(p.value).toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${mapX(points.length - 1).toFixed(1)} ${(H - PAD.bottom).toFixed(1)} L ${PAD.left.toFixed(1)} ${(H - PAD.bottom).toFixed(1)} Z`;

  const zeroY = mapY(0);
  const showZero = min - pad < 0 && max + pad > 0;

  const labelEvery = Math.max(1, Math.ceil(points.length / 10));

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="font-semibold font-mono" style={{ fontSize: 10, color: "var(--accent)" }}>{strat.id}</span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>{strat.name}</span>
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`fill-${strat.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`clip-${strat.id}`}>
            <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {showZero && (
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY}
            stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3 3" />
        )}

        <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize={7.2} fill="var(--muted)">{max.toFixed(2)}</text>
        <text x={PAD.left - 4} y={H - PAD.bottom} textAnchor="end" fontSize={7.2} fill="var(--muted)">{min.toFixed(2)}</text>

        <path d={fillPath} fill={`url(#fill-${strat.id})`} clipPath={`url(#clip-${strat.id})`} />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const cx = mapX(i);
          const cy = mapY(p.value);
          const isHov = hovered === i;

          // Tooltip: keep within SVG bounds
          const tx = Math.min(Math.max(cx - TOOLTIP_W / 2, PAD.left), W - PAD.right - TOOLTIP_W);
          const ty = cy - TOOLTIP_H - 6;

          return (
            <g key={i}>
              {/* Invisible larger hit area */}
              <circle
                cx={cx} cy={cy} r={8}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Visible dot — grows on hover */}
              <circle cx={cx} cy={cy} r={isHov ? 4 : 2} fill="var(--accent)"
                style={{ pointerEvents: "none", transition: "r 0.1s" }} />

              {isHov && (
                <g style={{ pointerEvents: "none" }}>
                  {/* Vertical crosshair */}
                  <line x1={cx} y1={PAD.top} x2={cx} y2={H - PAD.bottom}
                    stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="2 2" />
                  {/* Tooltip bubble */}
                  <rect x={tx} y={ty} width={TOOLTIP_W} height={TOOLTIP_H} rx={4}
                    fill="rgba(20,20,28,0.92)" stroke="var(--accent)" strokeWidth={0.8} />
                  <text x={tx + TOOLTIP_W / 2} y={ty + 10} textAnchor="middle" fontSize={7.2} fill="var(--muted)">
                    {p.code}
                  </text>
                  <text x={tx + TOOLTIP_W / 2} y={ty + 22} textAnchor="middle" fontSize={9} fontWeight="600" fill="var(--accent)">
                    {p.value.toFixed(2)}
                  </text>
                </g>
              )}

              {i % labelEvery === 0 && (
                <text x={cx} y={H - 2} textAnchor="middle" fontSize={6.75} fill="var(--muted)"
                  style={{ pointerEvents: "none" }}>{p.code}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function CurveShapes({ product = "CL" }: { product?: string }) {
  const { rawPrices, strategies: allStrategies } = useLivePrices();

  const [selectedIds, setSelectedIds] = useState<string[]>(["S", "F"]);

  const outrights = useMemo((): Outright[] => {
    const seen = new Set<string>();
    const result: Outright[] = [];
    Object.values(rawPrices).forEach((v) => {
      const rec = v as typeof v & { product?: string; anchor_month?: string; expiry_date?: string };
      if (rec?.product !== product || !rec?.anchor_month || !rec?.expiry_date) return;
      const key = (rec.anchor_month as string).toUpperCase();
      if (seen.has(key)) return;
      seen.add(key);
      result.push({
        anchorMonth: rec.anchor_month as string,
        last: Number((v as { last?: number }).last ?? 0),
        code: toFuturesCode(rec.anchor_month as string),
        expiryDate: rec.expiry_date as string,
      });
    });
    return result.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }, [rawPrices, product]);

  const lastByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    outrights.forEach((o) => { map[o.anchorMonth.toUpperCase()] = o.last; });
    return map;
  }, [outrights]);

  const maxPossibleTier = Math.max(0, outrights.length - 2);
  const availableStrategies = useMemo(() => {
    const seen = new Set<string>();
    return allStrategies.filter((s) => {
      const effectiveTier = s.tier ?? (s.legs.length - 2);
      if (effectiveTier < 0 || effectiveTier > maxPossibleTier) return false;
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [allStrategies, maxPossibleTier]);

  // Derive curve points keyed by strategy id (not sym — multiple strategies can share a tower)
  const curvePoints = useMemo((): Map<string, CurvePoint[]> => {
    const result = new Map<string, CurvePoint[]>();
    availableStrategies.forEach((strat) => {
      const pts: CurvePoint[] = [];
      outrights.forEach((anchor, col) => {
        const { legs } = strat;
        if (col + legs.length > outrights.length) return;
        let val = 0;
        for (let i = 0; i < legs.length; i++) {
          const mk = addMonthsToAnchor(anchor.anchorMonth, i);
          if (!mk) return;
          const p = lastByMonth[mk.toUpperCase()];
          if (p === undefined) return;
          val += legs[i] * p;
        }
        pts.push({ code: anchor.code, value: Math.round(val * 10000) / 10000 });
      });
      result.set(strat.id, pts);
    });
    return result;
  }, [availableStrategies, outrights, lastByMonth]);

  const selectedStrategies = selectedIds.length === 0
    ? availableStrategies
    : availableStrategies.filter((s) => selectedIds.includes(s.id));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <SectionHeader title={`${product} Curve Shapes`} />
        <div style={{ minWidth: 180 }}>
          <TaxonomyDropdown
            multi
            value={selectedIds}
            onChange={setSelectedIds}
            strategies={availableStrategies}
            placeholder="All structures"
          />
        </div>
      </div>

      {outrights.length < 2 ? (
        <div className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
          No outright price data for {product}.
        </div>
      ) : selectedStrategies.length === 0 ? (
        <div className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
          Select at least one structure above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {selectedStrategies.map((strat) => (
            <StructureCurve
              key={strat.id}
              strat={strat}
              points={curvePoints.get(strat.id) ?? []}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
