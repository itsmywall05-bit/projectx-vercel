"use client";

import { useEffect, useRef, useState } from "react";
import type { TaxonomyStrategy } from "@/lib/taxonomy";

function buildTowers(strategies: TaxonomyStrategy[]): Map<string, TaxonomyStrategy[]> {
    const seen = new Set<string>();
    const map = new Map<string, TaxonomyStrategy[]>();
    strategies.forEach((s) => {
        if (seen.has(s.id)) return;
        seen.add(s.id);
        if (!map.has(s.sym)) map.set(s.sym, []);
        map.get(s.sym)!.push(s);
    });
    return map;
}

interface SingleProps {
    multi?: false;
    value: string;
    onChange: (v: string) => void;
    strategies: TaxonomyStrategy[];
    withOutright?: boolean;
    placeholder?: string;
}

interface MultiProps {
    multi: true;
    value: string[];
    onChange: (v: string[]) => void;
    strategies: TaxonomyStrategy[];
    withOutright?: false;
    placeholder?: string;
}

type Props = SingleProps | MultiProps;

export default function TaxonomyDropdown(props: Props) {
    const { strategies, placeholder = "Select" } = props;
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const towers = buildTowers(strategies);

    useEffect(() => {
        if (!open) return;
        function onPointerDown(e: MouseEvent) {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    function isSelected(id: string) {
        return props.multi ? props.value.includes(id) : props.value === id;
    }

    function select(id: string) {
        if (props.multi) {
            const next = props.value.includes(id)
                ? props.value.filter((v) => v !== id)
                : [...props.value, id];
            props.onChange(next);
        } else {
            props.onChange(id);
            setOpen(false);
        }
    }

    const label = props.multi
        ? props.value.length === 0 ? placeholder : props.value.join(", ")
        : props.value || placeholder;

    const hasValue = props.multi ? props.value.length > 0 : !!props.value;

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="px-select-trigger px-select-trigger-md w-full"
            >
                <span className={hasValue ? "px-select-value" : "px-select-placeholder"}>{label}</span>
                <svg
                    className={open ? "px-select-chevron px-select-chevron-open" : "px-select-chevron"}
                    width="12" height="12" viewBox="0 0 20 20" aria-hidden="true"
                >
                    <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="px-select-menu" style={{ minWidth: 220 }}>
                    {/* Outright — single-select only */}
                    {!props.multi && props.withOutright && (
                        <div
                            role="option"
                            aria-selected={props.value === "Outright"}
                            className={`px-select-option ${props.value === "Outright" ? "px-select-option-selected" : ""}`}
                            onClick={() => select("Outright")}
                        >
                            <span className="px-select-option-label">Outright</span>
                        </div>
                    )}

                    {/* Tower rows */}
                    {Array.from(towers.entries()).map(([sym, strats]) => (
                        <div
                            key={sym}
                            className="flex items-center gap-2 px-3 py-1.5"
                            style={{ borderBottom: "1px solid var(--border)" }}
                        >
                            {/* Tower label */}
                            <span
                                className="text-xs font-mono font-bold shrink-0"
                                style={{ color: "var(--muted)", width: 28 }}
                            >
                                {sym}
                            </span>
                            {/* Strategy pills */}
                            <div className="flex flex-wrap gap-1">
                                {strats.map((s) => {
                                    const sel = isSelected(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => select(s.id)}
                                            className="text-xs font-mono px-2 py-0.5 rounded border transition-colors"
                                            style={{
                                                borderColor: sel ? "var(--accent)" : "var(--border2)",
                                                backgroundColor: sel ? "rgba(var(--accent-rgb,45,212,191),0.15)" : "var(--bg3)",
                                                color: sel ? "var(--accent)" : "var(--text2)",
                                            }}
                                        >
                                            {s.id}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
