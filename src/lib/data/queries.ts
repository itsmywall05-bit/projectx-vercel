import { getServerSupabase } from "@/lib/supabase/server";
import type {
  TradingRule,
  ChecklistItem,
  Strategy,
  PlaybookRule,
  Instrument,
  Principle,
  DeferredItem,
  BacklogItem,
  FeedbackEntry,
} from "./types";
import {
  SEED_RULES,
  SEED_CHECKLIST,
  SEED_STRATEGIES,
  SEED_PLAYBOOK,
  SEED_INSTRUMENTS,
  SEED_PRINCIPLES,
  SEED_DEFERRED,
  SEED_BACKLOG,
  SEED_FEEDBACK,
} from "./seed";

/**
 * Pattern: every accessor tries Supabase first, then falls back to seed.
 * Falls back silently — log shows up only if a query is *attempted* and fails.
 */
async function fetchOrSeed<T>(
  table: string,
  orderBy: { column: string; ascending?: boolean },
  seed: T[]
): Promise<T[]> {
  const sb = getServerSupabase();
  if (!sb) return seed;
  const { data, error } = await sb
    .from(table)
    .select("*")
    .order(orderBy.column, { ascending: orderBy.ascending ?? true });
  if (error || !data || data.length === 0) {
    if (error) console.warn(`[projectX] Supabase ${table} read failed:`, error.message);
    return seed;
  }
  return data as T[];
}

export async function getTradingRules(): Promise<TradingRule[]> {
  return fetchOrSeed<TradingRule>("trading_rules", { column: "rule_number" }, SEED_RULES);
}

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  return fetchOrSeed<ChecklistItem>("checklist_items", { column: "position" }, SEED_CHECKLIST);
}

export async function getStrategies(): Promise<Strategy[]> {
  return fetchOrSeed<Strategy>("strategies", { column: "code" }, SEED_STRATEGIES);
}

export async function getPlaybookRules(): Promise<PlaybookRule[]> {
  return fetchOrSeed<PlaybookRule>("playbook_rules", { column: "code" }, SEED_PLAYBOOK);
}

export async function getInstruments(): Promise<Instrument[]> {
  return fetchOrSeed<Instrument>("instruments", { column: "symbol" }, SEED_INSTRUMENTS);
}

export async function getPrinciples(): Promise<Principle[]> {
  return fetchOrSeed<Principle>("principles", { column: "number" }, SEED_PRINCIPLES);
}

export async function getDeferredItems(): Promise<DeferredItem[]> {
  return fetchOrSeed<DeferredItem>("deferred_items", { column: "code" }, SEED_DEFERRED);
}

export async function getBacklogItems(): Promise<BacklogItem[]> {
  return fetchOrSeed<BacklogItem>("backlog_items", { column: "created_at", ascending: false }, SEED_BACKLOG);
}

export async function getFeedbackEntries(): Promise<FeedbackEntry[]> {
  return fetchOrSeed<FeedbackEntry>("feedback_log", { column: "session_date", ascending: false }, SEED_FEEDBACK);
}
