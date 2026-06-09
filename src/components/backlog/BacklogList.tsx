"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function BacklogList({ items }: { items: BacklogItem[] }) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggle(item: BacklogItem) {
    setToggling(item.id);
    const nextStatus = item.status === "done" ? "idea" : "done";
    await fetch("/api/backlog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });
    router.refresh();
    setToggling(null);
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const done = item.status === "done";
        return (
          <div key={item.id} className={`py-3 flex flex-col gap-1 ${done ? "opacity-50" : ""}`}>
            {/* Row 1: checkbox · priority · date · title · status */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggle(item)}
                disabled={toggling === item.id}
                className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${done ? "bg-accent border-accent" : "border-border bg-transparent hover:border-accent"}`}
                aria-label="Toggle done"
              />
              <PriorityDot priority={item.priority} />
              <span className="text-xs text-muted w-20 flex-shrink-0">{formatDate(item.entry_date)}</span>
              <span className={`flex-1 text-sm font-medium ${done ? "line-through" : ""}`}>{item.title}</span>
              <span className="text-xs text-muted border border-border rounded px-1.5 py-0.5 capitalize">{item.status.replace("_", " ")}</span>
            </div>
            {/* Row 2: notes */}
            {item.notes && (
              <p className="text-xs text-muted ml-10 leading-relaxed">{item.notes}</p>
            )}
            {/* Row 3: tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-10">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-bg3 border border-border rounded px-1.5 py-0.5">{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
