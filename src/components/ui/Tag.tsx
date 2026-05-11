import React from "react";

type TagVariant = "default" | "g" | "y" | "r" | "b" | "p" | "a" | "c";
export type { TagVariant };

const variantClass: Record<TagVariant, string> = {
  default: "tag",
  g: "tag tg",
  y: "tag ty",
  r: "tag tr",
  b: "tag tb",
  p: "tag tp",
  a: "tag ta",
  c: "tag tc",
};

export function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: TagVariant }) {
  return <span className={variantClass[variant]}>{children}</span>;
}

/**
 * Map a free-form tag string to a sensible color variant.
 * Used when tag text comes from the DB.
 */
export function autoTagVariant(text: string): TagVariant {
  const t = text.toLowerCase();
  if (/(stop|fail|no\b|red|loss|kill)/.test(t)) return "r";
  if (/(min|target|exit|good|wins?|reversion)/.test(t)) return "g";
  if (/(mandatory|rule|alert|range|orb|active)/.test(t)) return "y";
  if (/(spread|outright|sizing|fixed)/.test(t)) return "b";
  if (/(fly|playbook|aggress|expansion|psy)/.test(t)) return "p";
  if (/(condition|trigger|amber|warn)/.test(t)) return "a";
  if (/(cl\b|vwap|ranging|cyan|data)/.test(t)) return "c";
  return "default";
}
