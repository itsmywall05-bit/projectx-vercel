"use client";

import { useState } from "react";

interface Trade {
  id: string;
  date: string;
  product: string;
  instrument: string;
  instrument_type: string;
  direction: string;
  entry_price: number;
  entry_time: string | null;
  exit_price: number | null;
  exit_time: string | null;
  size_contracts: number;
  strategy: string;
  assumption: string;
  checklist_passed: boolean;
  playbook_applied: boolean;
  playbook_rule: string;
  process_tag: string;
  notes_pre: string;
  notes_during: string;
  notes_post: string;
  products: { tick_size: number; tick_value: number } | null;
}

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  filters: { direction: string; process_tag: string; strategy: string; checklist: string };
  onFilterChange: (key: string, value: string) => void;
}

function calcPnl(trade: Trade) {
  if (!trade.exit_price || !trade.products) return { ticks: 0, dollar: 0 };
  const dir = trade.direction === "Long" ? 1 : -1;
  const ticks = ((trade.exit_price - trade.entry_price) / trade.products.tick_size) * dir;
  const dollar = ticks * trade.products.tick_value * trade.size_contracts;
  return { ticks: Math.round(ticks * 100) / 100, dollar: Math.round(dollar * 100) / 100 };
}

function formatTime(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TradeTable({ trades, onEdit, onDelete, filters, onFilterChange }: TradeTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectCls = "bg-bg3 border border-border2 text-muted text-[10px] px-2 py-1 rounded font-mono focus:outline-none";

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={filters.direction} onChange={(e) => onFilterChange("direction", e.target.value)} className={selectCls}>
          <option value="">All Directions</option>
          <option value="Long">Long</option>
          <option value="Short">Short</option>
        </select>
        <select value={filters.process_tag} onChange={(e) => onFilterChange("process_tag", e.target.value)} className={selectCls}>
          <option value="">All Process</option>
          <option value="Good">Good</option>
          <option value="Bad">Bad</option>
          <option value="Lucky">Lucky</option>
          <option value="Unlucky">Unlucky</option>
        </select>
        <select value={filters.strategy} onChange={(e) => onFilterChange("strategy", e.target.value)} className={selectCls}>
          <option value="">All Strategies</option>
          <option value="ST-01">ST-01 ORB</option>
          <option value="ST-02">ST-02 VWAP</option>
        </select>
        <select value={filters.checklist} onChange={(e) => onFilterChange("checklist", e.target.value)} className={selectCls}>
          <option value="">All Checklist</option>
          <option value="true">Passed ✓</option>
          <option value="false">Failed ✗</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-bg3 border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Date</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Instrument</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Dir</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Entry</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Exit</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Size</th>
                <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">Process</th>
                <th className="text-right text-[8px] tracking-[1.5px] uppercase text-muted px-3 py-2 border-b border-border">P&L</th>
                <th className="text-[8px] px-3 py-2 border-b border-border"></th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted text-[11px] py-8">
                    No trades yet. Add your first trade above.
                  </td>
                </tr>
              )}
              {trades.map((t) => {
                const pnl = calcPnl(t);
                const isExpanded = expandedId === t.id;
                return (
                  <tbody key={t.id}>
                    <tr
                      className="hover:bg-accent/[0.03] cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    >
                      <td className="px-3 py-2 text-[11px] text-text2 border-b border-border">{t.date}</td>
                      <td className="px-3 py-2 text-[11px] text-text border-b border-border">
                        <span className="text-accent font-medium">{t.product}</span>
                        <span className="text-muted ml-1">{t.instrument}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] border-b border-border">
                        <span className={t.direction === "Long" ? "text-teal" : "text-red"}>{t.direction}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-text2 border-b border-border">{t.entry_price}</td>
                      <td className="px-3 py-2 text-[11px] text-text2 border-b border-border">{t.exit_price ?? "—"}</td>
                      <td className="px-3 py-2 text-[11px] text-text2 border-b border-border">{t.size_contracts}</td>
                      <td className="px-3 py-2 text-[11px] border-b border-border">
                        {t.process_tag && (
                          <span className={`text-[8px] px-[6px] py-[1px] rounded-full ${
                            t.process_tag === "Good" ? "bg-teal/10 text-teal" :
                            t.process_tag === "Bad" ? "bg-red/10 text-red" :
                            t.process_tag === "Lucky" ? "bg-accent/10 text-accent" :
                            "bg-amber/10 text-amber"
                          }`}>
                            {t.process_tag}
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-[11px] text-right font-medium border-b border-border ${pnl.dollar >= 0 ? "text-teal" : "text-red"}`}>
                        {t.exit_price ? `$${pnl.dollar}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-[11px] border-b border-border">
                        <span className="text-muted2">{isExpanded ? "▾" : "▸"}</span>
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="bg-bg4 border-b border-border px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">Assumption</div>
                              <p className="text-[10.5px] text-text2 mb-3">{t.assumption || "—"}</p>
                              <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">Notes — Pre</div>
                              <p className="text-[10.5px] text-text2 mb-2">{t.notes_pre || "—"}</p>
                              <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">Notes — During</div>
                              <p className="text-[10.5px] text-text2 mb-2">{t.notes_during || "—"}</p>
                              <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">Notes — Post</div>
                              <p className="text-[10.5px] text-text2">{t.notes_post || "—"}</p>
                            </div>
                            <div>
                              <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-1">Details</div>
                              <div className="text-[10.5px] text-text2 space-y-1">
                                <div>Strategy: <span className="text-text">{t.strategy || "—"}</span></div>
                                <div>Type: <span className="text-text">{t.instrument_type}</span></div>
                                <div>Entry Time: <span className="text-text">{formatTime(t.entry_time)}</span></div>
                                <div>Exit Time: <span className="text-text">{formatTime(t.exit_time)}</span></div>
                                <div>Checklist: <span className={t.checklist_passed ? "text-teal" : "text-red"}>{t.checklist_passed ? "✓ Passed" : "✗ Failed"}</span></div>
                                <div>Playbook: <span className="text-text">{t.playbook_applied ? `✓ ${t.playbook_rule || "Applied"}` : "—"}</span></div>
                                <div>Ticks P&L: <span className={pnl.ticks >= 0 ? "text-teal" : "text-red"}>{pnl.ticks}</span></div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                                  className="text-accent text-[10px] border border-accent/20 px-3 py-1 rounded hover:bg-accent/10 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (confirm("Delete this trade?")) onDelete(t.id); }}
                                  className="text-red text-[10px] border border-red/20 px-3 py-1 rounded hover:bg-red/10 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
