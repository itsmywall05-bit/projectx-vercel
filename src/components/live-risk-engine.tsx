"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";
import { getLivePriceForTrade, normalizePriceKey } from "@/lib/pricing";
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
}

export default function LiveRiskEngine({ trades }: { trades: Trade[] }) {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);

    // Filter open trades
    const openTrades = trades.filter(t => !t.exit_price);

    // Poll for live prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/prices");
                const data = await res.json();
                setPrices(data);
            } catch (e) { }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        getAllStrategies().then((loaded) => setStrategies(loaded));
    }, []);

    const normalizedPrices = useMemo(() => {
        const normalized: Record<string, number> = {};
        Object.entries(prices).forEach(([key, value]) => {
            normalized[normalizePriceKey(key)] = value;
        });
        return normalized;
    }, [prices]);

    if (openTrades.length === 0) return null;

    const sortedOpenTrades = [...openTrades].sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate totals for summary cards
    const totals = useMemo(() => {
        let totalOpen = 0;
        let totalCurr = 0;
        let totalMax = 0;
        let nearLimitCount = 0;

        sortedOpenTrades.forEach((t) => {
            const currentPrice = getLivePriceForTrade(t.instrument, t.product, normalizedPrices, strategies) ?? t.entry_price;
            const sl = t.sl_price || 0;
            const openRisk = Math.abs((sl - t.entry_price) * t.size_contracts);
            const currRisk = Math.abs((sl - currentPrice) * t.size_contracts);
            const maxRisk = Math.max(openRisk, currRisk);

            totalOpen += openRisk;
            totalCurr += currRisk;
            totalMax += maxRisk;

            if (t.risk_lt && maxRisk >= (t.risk_lt * 0.8)) nearLimitCount++;
        });

        return { totalOpen, totalCurr, totalMax, nearLimitCount };
    }, [sortedOpenTrades, normalizedPrices, strategies]);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 mt-8">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red animate-pulse shadow-[0_0_8px_rgba(255,87,87,0.8)]"></div>
                    <div className="text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>Live Risk Engine</div>
                </div>
                <div className="text-sm font-medium text-red bg-red/10 px-3 py-1 rounded-full border border-red/20">
                    {sortedOpenTrades.length} Open Positions
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
                    <strong>{totals.nearLimitCount}</strong> trade(s) near their risk limit (>= 80%)
                </div>
            )}

            <div className="bg-bg3 border border-red/20 rounded-lg shadow-[0_0_15px_rgba(255,87,87,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-bg4">
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Instrument</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Dir / Size</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Entry</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">SL</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Current</th>
                                <th className="text-right text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Open Risk</th>
                                <th className="text-right text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Curr Risk</th>
                                <th className="text-right text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Max Risk</th>
                                <th className="text-right text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Risk Lt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOpenTrades.map((t, idx) => {
                                const currentPrice = getLivePriceForTrade(t.instrument, t.product, normalizedPrices, strategies) ?? t.entry_price;
                                const sl = t.sl_price || 0;

                                const openRisk = (sl - t.entry_price) * t.size_contracts;
                                const currRisk = (sl - currentPrice) * t.size_contracts;
                                const maxRisk = Math.max(openRisk, currRisk);

                                const nearLimit = t.risk_lt ? (maxRisk >= (t.risk_lt * 0.8)) : false;

                                return (
                                    <tr key={t.id} className={`hover:bg-bg4 transition-colors ${nearLimit ? 'bg-amber/5' : ''}`}>
                                        <td className="px-4 py-3 text-sm text-text border-b border-border">
                                            <span className="font-semibold">{t.instrument}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm border-b border-border">
                                            <span className={t.direction === "Long" ? "text-teal font-medium" : "text-red font-medium"}>{t.direction}</span>
                                            <span className="text-muted ml-2">x{t.size_contracts}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.entry_price}</td>
                                        <td className="px-4 py-3 text-sm text-red font-medium border-b border-border">{sl || "—"}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-accent border-b border-border">{currentPrice}</td>
                                        <td className="px-4 py-3 text-sm text-right border-b border-border font-medium">
                                            {openRisk.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right border-b border-border font-bold text-amber">
                                            {currRisk.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right border-b border-border font-medium text-text2">
                                            {maxRisk.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right border-b border-border font-semibold">
                                            {t.risk_lt || "—"}
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
