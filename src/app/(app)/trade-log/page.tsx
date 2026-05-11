"use client";

import { useEffect, useState, useCallback } from "react";
import TradeForm from "@/components/trade-form";
import TradeTable from "@/components/trade-table";
import SummaryStats from "@/components/summary-stats";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Trade = any;

export default function TradeLogPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTrade, setEditTrade] = useState<Trade | null>(null);
    const [filters, setFilters] = useState({
        direction: "",
        process_tag: "",
        strategy: "",
        checklist: "",
    });

    const fetchTrades = useCallback(async () => {
        const params = new URLSearchParams();
        if (filters.direction) params.set("direction", filters.direction);
        if (filters.process_tag) params.set("process_tag", filters.process_tag);
        if (filters.strategy) params.set("strategy", filters.strategy);
        if (filters.checklist) params.set("checklist", filters.checklist);

        const res = await fetch(`/api/trades?${params}`);
        const data = await res.json();
        setTrades(data);
        setLoading(false);
    }, [filters]);

    useEffect(() => { fetchTrades(); }, [fetchTrades]);

    function handleEdit(trade: Trade) {
        setEditTrade({
            ...trade,
            entry_price: trade.entry_price?.toString() || "",
            exit_price: trade.exit_price?.toString() || "",
            size_contracts: trade.size_contracts?.toString() || "1",
            entry_time: trade.entry_time ? new Date(trade.entry_time).toTimeString().slice(0, 5) : "",
            exit_time: trade.exit_time ? new Date(trade.exit_time).toTimeString().slice(0, 5) : "",
        });
        setShowForm(true);
    }

    async function handleDelete(id: string) {
        await fetch("/api/trades", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchTrades();
    }

    function handleSaved() {
        setShowForm(false);
        setEditTrade(null);
        fetchTrades();
    }

    function handleFilterChange(key: string, value: string) {
        setFilters((f) => ({ ...f, [key]: value }));
    }

    return (
        <>
            <div className="pi">Legacy trade log preserved while the new Phase 1 system is built out.</div>

            <div className="max-w-[1200px] w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
                            Trade Log
                        </h1>
                        <p className="text-sm text-muted mt-1" style={{ fontFamily: "var(--font-serif-italic)", fontStyle: "italic" }}>
                            Every trade. Every decision.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="/api/export"
                            className="flex items-center gap-2 border border-border2 text-sm px-4 py-2 rounded-md hover:bg-bg3 hover:border-border3 transition-all font-medium shadow-sm"
                        >
                            ↓ Export CSV
                        </a>
                        {!showForm && (
                            <button
                                onClick={() => { setEditTrade(null); setShowForm(true); }}
                                className="flex items-center gap-2 bg-accent text-bg border border-accent text-sm px-4 py-2 rounded-md hover:bg-[#a6d848] transition-all font-bold shadow-sm"
                            >
                                + Add Trade
                            </button>
                        )}
                    </div>
                </div>

                <SummaryStats trades={trades} />

                {showForm && (
                    <TradeForm
                        editTrade={editTrade}
                        onSaved={handleSaved}
                        onCancel={() => { setShowForm(false); setEditTrade(null); }}
                    />
                )}

                <div className="flex items-center justify-between gap-4 mb-4 mt-8">
                    <div className="text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>Trade Entries</div>
                    <div className="text-sm font-medium text-muted2 bg-bg3 px-3 py-1 rounded-full border border-border">
                        {loading ? "loading..." : `${trades.length} trades`}
                    </div>
                </div>

                {!loading && (
                    <TradeTable
                        trades={trades}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                )}
            </div>
        </>
    );
}
