// ─── Trading Plan ───────────────────────────────────────────────
export type RuleCategory = "entry" | "exit" | "sizing" | "market" | "limit";

export type TradingRule = {
  id: string;
  rule_number: number;
  category: RuleCategory;
  title: string;
  body: string;
  tags: string[];
  active: boolean;
};

export type ChecklistItem = {
  id: string;
  position: number;
  text: string;
  active: boolean;
};

// ─── Strategies ─────────────────────────────────────────────────
export type Strategy = {
  id: string;
  code: string; // ST-01
  name: string;
  tagline: string | null;
  status: "testing" | "active" | "retired";
  setup_conditions: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  market_conditions: string | null;
  edge_hypothesis: string | null;
  tags: string[];
};

// ─── Playbook ───────────────────────────────────────────────────
export type PlaybookAction = {
  icon: string;
  label: string;
  text: string;
};

export type PlaybookRule = {
  id: string;
  code: string; // PB-01
  trigger_label: string;
  trigger_title: string;
  trigger_definition: string;
  actions: PlaybookAction[];
  tags: string[];
  status: "active" | "draft" | "retired";
};

// ─── Instruments ────────────────────────────────────────────────
export type InstrumentType = "underlying" | "outright" | "spread" | "fly";

export type Instrument = {
  id: string;
  symbol: string;
  name: string;
  parent_id: string | null;
  type: InstrumentType;
  formula: string | null;
  notes: string | null;
};

// ─── Principles ─────────────────────────────────────────────────
export type Principle = {
  id: string;
  number: number;
  title: string;
  body: string;
  source: string | null;
};

// ─── Deferred items ─────────────────────────────────────────────
export type DeferredItem = {
  id: string;
  code: string; // DQ-001
  title: string;
  reason: string | null;
  category: string;
};

// ─── Backlog ────────────────────────────────────────────────────
export type BacklogPriority = "low" | "medium" | "high";

export type BacklogItem = {
  id: string;
  title: string;
  category: string;
  status: "idea" | "in_progress" | "done";
  priority: BacklogPriority | null;
  entry_date: string | null;
  notes: string | null;
  tags: string[] | null;
};

// ─── Feedback ───────────────────────────────────────────────────
export type FeedbackEntry = {
  id: string;
  session_number: number;
  session_date: string;
  body: string;
  went_well: string | null;
  didnt_go_well: string | null;
  to_improve: string | null;
  mistake: string | null;
  learning: string | null;
  tags: string[];
};
