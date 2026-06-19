"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import {
    TaxonomyStrategy as Strategy,
    BUILT_IN,
    loadCustoms,
    createCustom,
    updateCustom,
    deleteCustom,
} from "@/lib/taxonomy";

type Operand = {
    stratIdx: number;
    sign: 1 | -1;
    offset: number;
    multiple: number;
};

type BlockType = "S" | "F";

type Block = {
    sym: string;
    legs: number[];
    type: BlockType;
};

type DecompTerm = {
    block: Block;
    coeff: number;
};

type DecompResult = {
    terms: DecompTerm[];
    totalLegs: number;
    count: number;
};

type Option = { value: string; label: string };

function legsKey(l: number[]) {
    return l.join(",");
}

function legsStr(l: number[]) {
    return "{" + l.map((v) => (v > 0 ? "+" : "") + v).join(",") + "}";
}

function composeN(operands: Operand[], strategies: Strategy[]) {
    if (!operands.length) return [] as number[];
    let maxLen = 0;
    operands.forEach((op) => {
        const s = strategies[op.stratIdx];
        if (s) maxLen = Math.max(maxLen, s.legs.length + (op.offset || 0));
    });
    if (maxLen === 0) return [] as number[];
    const r = new Array(maxLen).fill(0);
    operands.forEach((op) => {
        const s = strategies[op.stratIdx];
        if (!s) return;
        s.legs.forEach((v, i) => {
            r[i + (op.offset || 0)] += op.sign * op.multiple * v;
        });
    });
    return r;
}

function decompose(targetLegs: number[]) {
    const n = targetLegs.length;
    const blocks: Block[] = [];
    for (let i = 0; i < n - 1; i++) {
        const l = new Array(n).fill(0);
        l[i] = 1;
        l[i + 1] = -1;
        blocks.push({ sym: `S[${i + 1}]`, legs: l, type: "S" });
    }
    for (let i = 0; i < n - 2; i++) {
        const l = new Array(n).fill(0);
        l[i] = 1;
        l[i + 1] = -2;
        l[i + 2] = 1;
        blocks.push({ sym: `F[${i + 1}]`, legs: l, type: "F" });
    }
    const results: DecompResult[] = [];
    const seen = new Set<string>();
    function tryCombo(used: DecompTerm[], remaining: number[], depth: number) {
        if (depth > 5) return;
        if (remaining.every((v) => v === 0) && used.length > 0) {
            const key = used.map((u) => `${u.coeff}*${u.block.sym}`).sort().join("|");
            if (!seen.has(key)) {
                seen.add(key);
                const totalLegs = used.reduce(
                    (s, u) => s + Math.abs(u.coeff) * (u.block.type === "S" ? 2 : 3),
                    0
                );
                results.push({ terms: [...used], totalLegs, count: used.length });
            }
            return;
        }
        if (used.length >= 4) return;
        for (let bi = 0; bi < blocks.length; bi++) {
            const bl = blocks[bi];
            for (let c = -6; c <= 6; c++) {
                if (c === 0) continue;
                const newRem = remaining.map((v, i) => v - c * bl.legs[i]);
                if (newRem.every((v, i) => Math.abs(v) <= Math.abs(remaining[i]) || Math.abs(v) === 0))
                    tryCombo([...used, { block: bl, coeff: c }], newRem, depth + 1);
            }
        }
    }
    tryCombo([], targetLegs, 0);
    results.sort((a, b) => (a.count !== b.count ? a.count - b.count : a.totalLegs - b.totalLegs));
    return results.slice(0, 3);
}

function fmtDecomp(terms: DecompTerm[]) {
    return terms
        .map((t, i) => {
            const c = t.coeff;
            const a = Math.abs(c);
            const part = (a === 1 ? "" : a + "*") + t.block.sym;
            if (i === 0) return (c < 0 ? "-" : "") + part;
            return (c < 0 ? " - " : " + ") + part;
        })
        .join("");
}

const C = {
    bg: "#0b0d14",
    bg1: "#10131f",
    bg2: "#161a2e",
    bg3: "#1c2138",
    border: "#222840",
    border2: "#2e3558",
    text: "#dde1f0",
    text2: "#7a82a8",
    text3: "#444a6a",
    accent: "#5b9fff",
    accentDim: "#0f2550",
    green: "#3fffa0",
    greenDim: "#063020",
    amber: "#ffc060",
    amberDim: "#2e1e00",
    red: "#ff6060",
    redDim: "#300a0a",
    mono: "'Courier New', monospace",
};

function MiniBar({ legs, h = 34 }: { legs: number[]; h?: number }) {
    const nonZero = (legs || []).filter((v) => v !== 0);
    if (!nonZero.length) return null;
    const mx = Math.max(...nonZero.map(Math.abs), 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: h, flexShrink: 0 }}>
            {(legs || []).map((w, i) => {
                if (w === 0) {
                    return <div key={i} style={{ width: 3, height: h, flexShrink: 0 }} />;
                }
                const ph = Math.max(2, Math.round((Math.abs(w) / mx) * (h - 2)));
                return (
                    <div
                        key={i}
                        style={{
                            width: 9,
                            height: ph,
                            background: w > 0 ? C.accent : C.red,
                            borderRadius: 1,
                            marginTop: w > 0 ? h - ph : 0,
                            flexShrink: 0,
                        }}
                    />
                );
            })}
        </div>
    );
}

function Btn({
    children,
    onClick,
    variant = "ghost",
    disabled,
    small,
}: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "ghost" | "primary" | "danger" | "ok";
    disabled?: boolean;
    small?: boolean;
}) {
    const styles = {
        ghost: { bg: "transparent", col: C.text2, bdr: C.border2 },
        primary: { bg: C.accentDim, col: C.accent, bdr: C.accent + "88" },
        danger: { bg: C.redDim, col: C.red, bdr: C.red + "88" },
        ok: { bg: C.greenDim, col: C.green, bdr: C.green + "88" },
    };
    const s = styles[variant] || styles.ghost;
    return (
        <button
            onClick={disabled ? undefined : onClick}
            style={{
                background: s.bg,
                color: s.col,
                border: `1px solid ${s.bdr}`,
                borderRadius: 6,
                padding: small ? "3px 9px" : "5px 13px",
                fontFamily: C.mono,
                fontSize: small ? 10 : 12,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </button>
    );
}

function Bdg({ children, v = "ghost" }: { children: React.ReactNode; v?: "ghost" | "info" | "ok" | "warn" | "danger" }) {
    const m = {
        ghost: [C.bg3, C.text2],
        info: [C.accentDim, C.accent],
        ok: [C.greenDim, C.green],
        warn: [C.amberDim, C.amber],
        danger: [C.redDim, C.red],
    };
    const [bg, col] = m[v] || m.ghost;
    return (
        <span
            style={{
                display: "inline-block",
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 4,
                background: bg,
                color: col,
                fontFamily: C.mono,
                border: `1px solid ${col}33`,
            }}
        >
            {children}
        </span>
    );
}

function Inp({
    value,
    onChange,
    placeholder,
    w = 120,
    sx,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    w?: number;
    sx?: React.CSSProperties;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                background: C.bg2,
                color: C.text,
                border: `1px solid ${C.border2}`,
                borderRadius: 6,
                padding: "5px 8px",
                fontFamily: C.mono,
                fontSize: 12,
                width: w,
                outline: "none",
                ...(sx || {}),
            }}
        />
    );
}

function NumIn({ value, onChange, min, max, w = 52 }: { value: number; onChange: (v: number) => void; min: number; max: number; w?: number }) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                onChange(Math.min(max, Math.max(min, next)));
            }}
            style={{
                background: C.bg2,
                color: C.text,
                border: `1px solid ${C.border2}`,
                borderRadius: 6,
                padding: "5px 6px",
                fontFamily: C.mono,
                fontSize: 12,
                width: w,
                outline: "none",
                textAlign: "center",
            }}
        />
    );
}

function Sel({ value, onChange, options, w = 200 }: { value: string; onChange: (v: string) => void; options: Option[]; w?: number }) {
    return (
        <div style={{ width: w }}>
            <Select value={value} onChange={onChange} options={options} size="sm" />
        </div>
    );
}

function Card({ children, accent, style: sx }: { children: React.ReactNode; accent?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                background: C.bg2,
                border: `1px solid ${accent || C.border}`,
                borderRadius: 10,
                padding: "13px 15px",
                ...(sx || {}),
            }}
        >
            {children}
        </div>
    );
}

function SH({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: C.text3,
                fontFamily: C.mono,
                marginBottom: 8,
            }}
        >
            {children}
        </div>
    );
}

const DELETE_PASSWORD = "delete";

function CatalogTab({
    strategies,
    onDelete,
    onDiffChange,
}: {
    strategies: Strategy[];
    onDelete: (id: string) => void;
    onDiffChange: (id: string, val: string) => void;
}) {
    const [q, setQ] = useState("");
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deletePass, setDeletePass] = useState("");
    const [deleteErr, setDeleteErr] = useState(false);

    const vis = strategies.filter(
        (s) =>
            !q ||
            s.sym.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
    );
    const towers: Record<string, Strategy[]> = {};
    vis.forEach((s) => {
        (towers[s.sym] = towers[s.sym] || []).push(s);
    });

    function toggleTower(sym: string) {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(sym) ? next.delete(sym) : next.add(sym);
            return next;
        });
    }

    function initiateDelete(id: string) {
        setDeleteTarget(id);
        setDeletePass("");
        setDeleteErr(false);
    }

    function confirmDelete() {
        if (deletePass !== DELETE_PASSWORD) { setDeleteErr(true); return; }
        if (deleteTarget) onDelete(deleteTarget);
        setDeleteTarget(null);
        setDeletePass("");
        setDeleteErr(false);
    }

    function cancelDelete() {
        setDeleteTarget(null);
        setDeletePass("");
        setDeleteErr(false);
    }

    return (
        <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <Inp value={q} onChange={(v) => setQ(v.toLowerCase())} placeholder="filter..." w={200} />
                <span style={{ fontSize: 11, color: C.text3, fontFamily: C.mono }}>
                    {vis.length} strategies * {Object.keys(towers).length} towers
                </span>
            </div>

            {deleteTarget !== null && (
                <div style={{
                    background: C.redDim,
                    border: `1px solid ${C.red}55`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 14,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}>
                    <span style={{ fontFamily: C.mono, fontSize: 11, color: C.red }}>
                        Delete <strong>{deleteTarget}</strong> — enter password:
                    </span>
                    <input
                        type="password"
                        value={deletePass}
                        onChange={(e) => { setDeletePass(e.target.value); setDeleteErr(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter") confirmDelete(); if (e.key === "Escape") cancelDelete(); }}
                        autoFocus
                        placeholder="password"
                        style={{
                            background: C.bg3,
                            color: C.text,
                            border: `1px solid ${deleteErr ? C.red : C.border2}`,
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontFamily: C.mono,
                            fontSize: 12,
                            width: 130,
                            outline: "none",
                        }}
                    />
                    {deleteErr && <span style={{ fontFamily: C.mono, fontSize: 10, color: C.red }}>wrong password</span>}
                    <Btn variant="danger" small onClick={confirmDelete}>confirm</Btn>
                    <Btn variant="ghost" small onClick={cancelDelete}>cancel</Btn>
                </div>
            )}

            <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontFamily: C.mono, fontSize: 11, minWidth: 920 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                            {[
                                "Tower",
                                "ID",
                                "Name",
                                "L",
                                "Bar",
                                "Vector",
                                "Construction",
                                "Fill_form",
                                "Diff_form",
                                "",
                            ].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        textAlign: "left",
                                        padding: "5px 8px",
                                        color: C.text3,
                                        fontWeight: 400,
                                        fontSize: 10,
                                        textTransform: "uppercase",
                                        letterSpacing: 1,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(towers).map(([sym, group]) => {
                            const isExpanded = expanded.has(sym);
                            const hasChildren = group.length > 1;
                            return group.map((s, gi) => {
                                if (gi > 0 && !isExpanded) return null;
                                return (
                                    <tr
                                        key={s.id}
                                        style={{
                                            borderBottom: `1px solid ${C.border}`,
                                            background: gi % 2 ? C.bg1 + "55" : "transparent",
                                        }}
                                    >
                                        <td style={{ padding: "7px 8px" }}>
                                            {gi === 0 ? (
                                                <span
                                                    onClick={hasChildren ? () => toggleTower(sym) : undefined}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        color: C.accent,
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        cursor: hasChildren ? "pointer" : "default",
                                                        userSelect: "none",
                                                    }}
                                                >
                                                    {hasChildren && (
                                                        <span style={{
                                                            fontSize: 8,
                                                            color: C.text3,
                                                            display: "inline-block",
                                                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                                            transition: "transform 0.15s",
                                                        }}>▶</span>
                                                    )}
                                                    {sym}
                                                    {hasChildren && (
                                                        <span style={{ fontSize: 9, color: C.text3, fontWeight: 400 }}>({group.length})</span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span style={{ color: C.text3, paddingLeft: 8, fontSize: 11 }}>- {sym}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "7px 8px", color: s.custom ? C.green : C.text, fontWeight: 600, whiteSpace: "nowrap" }}>
                                            {s.id} {s.custom && <Bdg v="ok">c</Bdg>}
                                        </td>
                                        <td style={{ padding: "7px 8px", color: C.text2 }}>{s.name}</td>
                                        <td style={{ padding: "7px 8px", color: C.text3 }}>{s.legs.filter((v) => v !== 0).length}</td>
                                        <td style={{ padding: "7px 8px" }}>
                                            <MiniBar legs={s.legs} h={22} />
                                        </td>
                                        <td
                                            style={{
                                                padding: "7px 8px",
                                                color: C.text3,
                                                maxWidth: 130,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                fontSize: 10,
                                            }}
                                            title={legsStr(s.legs)}
                                        >
                                            {legsStr(s.legs)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "7px 8px",
                                                color: C.text3,
                                                fontSize: 10,
                                                maxWidth: 150,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                            title={s.rule}
                                        >
                                            {s.rule}
                                        </td>
                                        <td style={{ padding: "7px 8px", color: C.accent, fontSize: 10, maxWidth: 160, wordBreak: "break-word" }}>
                                            {s.fill_form || <span style={{ color: C.text3 }}>-</span>}
                                        </td>
                                        <td style={{ padding: "4px 8px" }}>
                                            <input
                                                key={s.id + s.diff_form}
                                                defaultValue={s.diff_form || ""}
                                                onBlur={(e) => onDiffChange(s.id, e.target.value)}
                                                placeholder="e.g. 2*F[1]"
                                                style={{
                                                    background: C.bg3,
                                                    color: C.text,
                                                    border: `1px solid ${C.border}`,
                                                    borderRadius: 4,
                                                    padding: "3px 6px",
                                                    fontFamily: C.mono,
                                                    fontSize: 10,
                                                    width: 148,
                                                    outline: "none",
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: "7px 8px" }}>
                                            {s.custom && (
                                                <Btn variant="danger" small onClick={() => initiateDelete(s.id)}>del</Btn>
                                            )}
                                        </td>
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TreeTab({ strategies }: { strategies: Strategy[] }) {
    const [sel, setSel] = useState<string | null>(null);
    const towers: Record<string, Strategy[]> = {};
    strategies.forEach((s) => {
        (towers[s.sym] = towers[s.sym] || []).push(s);
    });
    const selected = sel ? strategies.find((s) => s.id === sel) : null;

    return (
        <div>
            <div style={{ fontSize: 11, color: C.text3, fontFamily: C.mono, marginBottom: 14, lineHeight: 1.8 }}>
                Symbol = tower. Multiple strategies may share a tower (e.g. S-tower: S, 6MS, 3MS...).
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 auto", minWidth: 280 }}>
                    {Object.entries(towers).map(([sym, group]) => (
                        <div key={sym} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: C.mono, minWidth: 40 }}>{sym}</span>
                                <div style={{ height: 1, flex: 1, background: C.border }} />
                                <span style={{ fontSize: 9, color: C.text3, fontFamily: C.mono }}>tower ({group.length})</span>
                            </div>
                            {group.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => setSel(sel === s.id ? null : s.id)}
                                    style={{
                                        marginLeft: 18,
                                        marginBottom: 4,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "4px 11px",
                                        border: `1px solid ${sel === s.id ? (s.custom ? C.green : C.accent) : C.border}`,
                                        borderRadius: 6,
                                        background: sel === s.id ? (s.custom ? C.greenDim : C.accentDim) : C.bg2,
                                        cursor: "pointer",
                                        transition: "all .13s",
                                        fontFamily: C.mono,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: s.custom ? C.green : C.text, fontWeight: 600 }}>{s.id}</span>
                                    <span style={{ fontSize: 11, color: C.text2 }}>{s.name}</span>
                                    <span style={{ fontSize: 10, color: C.text3 }}>{s.legs.length}L</span>
                                    {s.custom && <Bdg v="ok">c</Bdg>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {selected ? (
                    <Card accent={selected.custom ? C.green + "55" : C.accent + "55"} style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: selected.custom ? C.green : C.accent, fontFamily: C.mono, marginBottom: 10 }}>
                            {selected.id}[n]
                            <span style={{ fontSize: 11, color: C.text3, fontWeight: 400, marginLeft: 10 }}>tower: {selected.sym}</span>
                        </div>
                        <div style={{ fontFamily: C.mono, fontSize: 12, lineHeight: 2, color: C.text2 }}>
                            <div><span style={{ color: C.text3 }}>Name: </span>{selected.name}</div>
                            <div><span style={{ color: C.text3 }}>Tier: </span>{selected.tier !== null ? selected.tier : "custom"}</div>
                            <div><span style={{ color: C.text3 }}>Legs: </span>{selected.legs.length}</div>
                            <div><span style={{ color: C.text3 }}>Rule: </span>{selected.rule}</div>
                            {selected.fill_form && <div><span style={{ color: C.text3 }}>Fill_form: </span><span style={{ color: C.accent }}>{selected.fill_form}</span></div>}
                            {selected.diff_form && <div><span style={{ color: C.text3 }}>Diff_form: </span><span style={{ color: C.amber }}>{selected.diff_form}</span></div>}
                        </div>
                        <div style={{ marginTop: 10 }}><MiniBar legs={selected.legs} h={44} /></div>
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.text3, marginTop: 6, wordBreak: "break-all" }}>{legsStr(selected.legs)}</div>
                    </Card>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: C.mono, fontSize: 12, color: C.text3 }}>&lt;- select a strategy to inspect</span>
                    </div>
                )}
            </div>
            <div style={{ marginTop: 20, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 15px", fontFamily: C.mono, fontSize: 11, color: C.text3, lineHeight: 1.9 }}>
                <span style={{ color: C.accent }}>AXIOM</span>: Z(x) = m1*A(x) + m2*B(x) + m3*C(x) + ... - each operand has its own sign, offset, and multiple.
                Symbol defines the tower. ID is the unique instrument identifier.
            </div>
        </div>
    );
}

const mkOp = (): Operand => ({ stratIdx: 0, sign: 1, offset: 0, multiple: 1 });
const VAR = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function ComposerTab({
    strategies,
    onSave,
    onStoreFill,
}: {
    strategies: Strategy[];
    onSave: (s: Strategy) => void;
    onStoreFill: (id: string, txt: string) => void;
}) {
    const [numTerms, setNumTerms] = useState(2);
    const [ops, setOps] = useState<Operand[]>([mkOp(), mkOp()]);
    const [decomps, setDecomps] = useState<DecompResult[] | null>(null);
    const [fillWhich, setFillWhich] = useState(0);
    const [fillTarget, setFillTarget] = useState(0);
    const [nId, setNId] = useState("");
    const [nSym, setNSym] = useState("");
    const [nName, setNName] = useState("");
    const [msg, setMsg] = useState("");

    function changeN(n: number) {
        setNumTerms(n);
        setDecomps(null);
        setOps((prev) =>
            n > prev.length
                ? [...prev, ...Array.from({ length: n - prev.length }, mkOp)]
                : prev.slice(0, n)
        );
    }

    function upd(i: number, field: keyof Operand, val: number) {
        setDecomps(null);
        setOps((prev) => prev.map((op, j) => (j === i ? { ...op, [field]: val } : op)));
    }

    const result = composeN(ops, strategies);
    const match = result.length ? strategies.find((s) => legsKey(s.legs) === legsKey(result)) || null : null;

    function notation() {
        return (
            "Z(x) = " +
            ops
                .map((op, i) => {
                    const s = strategies[op.stratIdx];
                    if (!s) return "?";
                    const sign = op.sign === 1 ? (i === 0 ? "" : " + ") : (i === 0 ? "-" : " - ");
                    const m = op.multiple !== 1 ? `${op.multiple}*` : "";
                    const off = op.offset !== 0 ? `[+${op.offset}]` : "";
                    return `${sign}${m}${s.id}(x${off})`;
                })
                .join("")
        );
    }

    const idTaken = nId && strategies.some((s) => s.id.toLowerCase() === nId.toLowerCase());
    const canSave = nId && nSym && nName && !idTaken && !match && result.length > 0;
    const selOpts: Option[] = strategies.map((s, i) => ({
        value: String(i),
        label: `${s.id} - ${s.name} (${s.sym}^, ${s.legs.length}L)`,
    }));

    function doSave() {
        if (!canSave) return;
        onSave({ id: nId, sym: nSym, name: nName, rule: notation(), legs: [...result], custom: true, tier: null, fill_form: "", diff_form: "" });
        setNId("");
        setNSym("");
        setNName("");
        setMsg(`${nId} added`);
        setTimeout(() => setMsg(""), 3000);
    }

    function doDecomp() {
        if (result.length) setDecomps(decompose(result));
    }

    function doStoreFill() {
        if (!decomps?.[fillWhich]) return;
        onStoreFill(strategies[fillTarget].id, fmtDecomp(decomps[fillWhich].terms));
        setMsg(`Fill_form stored for ${strategies[fillTarget].id}`);
        setTimeout(() => setMsg(""), 3000);
    }

    return (
        <div>
            <Card style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <SH>Terms in Z equation</SH>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[2, 3, 4, 5, 6].map((n) => (
                            <Btn key={n} variant={numTerms === n ? "primary" : "ghost"} onClick={() => changeN(n)}>
                                {n}
                            </Btn>
                        ))}
                    </div>
                    <span style={{ fontFamily: C.mono, fontSize: 11, color: C.text3 }}>
                        Z(x) = {VAR.slice(0, numTerms).map((v, i) => (i > 0 ? " +/- " : "") + `m${i + 1}*${v}(x)`).join("")}
                    </span>
                </div>

                {ops.map((op, i) => {
                    const s = strategies[op.stratIdx];
                    return (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 10px", background: C.bg3, borderRadius: 8, marginBottom: 6 }}>
                            <span style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 700, color: C.accent, minWidth: 18 }}>{VAR[i]}</span>
                            <div style={{ display: "flex", gap: 3 }}>
                                <Btn small variant={op.sign === 1 ? "primary" : "ghost"} onClick={() => upd(i, "sign", 1)}>+</Btn>
                                <Btn small variant={op.sign === -1 ? "primary" : "ghost"} onClick={() => upd(i, "sign", -1)}>-</Btn>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.text3 }}>m{i + 1}</span>
                                <NumIn value={op.multiple} onChange={(v) => upd(i, "multiple", Math.max(1, v))} min={1} max={9} w={48} />
                            </div>
                            <Sel value={String(op.stratIdx)} onChange={(v) => upd(i, "stratIdx", Number(v))} options={selOpts} w={220} />
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.text3 }}>offset</span>
                                <NumIn value={op.offset} onChange={(v) => upd(i, "offset", Math.max(0, v))} min={0} max={20} w={52} />
                            </div>
                            {s && <MiniBar legs={s.legs} h={24} />}
                        </div>
                    );
                })}
            </Card>

            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, marginBottom: 12, padding: "8px 12px", background: C.bg2, borderRadius: 8, border: `1px solid ${C.border}`, wordBreak: "break-all" }}>
                <span style={{ color: C.text3 }}>notation: </span>
                {notation()}
                {match && <span style={{ color: C.accent }}> = {match.id}</span>}
            </div>

            {result.length > 0 && (
                <Card accent={match ? C.accent + "55" : C.amber + "55"} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 10, color: C.text3, textTransform: "uppercase", letterSpacing: 1, fontFamily: C.mono, marginBottom: 4 }}>
                                Z = result
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: match ? (match.custom ? C.green : C.accent) : C.amber, fontFamily: C.mono }}>
                                {match ? match.id : "?"}
                            </div>
                            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, marginBottom: 8 }}>
                                {match ? match.name : "(unnamed)"}
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.text3 }}>{result.length}L</span>
                                {match ? <Bdg v={match.custom ? "ok" : "info"}>{match.custom ? "custom" : "known"}</Bdg> : <Bdg v="warn">unnamed</Bdg>}
                            </div>
                            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.text3, wordBreak: "break-all" }}>{legsStr(result)}</div>
                        </div>
                        <MiniBar legs={result} h={50} />
                    </div>
                </Card>
            )}

            {result.length > 0 && (
                <Card style={{ marginBottom: 8 }}>
                    {!match && (
                        <>
                            <SH>Save to catalog</SH>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>ID (unique identifier)</div>
                                    <Inp value={nId} onChange={setNId} placeholder="e.g. 6MS" w={110} />
                                    {idTaken && <div style={{ fontSize: 10, color: C.red, fontFamily: C.mono, marginTop: 2 }}>ID taken</div>}
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>Symbol (tower placement)</div>
                                    <Inp value={nSym} onChange={setNSym} placeholder="e.g. S, F, NEW" w={110} />
                                    {nSym && (
                                        <div style={{ fontSize: 9, color: C.text3, fontFamily: C.mono, marginTop: 2 }}>
                                            {strategies.some((s) => s.sym === nSym) ? `-> joins ${nSym}-tower` : `-> new tower: ${nSym}`}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>Name</div>
                                    <Inp value={nName} onChange={setNName} placeholder="e.g. 6-Month Spread" w={190} />
                                </div>
                                <Btn variant="primary" disabled={!canSave} onClick={doSave}>+ Add to catalog</Btn>
                            </div>
                        </>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                        <Btn onClick={doDecomp}>Decompose {"->"} fill forms</Btn>
                    </div>
                    {decomps !== null && (
                        <div style={{ marginTop: 12 }}>
                            <SH>Fill forms - S & F decomposition</SH>
                            {!decomps.length && <div style={{ fontSize: 11, color: C.text3, fontFamily: C.mono }}>No decomposition found.</div>}
                            {decomps.map((d, i) => (
                                <div key={i} style={{ background: C.bg3, border: `1px solid ${i === 0 ? C.accent : C.border}`, borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                                        <Bdg v={i === 0 ? "info" : "ghost"}>form {i + 1}{i === 0 ? " - best" : ""}</Bdg>
                                        <span style={{ fontSize: 10, color: C.text3, fontFamily: C.mono }}>{d.count} term{d.count > 1 ? "s" : ""}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: C.text, fontFamily: C.mono, marginBottom: 4 }}>{fmtDecomp(d.terms)}</div>
                                    {d.terms.map((t, j) => (
                                        <div key={j} style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginLeft: 10 }}>
                                            {(t.coeff > 0 ? "+" : "") + t.coeff}*{t.block.sym} {legsStr(t.block.legs)}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {decomps.length > 0 && (
                                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: C.text3, fontFamily: C.mono }}>Store Fill_form for:</span>
                                    <Sel value={String(fillTarget)} onChange={(v) => setFillTarget(Number(v))} options={strategies.map((s, i) => ({ value: String(i), label: `${s.id} - ${s.name}` }))} w={200} />
                                    <Sel value={String(fillWhich)} onChange={(v) => setFillWhich(Number(v))} options={[0, 1, 2].map((i) => ({ value: String(i), label: `Form ${i + 1}${i === 0 ? " (best)" : ""}` }))} w={130} />
                                    <Btn variant="primary" onClick={doStoreFill} disabled={!decomps[fillWhich]}>Store</Btn>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}
            {msg && <div style={{ marginTop: 6, fontSize: 11, color: C.green, fontFamily: C.mono }}>{msg}</div>}
        </div>
    );
}

function ManualTab({ strategies, onSave }: { strategies: Strategy[]; onSave: (s: Strategy) => void }) {
    const [id, setId] = useState("");
    const [sym, setSym] = useState("");
    const [name, setName] = useState("");
    const [raw, setRaw] = useState("");
    const [decomps, setDecomps] = useState<DecompResult[] | null>(null);
    const [msg, setMsg] = useState("");

    const legs = raw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((v) => !isNaN(v));
    const valid = legs.length >= 2;
    const idTaken = id && strategies.some((s) => s.id.toLowerCase() === id.toLowerCase());
    const canSave = id && sym && name && valid && !idTaken;

    function doSave() {
        if (!canSave) return;
        onSave({ id, sym, name, rule: "manual entry", legs, custom: true, tier: null, fill_form: "", diff_form: "" });
        setId("");
        setSym("");
        setName("");
        setRaw("");
        setDecomps(null);
        setMsg(`${id} added`);
        setTimeout(() => setMsg(""), 3000);
    }

    return (
        <div>
            <div style={{ fontSize: 11, color: C.text3, fontFamily: C.mono, marginBottom: 14, lineHeight: 1.8 }}>
                Enter legs vector directly. ID is the unique identifier; Symbol assigns tower.
            </div>
            <Card style={{ maxWidth: 560 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    <div>
                        <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>ID (unique)</div>
                        <Inp value={id} onChange={setId} placeholder="e.g. 6MS" w={100} />
                        {idTaken && <div style={{ fontSize: 10, color: C.red, fontFamily: C.mono, marginTop: 2 }}>taken</div>}
                    </div>
                    <div>
                        <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>Symbol (tower)</div>
                        <Inp value={sym} onChange={setSym} placeholder="e.g. S, F" w={90} />
                        {sym && (
                            <div style={{ fontSize: 9, color: C.text3, fontFamily: C.mono, marginTop: 2 }}>
                                {strategies.some((s) => s.sym === sym) ? `-> joins ${sym}-tower` : `-> new tower: ${sym}`}
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>Name</div>
                        <Inp value={name} onChange={setName} placeholder="e.g. 6-Month Spread" w={170} />
                    </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginBottom: 3 }}>Legs vector</div>
                    <Inp value={raw} onChange={setRaw} placeholder="1,0,0,-2,0,0,1" w={280} />
                </div>
                {valid && (
                    <div style={{ marginBottom: 10 }}>
                        <MiniBar legs={legs} h={36} />
                        <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, marginTop: 4 }}>
                            {legsStr(legs)} * {legs.length}L
                        </div>
                    </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="primary" disabled={!canSave} onClick={doSave}>+ Add to catalog</Btn>
                    <Btn disabled={!valid} onClick={() => setDecomps(decompose(legs))}>Decompose {"->"} fill forms</Btn>
                </div>
                {decomps !== null && (
                    <div style={{ marginTop: 12 }}>
                        <SH>Fill forms</SH>
                        {!decomps.length && <div style={{ fontSize: 11, color: C.text3, fontFamily: C.mono }}>No decomposition found.</div>}
                        {decomps.map((d, i) => (
                            <div key={i} style={{ background: C.bg3, border: `1px solid ${i === 0 ? C.accent : C.border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                                    <Bdg v={i === 0 ? "info" : "ghost"}>form {i + 1}</Bdg>
                                    <span style={{ fontSize: 10, color: C.text3, fontFamily: C.mono }}>{d.count} terms</span>
                                </div>
                                <div style={{ fontSize: 12, color: C.text, fontFamily: C.mono }}>{fmtDecomp(d.terms)}</div>
                            </div>
                        ))}
                    </div>
                )}
                {msg && <div style={{ marginTop: 8, fontSize: 11, color: C.green, fontFamily: C.mono }}>{msg}</div>}
            </Card>
        </div>
    );
}

function NotationTab({ strategies }: { strategies: Strategy[] }) {
    const ref: [string, string][] = [
        ["ID", "Unique instrument identifier (e.g. 6MS, 3F). No two strategies share an ID."],
        ["Symbol", "Tower membership. Multiple strategies share a symbol (S, F, ...). New symbol = new tower."],
        ["ID[n]", "Strategy anchored at month n. e.g. 6MS[2] covers months from 2."],
        ["Z(x) = Sum m_i*A_i(x+k_i)", "General N-term composition. Each term: sign, multiple m, operand, offset k."],
        ["A (+/-)[k][m1.m2] B", "2-term shorthand. k=offset, m1,m2=multiples."],
        ["(-)[0][1.1]", "Primary tower default: adjacent difference, offset 0, unit multiples."],
        ["Fill_form", "Decomposition into S & F building blocks (the only reliably fillable instruments)."],
        ["Diff_form", "User-supplied alternative expression using any strategies."],
    ];
    return (
        <div>
            <Card style={{ marginBottom: 16, fontFamily: C.mono, fontSize: 12, lineHeight: 2, color: C.text2 }}>
                {ref.map(([k, v]) => (
                    <div key={k}>
                        <span style={{ color: C.accent }}>{k}: </span>
                        {v}
                    </div>
                ))}
            </Card>
            <SH>Full catalog</SH>
            <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontFamily: C.mono, fontSize: 11, width: "100%" }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                            {["Tower", "ID", "Name", "L", "Construction", "Fill_form", "Diff_form"].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        textAlign: "left",
                                        padding: "5px 8px",
                                        color: C.text3,
                                        fontWeight: 400,
                                        fontSize: 10,
                                        textTransform: "uppercase",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {strategies.map((s) => (
                            <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td style={{ padding: "6px 8px", color: C.accent, fontWeight: 700 }}>{s.sym}</td>
                                <td style={{ padding: "6px 8px", color: s.custom ? C.green : C.text, fontWeight: 600 }}>{s.id}</td>
                                <td style={{ padding: "6px 8px", color: C.text2 }}>{s.name}</td>
                                <td style={{ padding: "6px 8px", color: C.text3 }}>{s.legs.filter((v) => v !== 0).length}</td>
                                <td style={{ padding: "6px 8px", color: C.text3, fontSize: 10 }}>{s.rule}</td>
                                <td style={{ padding: "6px 8px", color: C.accent, fontSize: 10 }}>{s.fill_form || "-"}</td>
                                <td style={{ padding: "6px 8px", color: C.amber, fontSize: 10 }}>{s.diff_form || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function StrategyTaxonomyPage() {
    const [tab, setTab] = useState("catalog");
    const [customs, setCustoms] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustoms().then((c) => {
            setCustoms(c);
            setLoading(false);
        });
    }, []);

    const strategies = [
        ...BUILT_IN.map((s) => {
            const saved = customs.find((c) => c.id === s.id);
            return saved ? { ...s, fill_form: saved.fill_form || "", diff_form: saved.diff_form || "" } : s;
        }),
        ...customs
            .filter((c) => !BUILT_IN.find((b) => b.id === c.id))
            .map((c) => ({ ...c, custom: true })),
    ];

    async function handleSave(entry: Strategy) {
        const saved = await createCustom(entry);
        if (saved) setCustoms((prev) => [...prev.filter((c) => c.id !== entry.id), saved]);
    }

    async function handleDelete(id: string) {
        await deleteCustom(id);
        setCustoms((prev) => prev.filter((c) => c.id !== id));
    }

    async function handleDiffChange(id: string, val: string) {
        const existing = customs.find((c) => c.id === id);
        const bi = BUILT_IN.find((s) => s.id === id);
        if (existing) {
            const saved = await updateCustom(id, { diff_form: val });
            if (saved) setCustoms((prev) => prev.map((c) => (c.id === id ? saved : c)));
        } else if (bi) {
            const saved = await createCustom({ ...bi, diff_form: val, fill_form: "", custom: true, tier: bi.tier ?? null });
            if (saved) setCustoms((prev) => [...prev, saved]);
        }
    }

    async function handleStoreFill(id: string, txt: string) {
        const existing = customs.find((c) => c.id === id);
        const bi = BUILT_IN.find((s) => s.id === id);
        if (existing) {
            const saved = await updateCustom(id, { fill_form: txt });
            if (saved) setCustoms((prev) => prev.map((c) => (c.id === id ? saved : c)));
        } else if (bi) {
            const saved = await createCustom({ ...bi, fill_form: txt, diff_form: "", custom: true, tier: bi.tier ?? null });
            if (saved) setCustoms((prev) => [...prev, saved]);
        }
    }

    const TABS = [
        { id: "catalog", label: "Catalog" },
        { id: "tree", label: "Tree" },
        { id: "composer", label: "Composer" },
        { id: "manual", label: "Manual entry" },
        { id: "naming", label: "Notation" },
    ];

    if (loading) {
        return (
            <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, color: C.text3 }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
            <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: 3, marginBottom: 1 }}>
                        Instrument Strategy Framework
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: C.text, fontFamily: C.mono }}>Derived Strategy Taxonomy</div>
                </div>
                <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono, textAlign: "right", lineHeight: 1.9 }}>
                    <div>{strategies.length} strategies * {strategies.filter((s) => s.custom).length} custom</div>
                    <div style={{ color: C.green }}>* DB active</div>
                </div>
            </div>
            <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: "0 22px", display: "flex" }}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            padding: "9px 15px",
                            fontSize: 12,
                            background: "none",
                            border: "none",
                            borderBottom: `2px solid ${tab === t.id ? C.accent : "transparent"}`,
                            cursor: "pointer",
                            color: tab === t.id ? C.accent : C.text3,
                            fontFamily: C.mono,
                            marginBottom: -1,
                            transition: "color .13s",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div style={{ padding: "18px 22px", maxWidth: 1120, margin: "0 auto" }}>
                {tab === "catalog" && <CatalogTab strategies={strategies} onDelete={handleDelete} onDiffChange={handleDiffChange} />}
                {tab === "tree" && <TreeTab strategies={strategies} />}
                {tab === "composer" && <ComposerTab strategies={strategies} onSave={handleSave} onStoreFill={handleStoreFill} />}
                {tab === "manual" && <ManualTab strategies={strategies} onSave={handleSave} />}
                {tab === "naming" && <NotationTab strategies={strategies} />}
            </div>
        </div>
    );
}
