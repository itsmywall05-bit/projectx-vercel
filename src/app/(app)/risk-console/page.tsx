"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import { calcOpenPnl } from "@/lib/pricing";
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
  products?: { tick_size: number; tick_value: number } | null;
};

const TOTAL_CAPITAL = 10000;

export default function RiskConsolePage() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskAmount, setRiskAmount] = useState<number>(100);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [tickSize, setTickSize] = useState<string>("");
  const [tickValue, setTickValue] = useState<string>("");
  const [allProducts, setAllProducts] = useState<{ code: string; tick_size: number; tick_value: number }[]>([]);

  // Live prices + derived instrument pricing from the shared hook
  const { getInstrumentPrice } = useLivePrices();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setAllProducts(d); })
      .catch(console.error);
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch("/api/trades");
      const data = await res.json();
      setTrades(Array.isArray(data) ? data.filter((t) => !t.exit_price) : []);
      setError(null);
    } catch {
      setError("Unable to load trades");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 3000);
    return () => clearInterval(interval);
  }, [fetchTrades]);

  const enrichedTrades = useMemo(() => {
    return trades.map((trade) => {
      const rawMark = getInstrumentPrice(trade.instrument, trade.product ?? "") ?? trade.entry_price;
      const mark = Math.round(rawMark * 100) / 100;
      const tickSize = trade.products?.tick_size || 1;
      const tickValue = trade.products?.tick_value || 1;
      const pnl = calcOpenPnl(trade.entry_price, mark, trade.direction ?? "long", tickSize, tickValue, trade.size_contracts);
      return {
        id: trade.id,
        symbol: trade.instrument,
        side: trade.direction?.toUpperCase() === "SHORT" ? "SHORT" : "LONG",
        size: trade.size_contracts,
        entry: trade.entry_price,
        mark,
        pnl,
        openedAt: trade.date || trade.created_at || "",
      };
    });
  }, [trades, getInstrumentPrice]);

  const summary = useMemo(() => {
    const capitalDeployed = enrichedTrades.reduce((s, t) => s + Math.abs(t.entry * t.size), 0);
    const riskInMarket = enrichedTrades.reduce((s, t) => s + Math.abs(t.pnl), 0);
    return {
      openPositions: enrichedTrades.length,
      capitalDeployed,
      availableCapital: Math.max(0, TOTAL_CAPITAL - capitalDeployed),
      riskInMarket,
      marginUsedPct: Math.min(100, (capitalDeployed / TOTAL_CAPITAL) * 100).toFixed(3),
    };
  }, [enrichedTrades]);

  const selectedProductMeta = useMemo(
    () => allProducts.find((p) => p.code === selectedProduct),
    [allProducts, selectedProduct],
  );

  // Auto-fill tick fields when product changes
  useEffect(() => {
    if (selectedProductMeta) {
      setTickSize(String(selectedProductMeta.tick_size));
      setTickValue(String(selectedProductMeta.tick_value));
    }
  }, [selectedProductMeta]);

  function clampDecimals(v: string, dp = 2): string {
    const dot = v.indexOf(".");
    return dot === -1 ? v : v.slice(0, dot + 1 + dp);
  }

  function handlePriceChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // allow: empty, minus, digits, one dot, max 2 decimal places
      if (/^-?\d*\.?\d{0,2}$/.test(raw) || raw === "-") setter(clampDecimals(raw));
    };
  }

  const maxLots = useMemo(() => {
    const ep = parseFloat(entryPrice);
    const xp = parseFloat(exitPrice);
    const ts = parseFloat(tickSize);
    const tv = parseFloat(tickValue);
    if (isNaN(ep) || isNaN(xp) || ep === xp) return null;
    if (isNaN(ts) || ts <= 0 || isNaN(tv) || tv <= 0 || riskAmount <= 0) return null;
    const ticks = Math.abs(ep - xp) / ts;
    if (ticks === 0) return null;
    const riskPerLot = ticks * tv;
    return { lots: Math.floor(riskAmount / riskPerLot), riskPerLot };
  }, [entryPrice, exitPrice, tickSize, tickValue, riskAmount]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <PageIntro>Live overview of open trades and risk from the trade log.</PageIntro>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <StatCard label="Capital" value={`$${TOTAL_CAPITAL.toLocaleString()}`} />
        <StatCard label="Capital Deployed" value={`$${summary.capitalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Available Capital" value={`$${summary.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Risk In Market" value={`$${summary.riskInMarket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Open Positions" value={summary.openPositions} />
        <StatCard label="Margin Used" value={`${summary.marginUsedPct}%`} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4 mb-3">
          <SectionHeader title="Open Trades" />
          <div className="text-sm text-muted">{loading ? "Refreshing..." : `${enrichedTrades.length} open trades`}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm border-b border-border" style={{ color: "var(--muted)" }}>
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
                  <td colSpan={7} className="py-6 text-center text-sm border-b border-border" style={{ color: "var(--muted)" }}>
                    No open trades found in the trade log.
                  </td>
                </tr>
              )}
              {enrichedTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-border text-sm">
                  <td className="py-2 px-2 font-medium">{trade.symbol}</td>
                  <td className={`py-2 px-2 ${trade.side === "LONG" ? "text-green-500" : "text-red-500"}`}>{trade.side}</td>
                  <td className="py-2 px-2">{trade.size}</td>
                  <td className="py-2 px-2">{trade.entry}</td>
                  <td className="py-2 px-2 font-mono font-semibold" style={{ color: "var(--accent)" }}>{trade.mark}</td>
                  <td className={`py-2 px-2 ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                  </td>
                  <td className="py-2 px-2" style={{ color: "var(--muted)" }}>
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
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Net exposure per instrument from open trades.</p>
          {enrichedTrades.length === 0 ? (
            <div className="text-center text-sm py-6" style={{ color: "var(--muted)" }}>No open positions.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm border-b border-border" style={{ color: "var(--muted)" }}>
                  <th className="py-2 px-2 font-normal">Instrument</th>
                  <th className="py-2 px-2 font-normal text-right">Position</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(
                  enrichedTrades.reduce<Record<string, { symbol: string; net: number }>>((acc, t) => {
                    if (!acc[t.symbol]) acc[t.symbol] = { symbol: t.symbol, net: 0 };
                    acc[t.symbol].net += t.side === "LONG" ? t.size : -t.size;
                    return acc;
                  }, {}),
                ).map((pos) => (
                  <tr key={pos.symbol} className="border-b border-border text-sm">
                    <td className="py-2 px-2 font-medium">{pos.symbol}</td>
                    <td className={`py-2 px-2 text-right font-mono ${pos.net > 0 ? "text-green-500" : pos.net < 0 ? "text-red-500" : ""}`}>
                      {pos.net > 0 ? `+${pos.net}` : pos.net}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <SectionHeader title="Risk Calculator" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Risk Amount ($)</label>
              <input type="number" className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none" style={{ backgroundColor: "var(--bg3)" }} value={riskAmount || ""} onChange={(e) => setRiskAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Product</label>
              <Select value={selectedProduct} onChange={setSelectedProduct} options={[{ label: "-- Select Product --", value: "" }, ...allProducts.map((p) => ({ label: p.code, value: p.code }))]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Tick Size</label>
                <input type="text" inputMode="decimal" placeholder="e.g. 0.01" className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none" style={{ backgroundColor: "var(--bg3)" }} value={tickSize} onChange={(e) => setTickSize(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Tick Value ($)</label>
                <input type="text" inputMode="decimal" placeholder="e.g. 10" className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none" style={{ backgroundColor: "var(--bg3)" }} value={tickValue} onChange={(e) => setTickValue(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Entry Price</label>
                <input type="text" inputMode="decimal" className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none" style={{ backgroundColor: "var(--bg3)" }} value={entryPrice} onChange={handlePriceChange(setEntryPrice)} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Exit (Stop) Price</label>
                <input type="text" inputMode="decimal" className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none" style={{ backgroundColor: "var(--bg3)" }} value={exitPrice} onChange={handlePriceChange(setExitPrice)} />
              </div>
            </div>
            <div className="pt-4 border-t border-border mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--muted)" }}>Risk / lot</span>
                <span className="text-sm font-mono" style={{ color: "var(--muted)" }}>
                  {maxLots ? `$${maxLots.riskPerLot.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--muted)" }}>Max Lots</span>
                <span className="text-xl font-semibold" style={{ color: maxLots ? "var(--accent)" : "var(--muted)" }}>
                  {maxLots ? maxLots.lots : "—"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
