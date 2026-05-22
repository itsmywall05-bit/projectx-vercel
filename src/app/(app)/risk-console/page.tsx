"use client";

import React, { useEffect, useMemo, useState } from "react";

type Trade = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entry: number;
  mark: number;
  pnl: number;
  openedAt: string;
};

export default function RiskConsolePage() {
  const [summary, setSummary] = useState({ totalPnl: 0, openPositions: 0, marginUsedPct: 0 });
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Replace with real API calls as needed. Mock data for client-side preview.
    setSummary({ totalPnl: 12450.5, openPositions: 3, marginUsedPct: 32.4 });
    setTrades([
      { id: "T-001", symbol: "AAPL", side: "LONG", size: 50, entry: 170.5, mark: 172.1, pnl: 80, openedAt: "2026-05-21T10:12:00Z" },
      { id: "T-002", symbol: "ES", side: "SHORT", size: 1, entry: 5200.0, mark: 5192.5, pnl: 75, openedAt: "2026-05-22T09:03:00Z" },
      { id: "T-003", symbol: "BTC-USD", side: "LONG", size: 0.1, entry: 56000, mark: 55800, pnl: -200, openedAt: "2026-05-22T16:21:00Z" },
    ]);
  }, []);

  const totalPnL = useMemo(() => summary.totalPnl, [summary]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Risk Console</h1>
        <p className="text-sm text-muted-foreground">Overview of live P&L, open trades and risk tools.</p>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Total P&L (Today)</div>
          <div className="text-xl font-medium">${totalPnL.toLocaleString()}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Open Positions</div>
          <div className="text-xl font-medium">{summary.openPositions}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Margin Used</div>
          <div className="text-xl font-medium">{summary.marginUsedPct}%</div>
        </div>
      </section>

      {/* Open trades table */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Open Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="py-2">ID</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry</th>
                <th>Mark</th>
                <th>P&L</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="py-2 text-sm">{t.id}</td>
                  <td className="font-medium">{t.symbol}</td>
                  <td className={t.side === "LONG" ? "text-green-600" : "text-red-600"}>{t.side}</td>
                  <td>{t.size}</td>
                  <td>{t.entry}</td>
                  <td>{t.mark}</td>
                  <td className={`${t.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>{t.pnl >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}</td>
                  <td className="text-sm text-muted-foreground">{new Date(t.openedAt).toLocaleString()}</td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-muted-foreground">No open trades</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Position monitor placeholder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4 min-h-[200px]">
          <h3 className="font-semibold mb-2">Position Monitor</h3>
          <p className="text-sm text-muted-foreground">Live position visualizations and per-instrument exposure go here.</p>
          <div className="mt-4 border rounded p-3 text-center text-sm text-muted-foreground">[Position Monitor Placeholder]</div>
        </div>

        {/* Risk calculator placeholder */}
        <div className="bg-white rounded shadow p-4 min-h-[200px]">
          <h3 className="font-semibold mb-2">Risk Calculator</h3>
          <p className="text-sm text-muted-foreground">Quick position sizing and impact analysis tool.</p>
          <div className="mt-4 border rounded p-3 text-center text-sm text-muted-foreground">[Risk Calculator Placeholder]</div>
        </div>
      </section>
    </div>
  );
}
