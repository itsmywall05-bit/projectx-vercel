"use client";

import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/lib/data/types";

const STORAGE_KEY = "projectx_checklist_v1";

export default function PreTradeChecklist({ items: initialItems }: { items: ChecklistItem[] }) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newItemText, setNewItemText] = useState("");

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

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checked)));
    } catch {
      /* ignore */
    }
  }, [checked, loaded]);

  function toggle(id: string) {
    if (isEditing) return;
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

  async function handleAdd() {
    if (!newItemText.trim()) return;
    const position = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 1;
    const res = await fetch("/api/checklist", {
      method: "POST",
      body: JSON.stringify({ text: newItemText, position }),
    });
    const added = await res.json();
    if (added.id) {
      setItems([...items, added]);
      setNewItemText("");
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/checklist", { method: "DELETE", body: JSON.stringify({ id }) });
    setItems(items.filter((i) => i.id !== id));
    if (checked.has(id)) {
      const next = new Set(checked);
      next.delete(id);
      setChecked(next);
    }
  }

  async function handleUpdateText(id: string, text: string) {
    await fetch("/api/checklist", { method: "PUT", body: JSON.stringify({ id, text }) });
    setItems(items.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  const total = items.length;
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div className="card mb">
      <div className="cl flex justify-between items-center mb-4">
        <span>Pre-Trade Checklist — Interactive</span>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-xs text-accent hover:text-white transition-colors"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>
      <div>
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <div key={item.id} className="chk-item flex items-center gap-3 py-1">
              {!isEditing && (
                <button
                  type="button"
                  className={isChecked ? "chk-box checked" : "chk-box"}
                  onClick={() => toggle(item.id)}
                  aria-label={isChecked ? "Uncheck" : "Check"}
                />
              )}
              {isEditing ? (
                <div className="flex flex-1 gap-2">
                  <input 
                    className="flex-1 bg-bg4 border border-border2 text-text text-sm rounded px-2 py-1 focus:border-accent outline-none"
                    value={item.text}
                    onChange={(e) => handleUpdateText(item.id, e.target.value)}
                  />
                  <button onClick={() => handleDelete(item.id)} className="text-red hover:text-white text-xs px-2">✕</button>
                </div>
              ) : (
                <div className={isChecked ? "chk-txt checked flex-1" : "chk-txt flex-1"}>{item.text}</div>
              )}
            </div>
          );
        })}
        {isEditing && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <input 
                placeholder="New checklist item..."
                className="flex-1 bg-bg4 border border-border2 text-text text-sm rounded px-2 py-1 focus:border-accent outline-none"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button onClick={handleAdd} className="bg-accent text-bg font-bold px-3 py-1 rounded text-xs hover:bg-[#a6d848]">Add</button>
            </div>
        )}
      </div>
      {!isEditing && (
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
      )}
    </div>
  );
}
