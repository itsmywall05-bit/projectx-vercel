"use client";

import { useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import PositionMonitor from "@/components/position-monitor";

interface Trade {
    id: string;
    date: string;
    product: string;
    instrument: string;
    instrument_type: string;
    direction: string;
    entry_price: number;
    exit_price: number | null;
    sl_price: number | null;
    risk_lt: number | null;
    size_contracts: number;
    products: { tick_size: number; tick_value: number } | null;
}

export default function LiveRiskEngine({ trades }: { trades: Trade[] }) {
    const { getInstrumentPrice } = useLivePrices();

    const openTrades = useMemo(
        () => [...trades.filter((t) => !t.exit_price)].sort((a, b) => a.date.localeCompare(b.date)),
        [trades],
    );

    const totals = useMemo(() => {
        let totalOpen = 0, totalCurr = 0, totalMax = 0, nearLimitCount = 0;
        openTrades.forEach((t) => {
            const mark = getInstrumentPrice(t.instrument, t.product) ?? t.entry_price;
            const sl = t.sl_price ?? null;
            const tickSize = t.products?.tick_size || 1;
            const tickValue = t.products?.tick_value || 1;
            if (sl === null) return;
            const openRisk = Math.abs((t.entry_price - sl) / tickSize) * tickValue * t.size_contracts;
            const currRisk = Math.abs((mark - sl) / tickSize) * tickValue * t.size_contracts;
            const maxRisk = Math.max(openRisk, currRisk);
            totalOpen += openRisk;
            totalCurr += currRisk;
            totalMax += maxRisk;
            if (t.risk_lt && maxRisk >= t.risk_lt * 0.8) nearLimitCount++;
        });
        return { totalOpen, totalCurr, totalMax, nearLimitCount };
    }, [openTrades, getInstrumentPrice]);

    if (openTrades.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 mt-8">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]" />
                    <div className="text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>Live Risk Engine</div>
                </div>
                <div className="text-sm font-medium text-red bg-red/10 px-3 py-1 rounded-full border border-red/20">
                    {openTrades.length} Open Positions
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-bg3 border rounded p-3">
                    <div className="text-xs text-muted">Open Risk</div>
                    <div className="text-xl font-semibold">{totals.totalOpen.toFixed(2)}</div>
                </div>
                <div className="bg-bg3 border rounded p-3">
                    <div className="text-xs text-muted">Current Risk</div>
                    <div className="text-xl font-semibold">{totals.totalCurr.toFixed(2)}</div>
                </div>
                <div className="bg-bg3 border rounded p-3">
                    <div className="text-xs text-muted">Aggregated Max Risk</div>
                    <div className="text-xl font-semibold">{totals.totalMax.toFixed(2)}</div>
                </div>
            </div>

            {totals.nearLimitCount > 0 && (
                <div className="mb-4 p-3 bg-amber/10 border border-amber/20 rounded">
                    <strong>{totals.nearLimitCount}</strong> trade(s) near their risk limit (&gt;= 80%)
                </div>
            )}

            <div className="bg-bg3 border border-red/20 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-bg4">
                                {["Instrument", "Dir / Size", "Entry", "SL", "Mark", "Open Risk", "Curr Risk", "Max Risk", "Risk Lt", "Max Lots"].map((h, i) => (
                                    <th key={h} className={`text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold ${i >= 5 ? "text-right" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {openTrades.map((t) => {
                                const mark = getInstrumentPrice(t.instrument, t.product) ?? t.entry_price;
                                const sl = t.sl_price ?? null;
                                const tickSize = t.products?.tick_size || 1;
                                const tickValue = t.products?.tick_value || 1;

                                const openRisk = sl !== null ? Math.abs((t.entry_price - sl) / tickSize) * tickValue * t.size_contracts : null;
                                const currRisk = sl !== null ? Math.abs((mark - sl) / tickSize) * tickValue * t.size_contracts : null;
                                const maxRisk = openRisk !== null && currRisk !== null ? Math.max(openRisk, currRisk) : null;
                                const nearLimit = t.risk_lt && maxRisk !== null ? maxRisk >= t.risk_lt * 0.8 : false;

                                // Max lots: how many contracts fit within risk_lt at the entry→SL distance
                                const riskPerLot = sl !== null ? Math.abs((t.entry_price - sl) / tickSize) * tickValue : null;
                                const maxLots = t.risk_lt && riskPerLot && riskPerLot > 0
                                    ? Math.floor(t.risk_lt / riskPerLot)
                                    : null;

                                return (
                                    <tr key={t.id} className={`hover:bg-bg4 transition-colors ${nearLimit ? "bg-amber/5" : ""}`}>
                                        <td className="px-4 py-3 text-sm font-semibold border-b border-border">{t.instrument}</td>
                                        <td className="px-4 py-3 text-sm border-b border-border">
                                            <span className={t.direction === "Long" ? "text-teal font-medium" : "text-red font-medium"}>{t.direction}</span>
                                            <span className="text-muted ml-2">x{t.size_contracts}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.entry_price}</td>
                                        <td className="px-4 py-3 text-sm text-red font-medium border-b border-border">{sl ?? "—"}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-accent border-b border-border">{mark.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium border-b border-border">{openRisk !== null ? openRisk.toFixed(2) : "—"}</td>
                                        <td className="px-4 py-3 text-sm text-right font-bold text-amber border-b border-border">{currRisk !== null ? currRisk.toFixed(2) : "—"}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-text2 border-b border-border">{maxRisk !== null ? maxRisk.toFixed(2) : "—"}</td>
                                        <td className="px-4 py-3 text-sm text-right font-semibold border-b border-border">{t.risk_lt ?? "—"}</td>
                                        <td className="px-4 py-3 text-sm text-right font-semibold border-b border-border" style={{ color: maxLots !== null ? "var(--accent)" : "var(--muted)" }}>
                                            {maxLots !== null ? maxLots : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <PositionMonitor />
        </div>
    );
}
