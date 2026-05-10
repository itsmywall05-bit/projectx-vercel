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
  const totalTrades = closedTrades.length;

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

  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0";
  const avgPnl = totalTrades > 0 ? (totalPnl / totalTrades).toFixed(2) : "0";

  const stats = [
    { label: "Total Trades", value: totalTrades.toString(), color: "border-t-teal" },
    { label: "Win Rate", value: `${winRate}%`, color: "border-t-accent" },
    { label: "Total P&L", value: `$${totalPnl.toFixed(2)}`, color: "border-t-blue", positive: totalPnl >= 0 },
    { label: "Avg P&L / Trade", value: `$${avgPnl}`, color: "border-t-purple", positive: parseFloat(avgPnl) >= 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className={`bg-bg3 border border-border rounded p-3 border-t-2 ${s.color}`}>
          <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">{s.label}</div>
          <div className={`font-heading font-bold text-[20px] leading-none ${
            "positive" in s ? (s.positive ? "text-teal" : "text-red") : "text-text"
          }`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
