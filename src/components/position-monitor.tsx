"use client";

import React, { useEffect, useMemo, useState } from "react";
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

interface Contribution {
    instrument: string;   // e.g. "CL Aug26 D"
    direction: string;    // "Long" | "Short"
    size: number;         // original contracts
    amount: number;       // signed fly units contributed
}

interface FlyUnit {
    displayKey: string;
    sortKey: string;
    flyStep: number;
    net: number;
    contributions: Contribution[];
}

interface SpreadUnit {
    displayKey: string;
    sortKey: string;
    net: number;
    contributions: Contribution[];
}

function formatAnchor(anchor: string): string {
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
    const r = Math.round(n * 100) / 100;
    return r > 0 ? `+${r}` : `${r}`;
}

// % of the fly's net attributable to this contribution (can exceed 100% if trades offset)
function pctLabel(amount: number, net: number): string {
    if (net === 0) return "";
    const pct = (amount / net) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

export default function PositionMonitor({ fetchInterval = 3000 }: { fetchInterval?: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    function toggleExpand(key: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

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
                if (parts.length < 3) return;

                const anchor = parts[1];
                const stratIdRaw = parts.slice(2).join(" ");
                const sign = (t.direction || "").toLowerCase() === "long" ? 1 : -1;
                const size = Number(t.size_contracts) || 0;
                const scaledSize = sign * size;

                const parsed = parseStrategyId(stratIdRaw);
                if (!parsed.symbol) return;

                const strat = strategies.find((s) =>
                    s.sym.toUpperCase() === parsed.symbol.toUpperCase() ||
                    s.id.toUpperCase() === parsed.symbol.toUpperCase()
                );
                if (!strat || strat.tier === null) return;

                const tier = strat.tier;
                const step = parsed.step;
                const contrib: Omit<Contribution, "amount"> = {
                    instrument: t.instrument,
                    direction: t.direction,
                    size,
                };

                if (tier === 0) {
                    const label = step === 1
                        ? `${formatAnchor(anchor)} S`
                        : `${formatAnchor(anchor)} ${step}mS`;
                    const key = `${anchorSortKey(anchor)}_${step}S`;
                    const existing = spreadMap.get(key) ?? { displayKey: label, sortKey: key, net: 0, contributions: [] };
                    existing.net += scaledSize;
                    existing.contributions.push({ ...contrib, amount: scaledSize });
                    existing.contributions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
                    spreadMap.set(key, existing);
                    return;
                }

                // tier ≥ 1: decompose using diffLegs(tier − 1)
                const flyCoeffs = diffLegs(tier - 1);
                for (let i = 0; i < flyCoeffs.length; i++) {
                    const flyAnchor = addMonthsToAnchor(anchor, i * step);
                    if (!flyAnchor) return;
                    const label = step === 1
                        ? `${formatAnchor(flyAnchor)} F`
                        : `${formatAnchor(flyAnchor)} ${step}mF`;
                    const key = `${anchorSortKey(flyAnchor)}_${step}F`;
                    const amount = scaledSize * flyCoeffs[i];
                    const existing = flyMap.get(key) ?? { displayKey: label, sortKey: key, flyStep: step, net: 0, contributions: [] };
                    existing.net += amount;
                    existing.contributions.push({ ...contrib, amount });
                    existing.contributions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
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

    function renderBreakdown(contributions: Contribution[], net: number) {
        return contributions.map((c, i) => {
            const pct = pctLabel(c.amount, net);
            const dirTag = c.direction.toLowerCase() === "long" ? "L" : "S";
            const isPositive = c.amount > 0;
            return (
                <tr key={i} className="border-t border-border/30">
                    <td />
                    <td className="py-1 pl-3 font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                        {c.instrument} · {dirTag}×{c.size}
                    </td>
                    <td className="py-1 text-right" style={{ fontSize: 10 }}>
                        <span style={{ color: isPositive ? "var(--teal)" : "var(--red)", opacity: 0.8 }}>
                            {fmt(c.amount)}
                        </span>
                        <span className="ml-1.5" style={{ color: "var(--muted)", fontSize: 9 }}>
                            {pct}
                        </span>
                    </td>
                </tr>
            );
        });
    }

    function FlyTable({ rows }: { rows: FlyUnit[] }) {
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs" style={{ color: "var(--muted)" }}>
                        <th className="text-left pb-1 w-4" />
                        <th className="text-left pb-1">Fly</th>
                        <th className="text-right pb-1">Net</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((f) => {
                        const open = expanded.has(f.sortKey);
                        return (
                            <React.Fragment key={f.sortKey}>
                                <tr className="border-t border-border cursor-pointer select-none hover:bg-bg4/40 transition-colors" onClick={() => toggleExpand(f.sortKey)}>
                                    <td className="pt-2 pb-0.5 pr-1 w-4">
                                        <span style={{ color: "var(--muted)", fontSize: 9, display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                                            ▶
                                        </span>
                                    </td>
                                    <td className="pt-2 pb-0.5 font-mono text-xs font-semibold">{f.displayKey}</td>
                                    <td className={`pt-2 pb-0.5 text-right font-semibold text-xs ${f.net > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {fmt(f.net)}
                                    </td>
                                </tr>
                                {open && renderBreakdown(f.contributions, f.net)}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    function SpreadTable({ rows }: { rows: SpreadUnit[] }) {
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs" style={{ color: "var(--muted)" }}>
                        <th className="text-left pb-1 w-4" />
                        <th className="text-left pb-1">Spread</th>
                        <th className="text-right pb-1">Net</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((s) => {
                        const open = expanded.has(s.sortKey);
                        return (
                            <React.Fragment key={s.sortKey}>
                                <tr className="border-t border-border cursor-pointer select-none hover:bg-bg4/40 transition-colors" onClick={() => toggleExpand(s.sortKey)}>
                                    <td className="pt-2 pb-0.5 pr-1 w-4">
                                        <span style={{ color: "var(--muted)", fontSize: 9, display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                                            ▶
                                        </span>
                                    </td>
                                    <td className="pt-2 pb-0.5 font-mono text-xs font-semibold">{s.displayKey}</td>
                                    <td className={`pt-2 pb-0.5 text-right font-semibold text-xs ${s.net > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {fmt(s.net)}
                                    </td>
                                </tr>
                                {open && renderBreakdown(s.contributions, s.net)}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    return (
        <section className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Position Monitor (fly-normalised)</h3>
            <div className="bg-bg3 border rounded p-3 space-y-5">
                {flies.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                            Fly Units
                        </div>
                        <FlyTable rows={flies} />
                    </div>
                )}
                {spreads.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                            Spread Units
                        </div>
                        <SpreadTable rows={spreads} />
                    </div>
                )}
            </div>
        </section>
    );
}
