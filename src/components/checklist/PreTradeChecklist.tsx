"use client";

import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/lib/data/types";

const STORAGE_KEY = "projectx_checklist_v1";

export default function PreTradeChecklist({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setChecked(new Set(arr));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checked)));
    } catch {
      /* ignore */
    }
  }, [checked, loaded]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
  }

  const total = items.length;
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div className="card mb">
      <div className="cl">Pre-Trade Checklist — Interactive</div>
      <div>
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <div key={item.id} className="chk-item">
              <button
                type="button"
                className={isChecked ? "chk-box checked" : "chk-box"}
                onClick={() => toggle(item.id)}
                aria-label={isChecked ? "Uncheck" : "Check"}
              />
              <div className={isChecked ? "chk-txt checked" : "chk-txt"}>{item.text}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 9,
          paddingTop: 9,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 9.5, color: "var(--muted)" }}>
          Completion:{" "}
          <span style={{ color: "var(--accent)" }}>
            {done} / {total}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          style={{
            fontSize: 9,
            color: "var(--muted2)",
            textDecoration: "underline",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
}
