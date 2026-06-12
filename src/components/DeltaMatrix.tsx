"use client";

import { useMemo, useState } from "react";
import TaxonomyDropdown from "@/components/ui/TaxonomyDropdown";
import { useLivePrices } from "@/hooks/useLivePrices";
import { addMonthsToAnchor } from "@/lib/pricing";
import { Card, SectionHeader } from "@/components/ui";

const FUTURES_CODE: Record<string, string> = {
  JAN: "F", FEB: "G", MAR: "H", APR: "J", MAY: "K", JUN: "M",
  JUL: "N", AUG: "Q", SEP: "U", OCT: "V", NOV: "X", DEC: "Z",
};

function toFuturesCode(anchorMonth: string): string {
  const m = anchorMonth.toUpperCase().match(/^([A-Z]{3})(\d{2})$/);
  if (!m) return anchorMonth;
  const code = FUTURES_CODE[m[1]];
  if (!code) return anchorMonth;
  return `${code}${m[2].slice(-1)}`; // "Jul26" → "N6"
}

function cellBg(value: number, maxAbs: number): string {
  if (value === 0 || maxAbs === 0) return "transparent";
  const t = Math.max(-1, Math.min(1, value / maxAbs));
  if (t > 0) return `rgba(45,212,191,${0.12 + Math.abs(t) * 0.78})`;
  return `rgba(239,68,68,${0.12 + Math.abs(t) * 0.78})`;
}

function cellFg(value: number, maxAbs: number): string {
  if (maxAbs === 0) return "var(--muted)";
  return Math.abs(value / maxAbs) > 0.45 ? "#fff" : "var(--text2)";
}

interface Outright {
  anchorMonth: string;
  delta: number | null; // last - settle; null when settle is unavailable
  code: string;
  expiryDate: string;
}

export default function DeltaMatrix() {
  const { rawPrices, strategies: allStrategies } = useLivePrices();
  const [selectedProduct, setSelectedProduct] = useState("CL");
  const [selectedIds, setSelectedIds] = useState<string[]>(["S", "F", "FF", "D"]);

  const products = useMemo(() => {
    const set = new Set<string>();
    Object.values(rawPrices).forEach((v) => {
      const rec = v as typeof v & { product?: string; anchor_month?: string };
      if (rec?.product && rec?.anchor_month) set.add(rec.product);
    });
    return Array.from(set).sort();
  }, [rawPrices]);

  // Deduplicated outrights for selected product, sorted front→back
  const outrights = useMemo((): Outright[] => {
    const seen = new Set<string>();
    const result: Outright[] = [];
    Object.values(rawPrices).forEach((v) => {
      const rec = v as typeof v & {
        product?: string; anchor_month?: string; expiry_date?: string;
      };
      if (rec?.product !== selectedProduct || !rec?.anchor_month || !rec?.expiry_date) return;
      const key = (rec.anchor_month as string).toUpperCase();
      if (seen.has(key)) return;
      seen.add(key);
      const full = v as { last?: number; settle?: number | null };
      const last = Number(full.last ?? 0);
      const settle = full.settle != null ? Number(full.settle) : null;
      result.push({
        anchorMonth: rec.anchor_month as string,
        delta: settle !== null ? Math.round((last - settle) * 10000) / 10000 : null,
        code: toFuturesCode(rec.anchor_month as string),
        expiryDate: rec.expiry_date as string,
      });
    });
    return result.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }, [rawPrices, selectedProduct]);

  // Map of anchorMonth → delta; months with no settle data are absent
  const deltaByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    outrights.forEach((o) => { if (o.delta !== null) map[o.anchorMonth.toUpperCase()] = o.delta; });
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

  const strategies = useMemo(
    () => selectedIds.length === 0
      ? availableStrategies
      : availableStrategies.filter((s) => selectedIds.includes(s.id)),
    [availableStrategies, selectedIds],
  );

  const matrix = useMemo(() => {
    return strategies.map((strat) => ({
      strat,
      cells: outrights.map((anchor, col) => {
        const { legs } = strat;
        if (col + legs.length > outrights.length) return null;
        let val = 0;
        for (let i = 0; i < legs.length; i++) {
          const mk = addMonthsToAnchor(anchor.anchorMonth, i);
          if (!mk) return null;
          const p = deltaByMonth[mk.toUpperCase()];
          if (p === undefined) return null;
          val += legs[i] * p;
        }
        return Math.round(val * 100) / 100;
      }),
    }));
  }, [strategies, outrights, deltaByMonth]);

  const maxAbs = useMemo(() => {
    let m = 0.001;
    matrix.forEach((row) => row.cells.forEach((v) => { if (v !== null) m = Math.max(m, Math.abs(v)); }));
    return m;
  }, [matrix]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <SectionHeader title={`${selectedProduct} Delta Matrix`} />
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "var(--muted)" }}>Product</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="border border-border rounded px-2 py-1 text-sm focus:outline-none"
              style={{ backgroundColor: "var(--bg3)" }}
            >
              {(products.length ? products : ["CL"]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5" style={{ minWidth: 180 }}>
            <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>Structures</span>
            <TaxonomyDropdown
              multi
              value={selectedIds}
              onChange={setSelectedIds}
              strategies={availableStrategies}
              placeholder="All"
            />
          </div>
        </div>
      </div>

      {outrights.length === 0 ? (
        <div className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
          No outright price data for {selectedProduct}.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="border-collapse" style={{ fontSize: 11, fontFamily: "monospace", minWidth: "max-content" }}>
              <thead>
                <tr>
                  <th className="pr-3 pb-1 text-right font-normal" style={{ color: "var(--muted)", width: 40 }} />
                  {outrights.map((o, i) => (
                    <th key={i} className="px-0.5 pb-1 text-center font-normal" style={{ color: "var(--muted)", minWidth: 44 }}>
                      {o.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(({ strat, cells }) => (
                  <tr key={strat.id}>
                    <td className="pr-3 py-px text-right font-semibold" style={{ color: "var(--accent)" }}>
                      {strat.id}
                    </td>
                    {cells.map((v, i) => (
                      <td
                        key={i}
                        className="px-0.5 py-px text-center"
                        style={{
                          backgroundColor: v !== null ? cellBg(v, maxAbs) : "transparent",
                          color: v !== null ? cellFg(v, maxAbs) : "transparent",
                          borderRadius: 2,
                        }}
                      >
                        {v !== null ? v.toFixed(2) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4" style={{ fontSize: 11, color: "var(--muted)" }}>
            <span>-{maxAbs.toFixed(2)}</span>
            <div
              className="h-2 rounded"
              style={{
                width: 80,
                background: "linear-gradient(to right, rgba(239,68,68,0.9), rgba(0,0,0,0.1), rgba(45,212,191,0.9))",
              }}
            />
            <span>+{maxAbs.toFixed(2)}</span>
          </div>
        </>
      )}
    </Card>
  );
}
