"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllStrategies, diffLegs, type TaxonomyStrategy } from "@/lib/taxonomy";
import { addMonthsToAnchor, parseStrategyId } from "@/lib/pricing";

type Trade = {
    id: string;
    product: string;
    instrument: string;
    direction: string;
    size_contracts: number;
    exit_price?: number | null;
};

interface FlyUnit {
    displayKey: string;
    sortKey: string;
    flyStep: number;
    net: number;
}

interface SpreadUnit {
    displayKey: string;
    sortKey: string;
    net: number;
}

function formatAnchor(anchor: string): string {
    // "DEC26" → "Dec26"
    if (anchor.length < 3) return anchor;
    return anchor[0].toUpperCase() + anchor.slice(1, 3).toLowerCase() + anchor.slice(3);
}

function anchorSortKey(anchor: string): string {
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const m = anchor.toUpperCase().match(/^([A-Z]{3})(\d{2,4})$/);
    if (!m) return anchor;
    const mi = MONTHS.indexOf(m[1]);
    const yr = m[2].length === 2 ? `20${m[2]}` : m[2];
    return `${yr}${mi.toString().padStart(2, "0")}`;
}

function fmt(n: number): string {
    const rounded = Math.round(n * 100) / 100;
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export default function PositionMonitor({ fetchInterval = 3000 }: { fetchInterval?: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const r = await fetch("/api/trades");
                const td = await r.json();
                if (mounted) setTrades(Array.isArray(td) ? td : []);
            } catch { }
        };
        load();
        const id = setInterval(load, fetchInterval);
        getAllStrategies().then((s) => { if (mounted) setStrategies(s); });
        return () => { mounted = false; clearInterval(id); };
    }, [fetchInterval]);

    const { flies, spreads } = useMemo(() => {
        const flyMap = new Map<string, FlyUnit>();
        const spreadMap = new Map<string, SpreadUnit>();

        trades
            .filter((t) => !t.exit_price)
            .forEach((t) => {
                const parts = (t.instrument || "").trim().split(/\s+/);
                // Need at least: product + anchor + strategyId
                if (parts.length < 3) return;

                const anchor = parts[1];
                const stratIdRaw = parts.slice(2).join(" ");
                const sign = (t.direction || "").toLowerCase() === "long" ? 1 : -1;
                const size = Number(t.size_contracts) || 0;
                const scaledSize = sign * size;

                const parsed = parseStrategyId(stratIdRaw);
                if (!parsed.symbol) return;

                // Match by sym (tower) or id — handles both "FF" and "3MFF"
                const strat = strategies.find((s) =>
                    s.sym.toUpperCase() === parsed.symbol.toUpperCase() ||
                    s.id.toUpperCase() === parsed.symbol.toUpperCase()
                );
                if (!strat || strat.tier === null) return;

                const tier = strat.tier;
                const step = parsed.step;

                if (tier === 0) {
                    // Spread — keep as-is
                    const label = step === 1
                        ? `${formatAnchor(anchor)} S`
                        : `${formatAnchor(anchor)} ${step}mS`;
                    const key = `${anchorSortKey(anchor)}_${step}S`;
                    const existing = spreadMap.get(key) ?? { displayKey: label, sortKey: key, net: 0 };
                    existing.net += scaledSize;
                    spreadMap.set(key, existing);
                    return;
                }

                // tier ≥ 1: decompose into fly units
                // fly coefficients = diffLegs(tier - 1)
                //   tier=1 (F)  → diffLegs(0) = [1]       → 1 fly at base
                //   tier=2 (FF) → diffLegs(1) = [1,-1]    → 2 flies
                //   tier=3 (D)  → diffLegs(2) = [1,-2,1]  → 3 flies
                const flyCoeffs = diffLegs(tier - 1);
                for (let i = 0; i < flyCoeffs.length; i++) {
                    const flyAnchor = addMonthsToAnchor(anchor, i * step);
                    if (!flyAnchor) return;
                    const label = step === 1
                        ? `${formatAnchor(flyAnchor)} F`
                        : `${formatAnchor(flyAnchor)} ${step}mF`;
                    const key = `${anchorSortKey(flyAnchor)}_${step}F`;
                    const existing = flyMap.get(key) ?? { displayKey: label, sortKey: key, flyStep: step, net: 0 };
                    existing.net += scaledSize * flyCoeffs[i];
                    flyMap.set(key, existing);
                }
            });

        return {
            flies: Array.from(flyMap.values())
                .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                .filter((v) => v.net !== 0),
            spreads: Array.from(spreadMap.values())
                .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                .filter((v) => v.net !== 0),
        };
    }, [trades, strategies]);

    if (flies.length === 0 && spreads.length === 0) return null;

    return (
        <section className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Position Monitor (fly-normalised)</h3>
            <div className="bg-bg3 border rounded p-3 space-y-5">
                {flies.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                            Fly Units
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs" style={{ color: "var(--muted)" }}>
                                    <th className="text-left pb-1">Fly</th>
                                    <th className="text-right pb-1">Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flies.map((f) => (
                                    <tr key={f.sortKey} className="border-t border-border">
                                        <td className="py-1.5 font-mono text-xs">{f.displayKey}</td>
                                        <td className={`py-1.5 text-right font-semibold ${f.net > 0 ? "text-green-500" : "text-red-500"}`}>
                                            {fmt(f.net)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {spreads.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                            Spread Units
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs" style={{ color: "var(--muted)" }}>
                                    <th className="text-left pb-1">Spread</th>
                                    <th className="text-right pb-1">Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spreads.map((s) => (
                                    <tr key={s.sortKey} className="border-t border-border">
                                        <td className="py-1.5 font-mono text-xs">{s.displayKey}</td>
                                        <td className={`py-1.5 text-right font-semibold ${s.net > 0 ? "text-green-500" : "text-red-500"}`}>
                                            {fmt(s.net)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
