"use client";

import { useMemo, useState } from "react";
import { PageIntro, SectionHeader } from "@/components/ui";
import { Tag, autoTagVariant } from "@/components/ui/Tag";
import { renderInline } from "@/components/ui/markdown";
import Select from "@/components/ui/Select";
import type { Strategy } from "@/lib/data/types";

type StrategyForm = {
    code: string;
    name: string;
    tagline: string;
    status: "testing" | "active" | "retired";
    setup_conditions: string;
    entry_rules: string;
    exit_rules: string;
    market_conditions: string;
    edge_hypothesis: string;
    tags: string;
};

const EMPTY_FORM: StrategyForm = {
    code: "",
    name: "",
    tagline: "",
    status: "testing",
    setup_conditions: "",
    entry_rules: "",
    exit_rules: "",
    market_conditions: "",
    edge_hypothesis: "",
    tags: "",
};

function gradientClass(code: string): string {
    if (code === "ST-01") return "sc-orb";
    if (code === "ST-02") return "sc-vwap";
    return "sc-grad-generic";
}

function VwapDiagram() {
    return (
        <div className="vwap-diagram">
            <div className="vd-label">VWAP Band Structure</div>
            <div className="vd-rows">
                <div className="vd-row">
                    <div className="vd-name" style={{ color: "var(--red)" }}>+2 SD</div>
                    <div className="vd-line vd-r2" />
                    <div className="vd-desc">Sell zone — price extended above VWAP · short entry / long exit</div>
                </div>
                <div className="vd-row">
                    <div className="vd-name" style={{ color: "var(--amber)" }}>+1 SD</div>
                    <div className="vd-line vd-r1" />
                    <div className="vd-desc">Elevated zone — watch for rejection · potential short entry</div>
                </div>
                <div className="vd-row">
                    <div className="vd-name" style={{ color: "var(--text2)" }}>VWAP</div>
                    <div className="vd-line vd-vw" />
                    <div className="vd-desc">Mean · equilibrium · often acts as support/resistance</div>
                </div>
                <div className="vd-row">
                    <div className="vd-name" style={{ color: "var(--amber)" }}>−1 SD</div>
                    <div className="vd-line vd-g1" />
                    <div className="vd-desc">Depressed zone — watch for support · potential long entry</div>
                </div>
                <div className="vd-row">
                    <div className="vd-name" style={{ color: "var(--teal)" }}>−2 SD</div>
                    <div className="vd-line vd-g2" />
                    <div className="vd-desc">Buy zone — price extended below VWAP · long entry / short exit</div>
                </div>
            </div>
        </div>
    );
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
    const grad = gradientClass(strategy.code);
    const badgeClass = strategy.status === "active" ? "sc-badge scb-live" : "sc-badge scb-test";
    return (
        <div className={`strat-card ${grad}`}>
            <div className="sc-header">
                <div className="sc-id">{strategy.code}</div>
                <div className="sc-body">
                    <div className="sc-name">{strategy.name}</div>
                    {strategy.tagline && <div className="sc-tagline">{strategy.tagline}</div>}
                </div>
                <div className={badgeClass}>{strategy.status === "active" ? "Active" : strategy.status === "retired" ? "Retired" : "Testing"}</div>
            </div>

            {strategy.code === "ST-02" && <VwapDiagram />}

            <div className="sc-grid">
                {strategy.setup_conditions && (
                    <div className="sc-section">
                        <div className="sc-section-label">Setup Conditions</div>
                        <div className="sc-section-body">{renderInline(strategy.setup_conditions)}</div>
                    </div>
                )}
                {strategy.entry_rules && (
                    <div className="sc-section">
                        <div className="sc-section-label">Entry Rules</div>
                        <div className="sc-section-body">{renderInline(strategy.entry_rules)}</div>
                    </div>
                )}
                {strategy.exit_rules && (
                    <div className="sc-section">
                        <div className="sc-section-label">Exit Rules</div>
                        <div className="sc-section-body">{renderInline(strategy.exit_rules)}</div>
                    </div>
                )}
                {strategy.market_conditions && strategy.code === "ST-01" && (
                    <div className="sc-section">
                        <div className="sc-section-label">Market Conditions Required</div>
                        <div className="sc-section-body">{renderInline(strategy.market_conditions)}</div>
                    </div>
                )}
            </div>

            {strategy.code !== "ST-01" && strategy.market_conditions && (
                <div className="sc-full">
                    <div className="sc-section-label">Market Conditions Required</div>
                    <div className="sc-section-body">{renderInline(strategy.market_conditions)}</div>
                </div>
            )}

            {strategy.edge_hypothesis && (
                <div className="sc-full">
                    <div className="sc-section-label">Edge Hypothesis</div>
                    <div className="sc-section-body">{renderInline(strategy.edge_hypothesis)}</div>
                </div>
            )}

            {strategy.tags && strategy.tags.length > 0 && (
                <div>
                    {strategy.tags.map((t) => (
                        <Tag key={t} variant={autoTagVariant(t)}>{t}</Tag>
                    ))}
                </div>
            )}
        </div>
    );
}

function parseTags(value: string) {
    return value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

export default function StrategyVaultClient({ initialStrategies }: { initialStrategies: Strategy[] }) {
    const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
    const [form, setForm] = useState<StrategyForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const statusOptions = useMemo(
        () => [
            { value: "testing", label: "Testing" },
            { value: "active", label: "Active" },
            { value: "retired", label: "Retired" },
        ],
        []
    );

    async function refreshStrategies() {
        try {
            const res = await fetch("/api/strategies");
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                setStrategies(data);
            }
        } catch {
            // no-op
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload = {
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            tagline: form.tagline.trim() || null,
            status: form.status,
            setup_conditions: form.setup_conditions.trim() || null,
            entry_rules: form.entry_rules.trim() || null,
            exit_rules: form.exit_rules.trim() || null,
            market_conditions: form.market_conditions.trim() || null,
            edge_hypothesis: form.edge_hypothesis.trim() || null,
            tags: parseTags(form.tags),
        };

        if (!payload.code || !payload.name || !payload.setup_conditions || !payload.entry_rules || !payload.exit_rules || !payload.edge_hypothesis) {
            setError("Please fill code, name, setup, entry, exit, and edge hypothesis.");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/strategies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || "Failed to save strategy.");
                setSaving(false);
                return;
            }

            setStrategies((prev) => {
                const next = prev.filter((s) => s.code !== data.code);
                return [...next, data].sort((a, b) => a.code.localeCompare(b.code));
            });
            setForm(EMPTY_FORM);
            setSuccess("Strategy saved.");
            await refreshStrategies();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save strategy.");
        } finally {
            setSaving(false);
        }
    }

    const labelCls = "text-[10px] tracking-[1.5px] uppercase text-muted mb-2 block";
    const inputCls = "bg-bg4 border border-border2 rounded-md px-3 py-2 text-[12px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40";
    const textareaCls = `${inputCls} min-h-[90px] resize-none`;

    return (
        <>
            <PageIntro>What works. How it works. Why it works. Rules locked. Edge documented.</PageIntro>

            <SectionHeader title="Add Strategy" sub="Capture new strategy details" />
            <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded-lg p-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Code</label>
                        <input
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            placeholder="ST-03"
                            className={inputCls}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelCls}>Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Strategy name"
                            className={inputCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Status</label>
                        <Select
                            value={form.status}
                            onChange={(value) => setForm({ ...form, status: value as StrategyForm["status"] })}
                            options={statusOptions}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Tagline</label>
                        <input
                            value={form.tagline}
                            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                            placeholder="Short thesis or mnemonic"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Tags</label>
                        <input
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            placeholder="e.g. momentum, ORB, trend"
                            className={inputCls}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Setup Conditions</label>
                        <textarea
                            value={form.setup_conditions}
                            onChange={(e) => setForm({ ...form, setup_conditions: e.target.value })}
                            placeholder="Market structure, context, preconditions"
                            className={textareaCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Entry Rules</label>
                        <textarea
                            value={form.entry_rules}
                            onChange={(e) => setForm({ ...form, entry_rules: e.target.value })}
                            placeholder="Triggers, confirmation, order logic"
                            className={textareaCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Exit Rules</label>
                        <textarea
                            value={form.exit_rules}
                            onChange={(e) => setForm({ ...form, exit_rules: e.target.value })}
                            placeholder="Stops, targets, invalidation"
                            className={textareaCls}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Market Conditions Required</label>
                        <textarea
                            value={form.market_conditions}
                            onChange={(e) => setForm({ ...form, market_conditions: e.target.value })}
                            placeholder="Volatility, regime, macro context"
                            className={textareaCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Edge Hypothesis</label>
                        <textarea
                            value={form.edge_hypothesis}
                            onChange={(e) => setForm({ ...form, edge_hypothesis: e.target.value })}
                            placeholder="Why this setup has edge"
                            className={textareaCls}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-accent text-bg border border-accent font-bold px-6 py-2.5 rounded-md hover:bg-[#a6d848] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Strategy"}
                    </button>
                    {error && <div className="text-red text-xs">{error}</div>}
                    {success && <div className="text-teal text-xs">{success}</div>}
                </div>
            </form>

            <SectionHeader title="Active Strategies" sub={`${strategies.length} documented`} />
            {strategies.map((s) => (
                <StrategyCard key={s.id} strategy={s} />
            ))}
        </>
    );
}
