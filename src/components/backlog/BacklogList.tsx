"use client";

import { useMemo, useState } from "react";
import type { BacklogItem } from "@/lib/data/types";

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-green-500",
};

function PriorityDot({ priority }: { priority: string | null }) {
  const color = PRIORITY_COLOR[priority ?? "medium"] ?? PRIORITY_COLOR.medium;
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} title={priority ?? "medium"} />;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export default function BacklogList({ items: initialItems }: { items: BacklogItem[] }) {
  const [items, setItems] = useState<BacklogItem[]>(initialItems);
  const [toggling, setToggling] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const displayItems = useMemo(() => {
    const filtered = selectedTag
      ? items.filter((item) => item.tags?.includes(selectedTag))
      : items;
    // Incomplete items first, done at bottom; preserve original order within each group
    return [...filtered].sort((a, b) => {
      const aDone = a.status === "done" ? 1 : 0;
      const bDone = b.status === "done" ? 1 : 0;
      return aDone - bDone;
    });
  }, [items, selectedTag]);

  async function toggle(item: BacklogItem) {
    if (toggling === item.id) return;
    const nextStatus = item.status === "done" ? "idea" : "done";
    // Optimistic update
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: nextStatus } : i));
    setToggling(item.id);
    try {
      await fetch("/api/backlog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
    } catch {
      // Revert on error
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: item.status } : i));
    } finally {
      setToggling(null);
    }
  }

  return (
    <div>
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedTag("")}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${!selectedTag ? "border-accent" : "border-border"}`}
            style={{ color: !selectedTag ? "var(--accent)" : "var(--muted)" }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${selectedTag === tag ? "border-accent" : "border-border"}`}
              style={{ color: selectedTag === tag ? "var(--accent)" : "var(--muted)" }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-border">
        {displayItems.map((item) => {
          const done = item.status === "done";
          return (
            <div key={item.id} className={`py-3 flex flex-col gap-1 ${done ? "opacity-50" : ""}`}>
              {/* Row: checkbox · priority · date · title · tags */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggle(item)}
                  disabled={toggling === item.id}
                  className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
                    done ? "bg-accent border-accent" : "border-border bg-transparent hover:border-accent"
                  }`}
                  aria-label="Toggle done"
                />
                <PriorityDot priority={item.priority} />
                <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)", width: 80 }}>{formatDate(item.entry_date)}</span>
                <span className={`flex-1 text-sm font-medium min-w-0 truncate ${done ? "line-through" : ""}`}>{item.title}</span>
                {/* Tags on right */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 flex-shrink-0 justify-end">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs rounded px-1.5 py-0.5 border border-border" style={{ backgroundColor: "var(--bg3)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Notes */}
              {item.notes && (
                <p className="text-xs leading-relaxed ml-10" style={{ color: "var(--muted)" }}>{item.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
