"use client";

import { useState } from "react";
import FeedbackForm from "./FeedbackForm";
import type { FeedbackEntry } from "@/lib/data/types";

type ReviewViewerProps = {
    allFeedback: FeedbackEntry[];
    nextSessionNumber: number;
    today: string;
};

export default function ReviewViewer({ allFeedback, nextSessionNumber, today }: ReviewViewerProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const sortedByDate = [...allFeedback].sort((a, b) => {
        const dateA = new Date(a.session_date).getTime();
        const dateB = new Date(b.session_date).getTime();
        return dateB - dateA; // Most recent first
    });

    const currentEntry = sortedByDate[selectedIndex];
    const hasNext = selectedIndex < sortedByDate.length - 1;
    const hasPrev = selectedIndex > 0;

    const handlePrevious = () => {
        if (hasPrev) setSelectedIndex(selectedIndex + 1);
    };

    const handleNext = () => {
        if (hasNext) setSelectedIndex(selectedIndex - 1);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = event.target.value;
        const index = sortedByDate.findIndex((entry) => entry.session_date === selectedDate);
        if (index !== -1) setSelectedIndex(index);
    };

    return (
        <>
            {/* Add New Review Button */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 3,
                        border: "1px solid var(--border)",
                        background: showForm ? "var(--teal)" : "var(--accent)",
                        color: showForm ? "black" : "black",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                >
                    {showForm ? "−" : "+"} New EOD Review
                </button>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {sortedByDate.length} reviews recorded
                </div>
            </div>

            {/* Collapsible Form */}
            {showForm && (
                <div style={{ marginBottom: 20 }}>
                    <FeedbackForm initialSessionNumber={nextSessionNumber} initialDate={today} />
                </div>
            )}

            {/* Review Viewer */}
            {sortedByDate.length > 0 && currentEntry ? (
                <>
                    {/* Navigation and Date Picker */}
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <button
                            onClick={handlePrevious}
                            disabled={!hasPrev}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 3,
                                border: "1px solid var(--border)",
                                background: hasPrev ? "var(--bg3)" : "var(--bg2)",
                                color: hasPrev ? "var(--text)" : "var(--muted)",
                                cursor: hasPrev ? "pointer" : "not-allowed",
                                fontSize: 11,
                            }}
                        >
                            ← Older
                        </button>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                                Session #
                                <input
                                    value={currentEntry.session_number}
                                    type="number"
                                    disabled
                                    style={{
                                        width: "100%",
                                        padding: 8,
                                        borderRadius: 3,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg2)",
                                        color: "var(--text2)",
                                    }}
                                />
                            </label>
                            <label style={{ display: "grid", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                                Date
                                <input
                                    value={currentEntry.session_date}
                                    type="date"
                                    onChange={handleDateChange}
                                    style={{
                                        width: "100%",
                                        padding: 8,
                                        borderRadius: 3,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg3)",
                                        color: "var(--text)",
                                        cursor: "pointer",
                                    }}
                                />
                            </label>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!hasNext}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 3,
                                border: "1px solid var(--border)",
                                background: hasNext ? "var(--bg3)" : "var(--bg2)",
                                color: hasNext ? "var(--text)" : "var(--muted)",
                                cursor: hasNext ? "pointer" : "not-allowed",
                                fontSize: 11,
                            }}
                        >
                            Newer →
                        </button>
                    </div>

                    {/* Review Display */}
                    <div className="card">
                        <div className="cl">
                            Session {currentEntry.session_number} · {currentEntry.session_date}
                        </div>
                        <div className="cv">Feedback review</div>
                        <div className="cs" style={{ marginBottom: 12 }}>
                            {currentEntry.tags?.length ? currentEntry.tags.join(" · ") : "No tags"}
                        </div>

                        <div style={{ display: "grid", gap: 12 }}>
                            {currentEntry.went_well ? (
                                <div>
                                    <div style={{ fontSize: 11, color: "var(--teal)", marginBottom: 4 }}>✓ What went well</div>
                                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                                        {currentEntry.went_well}
                                    </div>
                                </div>
                            ) : null}

                            {currentEntry.didnt_go_well ? (
                                <div>
                                    <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 4 }}>✗ What didn't go well</div>
                                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                                        {currentEntry.didnt_go_well}
                                    </div>
                                </div>
                            ) : null}

                            {currentEntry.to_improve ? (
                                <div>
                                    <div style={{ fontSize: 11, color: "var(--amber)", marginBottom: 4 }}>→ What to improve</div>
                                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                                        {currentEntry.to_improve}
                                    </div>
                                </div>
                            ) : null}

                            {currentEntry.mistake ? (
                                <div>
                                    <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 4 }}>⚠ Mistake</div>
                                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                                        {currentEntry.mistake}
                                    </div>
                                </div>
                            ) : null}

                            {currentEntry.learning ? (
                                <div>
                                    <div style={{ fontSize: 11, color: "var(--teal)", marginBottom: 4 }}>🧠 Learning</div>
                                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                                        {currentEntry.learning}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Pagination Info */}
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
                        Showing {selectedIndex + 1} of {sortedByDate.length} reviews
                    </div>
                </>
            ) : (
                <div className="card">
                    <div className="cv">No reviews yet</div>
                    <div className="cs">Start by adding your first EOD review above.</div>
                </div>
            )}
        </>
    );
}
