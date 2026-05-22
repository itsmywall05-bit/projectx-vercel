"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";
import { getLivePriceForTrade, normalizePriceKey, type PriceRecord } from "@/lib/pricing";

type TradeRecord = {
  id: string;
  instrument: string;
  product?: string | null;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  size_contracts: number;
  sl_price?: number | null;
  risk_lt?: number | null;
  date?: string;
  created_at?: string;
  products?: {
    tick_size: number;
    tick_value: number;
  } | null;
};

const TOTAL_CAPITAL = 100000;

export default function RiskConsolePage() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [prices, setPrices] = useState<Record<string, number | PriceRecord>>({});
  const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      setPrices(data ?? {});
      setError(null);
    } catch (err) {
      setError("Unable to load live prices");
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch("/api/trades");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrades(data.filter((trade) => !trade.exit_price));
      } else {
        setTrades([]);
      }
      setError(null);
    } catch (err) {
      setError("Unable to load trades");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllStrategies().then(setStrategies).catch(() => setStrategies([]));
    fetchTrades();
    fetchPrices();
    const interval = setInterval(() => {
      fetchTrades();
      fetchPrices();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchTrades, fetchPrices]);

  const normalizedPrices = useMemo(() => {
    const normalized: Record<string, number> = {};
    Object.entries(prices).forEach(([key, value]) => {
      normalized[normalizePriceKey(key)] = typeof value === "number" ? value : value.last;
    });
    return normalized;
  }, [prices]);

  const enrichedTrades = useMemo(() => {
    return trades.map((trade) => {
      const currentPrice = getLivePriceForTrade(trade.instrument, trade.product ?? "", normalizedPrices, strategies) ?? trade.entry_price;
      const directionFactor = trade.direction?.toLowerCase() === "long" ? 1 : -1;
      const pnl = Number(((currentPrice - trade.entry_price) * trade.size_contracts * directionFactor).toFixed(2));

      return {
        id: trade.id,
        symbol: trade.instrument,
        side: trade.direction?.toUpperCase() === "SHORT" ? "SHORT" : "LONG",
        size: trade.size_contracts,
        entry: trade.entry_price,
        mark: currentPrice,
        pnl,
        openedAt: trade.date || trade.created_at || "",
      };
    });
  }, [trades, normalizedPrices, strategies]);

  const summary = useMemo(() => {
    const totalPnl = enrichedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const capitalDeployed = enrichedTrades.reduce((sum, trade) => sum + Math.abs(trade.entry * trade.size), 0);
    const riskInMarket = enrichedTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0);
    const availableCapital = Math.max(0, TOTAL_CAPITAL - capitalDeployed);
    const marginUsedPct = Math.min(100, (capitalDeployed / TOTAL_CAPITAL) * 100);

    return {
      totalPnl,
      openPositions: enrichedTrades.length,
      capitalDeployed,
      availableCapital,
      riskInMarket,
      marginUsedPct,
    };
  }, [enrichedTrades]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Risk Console</h1>
        <p className="text-sm text-muted-foreground">Live overview of open trades and risk from the trade log.</p>
      </header>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Capital</div>
          <div className="text-xl font-medium">{`$${TOTAL_CAPITAL.toLocaleString()}`}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Capital Deployed</div>
          <div className="text-xl font-medium">{`$${summary.capitalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Available Capital</div>
          <div className="text-xl font-medium">{`$${summary.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-xs text-muted-foreground">Risk In Market</div>
          <div className="text-xl font-medium">{`$${summary.riskInMarket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
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

      <section className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-semibold">Open Trades</h2>
            <p className="text-sm text-muted-foreground">Trades are loaded from the canonical trade log.</p>
          </div>
          <div className="text-sm text-muted-foreground">{loading ? "Refreshing..." : `${enrichedTrades.length} open trades`}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="py-2">ID</th>
                <th>Instrument</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry</th>
                <th>Mark</th>
                <th>P&L</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {enrichedTrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-muted-foreground">No open trades found in the trade log.</td>
                </tr>
              )}
              {enrichedTrades.map((trade) => (
                <tr key={trade.id} className="border-t">
                  <td className="py-2 text-sm">{trade.id}</td>
                  <td className="font-medium">{trade.symbol}</td>
                  <td className={trade.side === "LONG" ? "text-green-600" : "text-red-600"}>{trade.side}</td>
                  <td>{trade.size}</td>
                  <td>{trade.entry}</td>
                  <td>{trade.mark}</td>
                  <td className={`${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>{trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}</td>
                  <td className="text-sm text-muted-foreground">{trade.openedAt ? new Date(trade.openedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4 min-h-[200px]">
          <h3 className="font-semibold mb-2">Position Monitor</h3>
          <p className="text-sm text-muted-foreground">Live position exposures are built from open trades and live prices.</p>
          <div className="mt-4 border rounded p-3 text-center text-sm text-muted-foreground">The trade log is the source of truth.</div>
        </div>

        <div className="bg-white rounded shadow p-4 min-h-[200px]">
          <h3 className="font-semibold mb-2">Risk Calculator</h3>
          <p className="text-sm text-muted-foreground">Quick sizing and impact analysis on the current open book.</p>
          <div className="mt-4 border rounded p-3 text-center text-sm text-muted-foreground">Live risk calculator will reflect actual trade log positions.</div>
        </div>
      </section>
    </div>
  );
}
