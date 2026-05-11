import React from "react";
export { default as Select } from "./Select";

// ─── StatCard ───────────────────────────────────────────────────
type StatVariant = "at" | "tt" | "rt" | "amt" | "bt" | "pt" | "ct";

export function StatCard({
    label,
    value,
    sub,
    variant = "at",
    valueColor,
    valueSize,
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    variant?: StatVariant;
    valueColor?: "pos" | "neg" | "acc" | "default";
    valueSize?: "default" | "small";
}) {
    const cvClasses = ["cv"];
    if (valueColor === "pos") cvClasses.push("pos");
    if (valueColor === "neg") cvClasses.push("neg");
    if (valueColor === "acc") cvClasses.push("acc");
    return (
        <div className={`card ${variant}`}>
            <div className="cl">{label}</div>
            <div className={cvClasses.join(" ")} style={valueSize === "small" ? { fontSize: 14 } : undefined}>
                {value}
            </div>
            {sub && <div className="cs">{sub}</div>}
        </div>
    );
}

// ─── SectionHeader ──────────────────────────────────────────────
export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="sh">
            <div className="sh-t">{title}</div>
            <div className="sh-l" />
            {sub && <div className="sh-s">{sub}</div>}
        </div>
    );
}

// ─── PageIntro ──────────────────────────────────────────────────
export function PageIntro({ children }: { children: React.ReactNode }) {
    return <div className="pi">{children}</div>;
}

// ─── Highlight ──────────────────────────────────────────────────
type HighlightTone = "default" | "t" | "a" | "r" | "b" | "p" | "c";
export function Highlight({ children, tone = "default" }: { children: React.ReactNode; tone?: HighlightTone }) {
    return <div className={tone === "default" ? "hl" : `hl ${tone}`}>{children}</div>;
}

// ─── Card (passthrough) ─────────────────────────────────────────
export function Card({
    children,
    variant,
    className = "",
    style,
}: {
    children: React.ReactNode;
    variant?: StatVariant;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className={`card ${variant ?? ""} ${className}`} style={style}>
            {children}
        </div>
    );
}

// ─── StubPage — used for placeholder routes ─────────────────────
export function StubPage({
    icon,
    title,
    text,
    phase,
}: {
    icon: string;
    title: string;
    text: string;
    phase?: string;
}) {
    return (
        <div className="stub-card">
            <div className="stub-icon">{icon}</div>
            <div className="stub-title">
                {title}
                {phase && ` — ${phase}`}
            </div>
            <div className="stub-text">{text}</div>
        </div>
    );
}
