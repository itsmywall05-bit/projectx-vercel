"use client";

import { useState, type FormEvent } from "react";

type FeedbackFormProps = {
    initialSessionNumber: number;
    initialDate: string;
};

function normalizeTags(value: string): string[] {
    return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

export default function FeedbackForm({ initialSessionNumber, initialDate }: FeedbackFormProps) {
    const [sessionNumber, setSessionNumber] = useState(initialSessionNumber);
    const [sessionDate, setSessionDate] = useState(initialDate);
    const [wentWell, setWentWell] = useState("");
    const [didntGoWell, setDidntGoWell] = useState("");
    const [toImprove, setToImprove] = useState("");
    const [mistake, setMistake] = useState("");
    const [learning, setLearning] = useState("");
    const [tags, setTags] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const formBody = [
        wentWell && `What went well: ${wentWell}`,
        didntGoWell && `What didn't go well: ${didntGoWell}`,
        toImprove && `What to improve: ${toImprove}`,
        mistake && `Mistake: ${mistake}`,
        learning && `Learning: ${learning}`,
    ]
        .filter(Boolean)
        .join("\n\n");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setStatus(null);

        const payload = {
            session_number: Number(sessionNumber),
            session_date: sessionDate,
            body: formBody || "",
            went_well: wentWell || null,
            didnt_go_well: didntGoWell || null,
            to_improve: toImprove || null,
            mistake: mistake || null,
            learning: learning || null,
            tags: normalizeTags(tags),
        };

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.error || "Unable to save feedback");
            }

            setStatus("Feedback saved successfully.");
            setSessionNumber((prev) => prev + 1);
            setWentWell("");
            setDidntGoWell("");
            setToImprove("");
            setMistake("");
            setLearning("");
            setTags("");

            // Refresh page data after 1 second to show new review
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Save failed.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card" style={{ marginBottom: 18 }}>
            <div className="cl">EOD Review</div>
            <div className="cv">Feedback Loop</div>
            <div className="cs" style={{ marginBottom: 14 }}>
                Capture end-of-day review notes for what went well, what didn&apos;t, what to improve, and the learning from the mistake.
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                        Session #
                        <input
                            value={sessionNumber}
                            type="number"
                            min={1}
                            onChange={(event) => setSessionNumber(Number(event.target.value))}
                            style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                        />
                    </label>
                    <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                        Date
                        <input
                            value={sessionDate}
                            type="date"
                            onChange={(event) => setSessionDate(event.target.value)}
                            style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                        />
                    </label>
                </div>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    What went well
                    <textarea
                        value={wentWell}
                        rows={4}
                        onChange={(event) => setWentWell(event.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    What didn&apos;t go well
                    <textarea
                        value={didntGoWell}
                        rows={4}
                        onChange={(event) => setDidntGoWell(event.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    What to improve
                    <textarea
                        value={toImprove}
                        rows={4}
                        onChange={(event) => setToImprove(event.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    Mistake
                    <textarea
                        value={mistake}
                        rows={3}
                        onChange={(event) => setMistake(event.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    Learning from it
                    <textarea
                        value={learning}
                        rows={3}
                        onChange={(event) => setLearning(event.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    Tags (comma separated)
                    <input
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                        placeholder="e.g. daily, lesson, review"
                        style={{ width: "100%", padding: 10, borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)" }}
                    />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ padding: "10px 14px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--accent)", color: "black", cursor: saving ? "not-allowed" : "pointer" }}
                    >
                        {saving ? "Saving…" : "Save review"}
                    </button>
                    {status && <div style={{ color: "var(--text2)", fontSize: 11 }}>{status}</div>}
                </div>
            </form>
        </div>
    );
}
