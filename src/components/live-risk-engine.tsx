"use client";

import { useEffect, useState } from "react";

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
    
    // Filter open trades
    const openTrades = trades.filter(t => !t.exit_price);

    // Poll for live prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/prices");
                const data = await res.json();
                setPrices(data);
            } catch (e) {}
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 2000);
        return () => clearInterval(interval);
    }, []);

    if (openTrades.length === 0) return null;

    // Sorting - usually by date/time, newest last? The user said "they should be sorted".
    // We'll sort by date ascending so 1st is oldest, 5th is newest.
    const sortedOpenTrades = [...openTrades].sort((a, b) => a.date.localeCompare(b.date));

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
                                const currentPrice = prices[t.instrument] || t.entry_price; // fallback to entry if no live price
                                const sl = t.sl_price || 0;
                                
                                const openRisk = (sl - t.entry_price) * t.size_contracts;
                                const currRisk = (sl - currentPrice) * t.size_contracts;
                                const maxRisk = Math.max(openRisk, currRisk);
                                
                                return (
                                    <tr key={t.id} className="hover:bg-bg4 transition-colors">
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
        </div>
    );
}
