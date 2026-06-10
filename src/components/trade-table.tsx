"use client";

import { Fragment, useState } from "react";
import Select from "@/components/ui/Select";
import { useLivePrices } from "@/hooks/useLivePrices";

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
    const { getInstrumentPrice, isLive } = useLivePrices();
    const directionOptions = [
        { value: "", label: "All Directions" },
        { value: "Long", label: "Long" },
        { value: "Short", label: "Short" },
    ];
    const processOptions = [
        { value: "", label: "All Process" },
        { value: "Good", label: "Good" },
        { value: "Bad", label: "Bad" },
        { value: "Lucky", label: "Lucky" },
        { value: "Unlucky", label: "Unlucky" },
    ];
    const strategyOptions = [
        { value: "", label: "All Strategies" },
        { value: "ST-01", label: "ST-01 ORB" },
        { value: "ST-02", label: "ST-02 VWAP" },
    ];
    const checklistOptions = [
        { value: "", label: "All Checklist" },
        { value: "true", label: "Passed" },
        { value: "false", label: "Failed" },
    ];

    return (
        <div>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="min-w-[170px]">
                    <Select
                        value={filters.direction}
                        onChange={(value) => onFilterChange("direction", value)}
                        options={directionOptions}
                        size="sm"
                    />
                </div>
                <div className="min-w-[170px]">
                    <Select
                        value={filters.process_tag}
                        onChange={(value) => onFilterChange("process_tag", value)}
                        options={processOptions}
                        size="sm"
                    />
                </div>
                <div className="min-w-[180px]">
                    <Select
                        value={filters.strategy}
                        onChange={(value) => onFilterChange("strategy", value)}
                        options={strategyOptions}
                        size="sm"
                    />
                </div>
                <div className="min-w-[160px]">
                    <Select
                        value={filters.checklist}
                        onChange={(value) => onFilterChange("checklist", value)}
                        options={checklistOptions}
                        size="sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-bg3 border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-bg4">
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Date</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Instrument</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Dir</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Entry</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Exit</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Mark {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 ml-1 align-middle" />}</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Size</th>
                                <th className="text-left text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">Process</th>
                                <th className="text-right text-xs tracking-wider uppercase text-muted py-3 px-4 border-b border-border font-semibold">P&L</th>
                                <th className="text-xs px-4 py-3 border-b border-border"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="text-center text-muted text-sm py-12 bg-bg3">
                                        No trades yet. Add your first trade above.
                                    </td>
                                </tr>
                            )}
                            {trades.map((t) => {
                                const pnl = calcPnl(t);
                                const isExpanded = expandedId === t.id;
                                return (
                                    <Fragment key={t.id}>
                                        <tr
                                            className="hover:bg-bg4 cursor-pointer transition-colors duration-150"
                                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                                        >
                                            <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.date}</td>
                                            <td className="px-4 py-3 text-sm text-text border-b border-border">
                                                <span className="text-accent font-semibold">{t.product}</span>
                                                <span className="text-muted ml-2">{t.instrument}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm border-b border-border">
                                                <span className={t.direction === "Long" ? "text-teal font-medium" : "text-red font-medium"}>{t.direction}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.entry_price}</td>
                                            <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.exit_price ?? "—"}</td>
                                            <td className="px-4 py-3 text-sm border-b border-border font-mono">
                                                {t.exit_price ? <span className="text-muted">—</span> : (
                                                    <span className="text-accent font-semibold">
                                                        {getInstrumentPrice(t.instrument, t.product) ?? <span className="text-muted text-xs">no price</span>}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text2 border-b border-border">{t.size_contracts}</td>
                                            <td className="px-4 py-3 text-sm border-b border-border">
                                                {t.process_tag && (
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.process_tag === "Good" ? "bg-teal/10 text-teal" :
                                                        t.process_tag === "Bad" ? "bg-red/10 text-red" :
                                                            t.process_tag === "Lucky" ? "bg-accent/10 text-accent" :
                                                                "bg-amber/10 text-amber"
                                                        }`}>
                                                        {t.process_tag}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`px-4 py-3 text-sm text-right font-bold border-b border-border ${pnl.dollar >= 0 ? "text-teal" : "text-red"}`}>
                                                {t.exit_price ? `$${pnl.dollar.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs border-b border-border">
                                                <span className="text-muted2">{isExpanded ? "▼" : "▶"}</span>
                                            </td>
                                        </tr>

                                        {/* Expanded detail */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={10} className="bg-bg2 border-b border-border px-6 py-5 shadow-inner">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div>
                                                            <div className="text-xs tracking-wider uppercase text-muted mb-2 font-semibold">Assumption</div>
                                                            <p className="text-sm text-text2 mb-4 leading-relaxed">{t.assumption || "—"}</p>
                                                            <div className="text-xs tracking-wider uppercase text-muted mb-2 font-semibold">Notes — Pre</div>
                                                            <p className="text-sm text-text2 mb-4 leading-relaxed">{t.notes_pre || "—"}</p>
                                                            <div className="text-xs tracking-wider uppercase text-muted mb-2 font-semibold">Notes — During</div>
                                                            <p className="text-sm text-text2 mb-4 leading-relaxed">{t.notes_during || "—"}</p>
                                                            <div className="text-xs tracking-wider uppercase text-muted mb-2 font-semibold">Notes — Post</div>
                                                            <p className="text-sm text-text2 leading-relaxed">{t.notes_post || "—"}</p>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs tracking-wider uppercase text-muted mb-2 font-semibold">Details</div>
                                                            <div className="text-sm text-text2 space-y-2 bg-bg3 p-4 rounded-lg border border-border/50">
                                                                <div className="flex justify-between">Strategy: <span className="text-text font-medium">{t.strategy || "—"}</span></div>
                                                                <div className="flex justify-between">Type: <span className="text-text font-medium">{t.instrument_type}</span></div>
                                                                <div className="flex justify-between">Entry Time: <span className="text-text font-medium">{formatTime(t.entry_time)}</span></div>
                                                                <div className="flex justify-between">Exit Time: <span className="text-text font-medium">{formatTime(t.exit_time)}</span></div>
                                                                <div className="flex justify-between">Checklist: <span className={t.checklist_passed ? "text-teal font-medium" : "text-red font-medium"}>{t.checklist_passed ? "✓ Passed" : "✗ Failed"}</span></div>
                                                                <div className="flex justify-between">Playbook: <span className="text-text font-medium">{t.playbook_applied ? `✓ ${t.playbook_rule || "Applied"}` : "—"}</span></div>
                                                                <div className="flex justify-between pt-2 mt-2 border-t border-border">Ticks P&L: <span className={pnl.ticks >= 0 ? "text-teal font-bold" : "text-red font-bold"}>{pnl.ticks}</span></div>
                                                            </div>
                                                            <div className="flex gap-3 mt-5">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                                                                    className="text-accent text-sm font-semibold border border-accent/30 bg-accent/5 px-4 py-2 rounded-md hover:bg-accent/15 hover:border-accent/50 transition-all shadow-sm"
                                                                >
                                                                    Edit Trade
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this trade?")) onDelete(t.id); }}
                                                                    className="text-red text-sm font-semibold border border-red/30 bg-red/5 px-4 py-2 rounded-md hover:bg-red/15 hover:border-red/50 transition-all shadow-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
