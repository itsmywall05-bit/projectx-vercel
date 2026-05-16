/**
 * Login — v0.3 themed shell.
 *
 * IMPORTANT — manual merge step:
 *   The existing repo has a working login page at `src/app/login/page.tsx`
 *   with passcode auth. Replace the placeholder form below with that logic
 *   (form state, server action / API call, redirect on success).
 *
 *   Keep the visual structure (centered card, logo, themed inputs) — those
 *   pick up the v0.3 look automatically from globals.css.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [passcode, setPasscode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Invalid passcode");
            }
            window.location.href = "/overview";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg)",
                padding: 20,
            }}
        >
            <form
                onSubmit={onSubmit}
                className="card"
                style={{ width: 360, padding: 28, borderTop: "2px solid var(--accent)" }}
            >
                <div
                    style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 800,
                        fontSize: 24,
                        letterSpacing: "-.5px",
                        color: "var(--accent)",
                        marginBottom: 4,
                    }}
                >
                    project<span style={{ color: "var(--text2)", fontWeight: 400 }}>X</span>
                </div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--muted)", marginBottom: 22 }}>
                    V 0.3 — TRADING MIND
                </div>

                <label
                    style={{
                        display: "block",
                        fontSize: 8,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        marginBottom: 6,
                    }}
                >
                    Passcode
                </label>
                <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "var(--bg4)",
                        border: "1px solid var(--border2)",
                        borderRadius: 2,
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        marginBottom: 16,
                        outline: "none",
                    }}
                />

                {error && (
                    <div
                        style={{
                            fontSize: 10,
                            color: "var(--red)",
                            background: "rgba(240,60,92,0.05)",
                            border: "1px solid rgba(240,60,92,0.2)",
                            borderRadius: 2,
                            padding: "6px 10px",
                            marginBottom: 12,
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || passcode.length === 0}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "var(--accent)",
                        color: "var(--bg)",
                        border: "none",
                        borderRadius: 2,
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "Verifying…" : "Enter"}
                </button>

                <div
                    style={{
                        marginTop: 18,
                        fontFamily: "var(--font-serif-italic)",
                        fontStyle: "italic",
                        fontSize: 10,
                        color: "var(--muted)",
                        textAlign: "center",
                    }}
                >
                    The trading mind awaits.
                </div>
            </form>
        </div>
    );
}
