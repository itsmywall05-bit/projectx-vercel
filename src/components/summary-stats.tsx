"use client";

interface Trade {
  direction: string;
  entry_price: number;
  exit_price: number | null;
  size_contracts: number;
  products: { tick_size: number; tick_value: number } | null;
}

interface SummaryStatsProps {
  trades: Trade[];
}

export default function SummaryStats({ trades }: SummaryStatsProps) {
  const closedTrades = trades.filter((t) => t.exit_price != null);
  const totalTrades = trades.length;
  const closedCount = closedTrades.length;

  let totalPnl = 0;
  let wins = 0;

  closedTrades.forEach((t) => {
    if (!t.products || !t.exit_price) return;
    const dir = t.direction === "Long" ? 1 : -1;
    const ticks = ((t.exit_price - t.entry_price) / t.products.tick_size) * dir;
    const pnl = ticks * t.products.tick_value * t.size_contracts;
    totalPnl += pnl;
    if (pnl > 0) wins++;
  });

  const winRate = closedCount > 0 ? ((wins / closedCount) * 100).toFixed(1) : "0";
  const avgPnl = closedCount > 0 ? (totalPnl / closedCount).toFixed(2) : "0";

  const formatMoney = (val: number) => {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const stats = [
    { label: "Total Trades", value: totalTrades.toString(), color: "border-t-teal" },
    { label: "Win Rate", value: `${winRate}%`, color: "border-t-accent" },
    { label: "Total P&L", value: `$${formatMoney(totalPnl)}`, color: "border-t-blue", positive: totalPnl >= 0 },
    { label: "Avg P&L / Trade", value: `$${formatMoney(parseFloat(avgPnl))}`, color: "border-t-purple", positive: parseFloat(avgPnl) >= 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className={`bg-bg3 border border-border rounded-lg p-5 border-t-2 ${s.color} shadow-sm overflow-hidden`}>
          <div className="text-[11px] tracking-widest uppercase text-muted mb-2 font-semibold font-sans truncate">{s.label}</div>
          <div className={`font-heading font-bold text-3xl leading-none tracking-tight truncate ${
            "positive" in s ? (s.positive ? "text-teal" : "text-red") : "text-text"
          }`} title={s.value}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
