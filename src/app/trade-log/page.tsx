"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/app-shell";
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
    <AppShell>
      <div className="max-w-[1100px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-heading font-semibold text-[16px] text-text">Trade Log</h1>
            <p className="text-[10px] text-muted mt-0.5 font-serif italic">Every trade. Every decision.</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/export"
              className="border border-border2 text-muted text-[10px] px-3 py-1.5 rounded hover:text-text hover:border-border3 transition-colors"
            >
              ↓ Export CSV
            </a>
            {!showForm && (
              <button
                onClick={() => { setEditTrade(null); setShowForm(true); }}
                className="bg-accent/10 border border-accent/20 text-accent text-[10px] px-3 py-1.5 rounded hover:bg-accent/15 transition-colors"
              >
                + Add Trade
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <SummaryStats trades={trades} />

        {/* Form (conditional) */}
        {showForm && (
          <TradeForm
            editTrade={editTrade}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditTrade(null); }}
          />
        )}

        {/* Trade count */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[11px] font-heading font-semibold text-text">Trade Entries</div>
          <div className="flex-1 h-px bg-border" />
          <div className="text-[9px] text-muted">{loading ? "loading..." : `${trades.length} trades`}</div>
        </div>

        {/* Table */}
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
    </AppShell>
  );
}
