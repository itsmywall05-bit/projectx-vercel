"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";
import { getLivePriceForTrade, normalizePriceKey, type PriceRecord } from "@/lib/pricing";
import { Card, StatCard, PageIntro, SectionHeader, Select } from "@/components/ui";

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

const TOTAL_CAPITAL = 10000;

export default function RiskConsolePage() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [prices, setPrices] = useState<Record<string, number | PriceRecord>>({});
  const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [riskAmount, setRiskAmount] = useState<number>(100);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(console.error);
  }, []);

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
      marginUsedPct: marginUsedPct.toFixed(3),
    };
  }, [enrichedTrades]);

  const selectedProductMeta = useMemo(() => {
    return allProducts.find((p) => p.code === selectedProduct);
  }, [allProducts, selectedProduct]);

  const maxLots = useMemo(() => {
    if (!selectedProductMeta || !entryPrice || !exitPrice || riskAmount <= 0) return 0;

    const tickSize = selectedProductMeta.tick_size || 0.01;
    const tickValue = selectedProductMeta.tick_value || 1;

    const priceDiff = Math.abs(entryPrice - exitPrice);
    const ticks = priceDiff / tickSize;
    if (ticks === 0) return 0;

    const riskPerContract = ticks * tickValue;
    if (riskPerContract === 0) return 0;

    return Math.floor(riskAmount / riskPerContract);
  }, [selectedProductMeta, entryPrice, exitPrice, riskAmount]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <PageIntro>Live overview of open trades and risk from the trade log.</PageIntro>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <StatCard label="Capital" value={`$${TOTAL_CAPITAL.toLocaleString()}`} />
        <StatCard label="Capital Deployed" value={`$${summary.capitalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Available Capital" value={`$${summary.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Risk In Market" value={`$${summary.riskInMarket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Open Positions" value={summary.openPositions} />
        <StatCard label="Margin Used" value={`${summary.marginUsedPct}%`} />
      </div>

      {/* Section 2: Open Trades */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-3">
          <SectionHeader title="Open Trades" />
          <div className="text-sm text-muted">{loading ? "Refreshing..." : `${enrichedTrades.length} open trades`}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm border-b border-border" style={{ color: 'var(--muted)' }}>
                <th className="py-2 px-2 font-normal">ID</th>
                <th className="py-2 px-2 font-normal">Instrument</th>
                <th className="py-2 px-2 font-normal">Side</th>
                <th className="py-2 px-2 font-normal">Size</th>
                <th className="py-2 px-2 font-normal">Entry</th>
                <th className="py-2 px-2 font-normal">Mark</th>
                <th className="py-2 px-2 font-normal">P&L</th>
                <th className="py-2 px-2 font-normal">Opened</th>
              </tr>
            </thead>
            <tbody>
              {enrichedTrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm border-b border-border" style={{ color: 'var(--muted)' }}>
                    No open trades found in the trade log.
                  </td>
                </tr>
              )}
              {enrichedTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-border text-sm">
                  <td className="py-2 px-2" style={{ color: 'var(--muted)' }}>{trade.id}</td>
                  <td className="py-2 px-2 font-medium">{trade.symbol}</td>
                  <td className={`py-2 px-2 ${trade.side === "LONG" ? "text-green-500" : "text-red-500"}`}>{trade.side}</td>
                  <td className="py-2 px-2">{trade.size}</td>
                  <td className="py-2 px-2">{trade.entry}</td>
                  <td className="py-2 px-2">{trade.mark}</td>
                  <td className={`py-2 px-2 ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                  </td>
                  <td className="py-2 px-2" style={{ color: 'var(--muted)' }}>
                    {trade.openedAt ? new Date(trade.openedAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Position Monitor" />
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Live position exposures are built from open trades and live prices.</p>
          <div className="border border-border rounded p-3 text-center text-sm flex items-center justify-center min-h-[100px]" style={{ color: 'var(--muted)' }}>
            The trade log is the source of truth.
          </div>
        </Card>

        <Card>
          <SectionHeader title="Risk Calculator" />

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Risk Amount ($)</label>
              <input
                type="number"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg3)' }}
                value={riskAmount || ''}
                onChange={(e) => setRiskAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Product</label>
              <Select
                value={selectedProduct}
                onChange={setSelectedProduct}
                options={[{ label: "-- Select Product --", value: "" }, ...allProducts.map(p => ({ label: p.code, value: p.code }))]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Entry Price</label>
                <input
                  type="number"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg3)' }}
                  value={entryPrice || ''}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Exit (Stop) Price</label>
                <input
                  type="number"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg3)' }}
                  value={exitPrice || ''}
                  onChange={(e) => setExitPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Max Lots</span>
                <span className="text-xl font-semibold" style={{ color: 'var(--accent)' }}>{maxLots}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}