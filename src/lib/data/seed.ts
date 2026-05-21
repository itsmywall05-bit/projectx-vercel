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

// ─── Trading Rules (5) ──────────────────────────────────────────
export const SEED_RULES: TradingRule[] = [
  {
    id: "seed-r-1",
    rule_number: 1,
    category: "entry",
    title: "Pre-Trade Checklist — must be completed before any entry",
    body: "Before entering **any** trade, the Pre-Trade Checklist must be followed and completed. No exceptions. A trade that hasn't passed the checklist is not a trade — it's a gamble.\n\n*Checklist fields can be edited in the interactive checklist below.*",
    tags: ["Mandatory", "No bypass"],
    active: true,
  },
  {
    id: "seed-r-2",
    rule_number: 2,
    category: "exit",
    title: "Exit when target hit (≥1.5:1 R:R) or when trade assumption breaks",
    body: "**Target:** Minimum reward-to-risk ratio of **1.5:1**. This is the floor — not the ideal. Higher R:R targets are acceptable, but nothing below 1.5:1 is a valid target.\n\n**Assumption break:** If the basis on which the trade was taken is no longer valid — regardless of P&L — exit. The assumption is documented at entry; if it breaks, the trade is done. No hoping.",
    tags: ["Min 1.5:1 R:R", "Basis breaks → exit", "No holding losers"],
    active: true,
  },
  {
    id: "seed-r-3",
    rule_number: 3,
    category: "sizing",
    title: "1% of capital per trade — no exceptions",
    body: "Every trade is sized at **1% of total capital**. This is fixed. No conviction-based sizing up. No \"this one feels different\" overrides.\n\nConsistent sizing keeps the feedback loop clean — performance reflects edge quality, not bet sizing decisions.",
    tags: ["1% fixed", "No scaling up on conviction"],
    active: true,
  },
  {
    id: "seed-r-4",
    rule_number: 4,
    category: "market",
    title: "Conditions required depend on the strategy in play",
    body: "Each strategy has its own required market conditions. **ORB** requires a clear opening range formation and a breakout close. **VWAP Std Scalp** requires price to be oscillating between SD bands — not trending through them.\n\nIf market conditions don't match the strategy's requirements, there is no trade. Forcing a strategy into the wrong conditions destroys edge.",
    tags: ["Strategy-dependent", "ORB conditions", "VWAP conditions"],
    active: true,
  },
  {
    id: "seed-r-5",
    rule_number: 5,
    category: "limit",
    title: "Stop trading: 2 failed trades OR loss exceeds 2,000",
    body: "Two triggers, either one ends the session:\n\n**Trigger A:** Two consecutive or two total trade failures in a session — close the book. The market may not be cooperating, or something is off. Either way, more trading compounds the problem.\n\n**Trigger B:** Cumulative loss exceeds **₹2,000 / $2,000** (currency TBC) in a single session — stop. This hard cap protects the account from bad-day spirals.",
    tags: ["2 fails = stop", "2K loss = stop", "No overrides"],
    active: true,
  },
];

// ─── Pre-Trade Checklist (7) ────────────────────────────────────
export const SEED_CHECKLIST: ChecklistItem[] = [
  { id: "seed-c-1", position: 1, text: "Market context assessed (regime, direction bias)", active: true },
  { id: "seed-c-2", position: 2, text: "Strategy conditions met (ORB trigger or VWAP band touch confirmed)", active: true },
  { id: "seed-c-3", position: 3, text: "Playbook checked (if outright is aggressive, short-side orders reviewed)", active: true },
  { id: "seed-c-4", position: 4, text: "R:R confirmed ≥ 1.5:1 before entry", active: true },
  { id: "seed-c-5", position: 5, text: "Position size calculated at 1% of capital", active: true },
  { id: "seed-c-6", position: 6, text: "Daily limit check — less than 2 failed trades today, less than 2K loss", active: true },
  { id: "seed-c-7", position: 7, text: "Trade assumption (basis) clearly defined and written", active: true },
];

// ─── Strategies (2) ─────────────────────────────────────────────
export const SEED_STRATEGIES: Strategy[] = [
  {
    id: "seed-s-1",
    code: "ST-01",
    name: "Opening Range Breakout (ORB)",
    tagline: "Market opens → range forms in first 15 minutes → price closes beyond range → trade the continuation (or the false signal reversal)",
    status: "testing",
    setup_conditions: "· Market opens and trades for **first 15 minutes**\n· A clear high and low forms — this is the **Opening Range**\n· Wait for a candle/bar to **close beyond** the range (not just wick through)\n· Volume and conviction should be present on the breakout",
    entry_rules: "· **Continuation play:** Enter in direction of breakout after close beyond range\n· **False signal reversal:** If price breaks out then snaps back through the opposite extreme of the range — enter in reversal direction\n· Pre-Trade Checklist must be completed",
    exit_rules: "· Target: **min 1.5:1 R:R** (measured from entry to stop)\n· Stop: other side of the Opening Range (assumption breaks if price re-enters range against you)\n· **Assumption break:** Price closes back inside the range after entry → exit",
    market_conditions: "· Must have a **clean, identifiable opening range** in first 15 min\n· Not to be used in low-volatility choppy opens where range is indistinct\n· Outright must not be in extreme directional aggression (Playbook check)",
    edge_hypothesis: "The first 15 minutes of a session establishes the emotional range — early buyers and sellers are trapped. When price closes beyond that range, trapped participants are forced to cover/exit, creating momentum. The edge is **trapped participants providing fuel for the move**. The false signal reversal captures the same dynamic in reverse — the initial breakout was a trap itself.",
    tags: ["CL Outright", "CL Spreads", "15-min range", "1.5:1 min R:R"],
  },
  {
    id: "seed-s-2",
    code: "ST-02",
    name: "VWAP Standard Deviation Scalp",
    tagline: "Price tends to oscillate between VWAP SD bands — trade the mean-reversion from +1/+2 SD to −1/−2 SD and back",
    status: "testing",
    setup_conditions: null,
    entry_rules: "· **Long entry:** Price touches −1 SD or −2 SD → wait for rejection/stabilization → enter long, target VWAP or +1/+2 SD\n· **Short entry:** Price touches +1 SD or +2 SD → wait for rejection → enter short, target VWAP or −1/−2 SD\n· Pre-Trade Checklist must be completed",
    exit_rules: "· Target: opposite SD band (min 1.5:1 R:R must be achievable)\n· Stop: beyond the SD band touched (assumption = price will not close through the band with conviction)\n· **Assumption break:** Price closes through SD band and continues → exit, band is not holding",
    market_conditions: "**This strategy requires a ranging/oscillating environment.** VWAP SD scalping breaks down in trending markets where price continuously walks through bands without reverting. Check: is price oscillating around VWAP, or is it directionally trending away from it? If trending — no trade, wrong strategy.",
    edge_hypothesis: "VWAP represents the average price paid by all market participants on the day. Deviations beyond 1-2 SD represent statistically unusual price levels — institutional participants who care about their average execution price will trade back toward VWAP. The edge is **mean-reversion pressure from volume-weighted participants**.",
    tags: ["CL Outright", "CL Spreads", "Mean-reversion", "Ranging market required"],
  },
];

// ─── Playbook Rules (1) ─────────────────────────────────────────
export const SEED_PLAYBOOK: PlaybookRule[] = [
  {
    id: "seed-p-1",
    code: "PB-01",
    trigger_label: "Trigger Condition",
    trigger_title: "Main outright (CL) is aggressively directional — excessively bullish",
    trigger_definition: "The main outright (current front/active CL contract) is showing strong, sustained directional buying — rapid successive upticks, no pullback, orders being absorbed aggressively on the bid side, price moving well beyond its normal intraday range. This is not a normal trend — it's an aggressive, conviction-driven move.\n\n*Quantification to be added as experience builds — e.g. \"price moves more than X% from open\" or \"price beyond +2 SD of intraday VWAP with increasing volume\".*",
    actions: [
      {
        icon: "⊡",
        label: "Action A — Short-side orders",
        text: "**Pull or hold all short-side entry orders.** Do not enter short on spreads, flies, or outrights while the main outright is aggressively bullish. The force working against you is too strong to fade without additional confirmation.",
      },
      {
        icon: "◑",
        label: "Action B — Existing long positions",
        text: "**Review and potentially hold** any long-side positions — the aggressive move may be working in your favor. Don't exit prematurely but keep stop discipline active.",
      },
      {
        icon: "◷",
        label: "Action C — Wait and re-assess",
        text: "Allow the aggressive move to exhaust or stabilize. **Only re-engage** short-side when the outright shows clear evidence of direction fatigue — reversal signal, consolidation, or normalization of pace.",
      },
    ],
    tags: ["Trigger: Aggressive Outright", "Action: Hold shorts", "Scope: CL family", "Status: Active"],
    status: "active",
  },
];

// ─── Instruments ────────────────────────────────────────────────
export const SEED_INSTRUMENTS: Instrument[] = [
  {
    id: "seed-i-1",
    symbol: "CL",
    name: "Crude Oil WTI (NYMEX)",
    parent_id: null,
    type: "underlying",
    formula: null,
    notes: "West Texas Intermediate crude oil futures. Underlying instrument. All spreads and flies derive from this.",
  },
  {
    id: "seed-i-2",
    symbol: "Ox",
    name: "Outright — single month contract",
    parent_id: "seed-i-1",
    type: "outright",
    formula: "e.g. CLZ5, CLH6, CLM6 ...",
    notes: "Direct exposure to a single expiry. Most liquid. Drives all downstream complex instruments. When the outright is aggressive in a direction, all related spreads and flies are affected. This is the instrument your Playbook Rule 1 monitors.",
  },
  {
    id: "seed-i-3",
    symbol: "Ox1−Ox2",
    name: "Spread — two-leg calendar",
    parent_id: "seed-i-1",
    type: "spread",
    formula: "Long Ox1, Short Ox2 (or vice versa)",
    notes: "Calendar spread between two expiries. Relative value trade. Less directional than the outright but still affected by outright aggressiveness. Spread = near month premium/discount to far month.",
  },
  {
    id: "seed-i-4",
    symbol: "Ox1−2×Ox2+Ox3",
    name: "Fly — three-leg butterfly",
    parent_id: "seed-i-1",
    type: "fly",
    formula: "Long Ox1, Short 2×Ox2, Long Ox3   |   Fly = Spread(Ox1−Ox2) − Spread(Ox2−Ox3)",
    notes: "Butterfly spread across three expiries. Measures the curvature of the forward curve — whether the middle month is cheap or expensive relative to the wings. Lower delta to outright. More complex to manage but offers different edge characteristics.",
  },
];

// ─── Principles (7) ─────────────────────────────────────────────
export const SEED_PRINCIPLES: Principle[] = [
  { id: "seed-pr-1", number: 1, title: "Process quality ≠ outcome quality", body: "Track independently. A bad process that wins teaches nothing. A good process that loses is still progress.", source: "Core philosophy" },
  { id: "seed-pr-2", number: 2, title: "The opening range is a psychological trap", body: "Early session participants who trade the range extremes get trapped. Breakouts release this pressure. False signals trap the breakout traders in turn — same dynamic, opposite direction.", source: "ORB strategy design" },
  { id: "seed-pr-3", number: 3, title: "VWAP is the institutional anchor", body: "Volume-weighted price represents the average cost for the day. Institutions care about this. Mean-reversion pressure from VWAP deviations comes from participants managing their average.", source: "VWAP Std Scalp design" },
  { id: "seed-pr-4", number: 4, title: "Spreads and flies are non-linear", body: "A calendar spread is not just two outrights. The relationship between legs creates different behavior, different risk, and different edge characteristics than trading either leg alone.", source: "Instruments module" },
  { id: "seed-pr-5", number: 5, title: "Outright aggressiveness corrupts spread signals", body: "When the front contract is moving violently in one direction, spread and fly mean-reversion signals are unreliable — the outright force overwhelms the relative value dynamics.", source: "Playbook Rule 1" },
  { id: "seed-pr-6", number: 6, title: "The assumption is the stop", body: "Every trade has a basis — a condition that must be true for the trade to make sense. When that condition breaks, the trade logic is gone. Price shouldn't be your only stop — logic should be.", source: "Exit Rule 2" },
  { id: "seed-pr-7", number: 7, title: "Hard daily limits protect compounding", body: "The 2K/2-trade daily limit is not about being cautious. It's about protecting the base from which edge compounds. A 10% drawdown requires more than 10% gain to recover.", source: "Session limit rule" },
];

// ─── Deferred (4) ───────────────────────────────────────────────
export const SEED_DEFERRED: DeferredItem[] = [
  { id: "seed-d-1", code: "DQ-001", title: "TT Direct API integration (beyond Excel)", reason: "Updated 2026-05-02 · Current stage: Excel + TT RTD. Direct API integration deferred to Phase 5+.", category: "Infrastructure" },
  { id: "seed-d-2", code: "DQ-002", title: "Authentication / multi-device access", reason: "Parked 2026-05-01 · Single user for now", category: "Infrastructure" },
  { id: "seed-d-3", code: "DQ-003", title: "Mobile view optimization", reason: "Parked 2026-05-01 · Desktop first", category: "UI / UX" },
  { id: "seed-d-4", code: "DQ-004", title: "Advanced backtesting (beyond Excel data)", reason: "Parked 2026-05-02 · Basic backtest frameworks are live. Full historical data engine deferred.", category: "Feature" },
];

// ─── Backlog (12) ───────────────────────────────────────────────
export const SEED_BACKLOG: BacklogItem[] = [
  { id: "seed-b-1", title: "Playbook — aggressive bearish outright → mirror of Rule 01", category: "Playbook", status: "idea" },
  { id: "seed-b-2", title: "ORB range size classifier — small/medium/large range behavior", category: "Strategy", status: "idea" },
  { id: "seed-b-3", title: "VWAP regime filter — auto-detect ranging vs trending before trade", category: "Strategy", status: "idea" },
  { id: "seed-b-4", title: "Trade Replay — annotate a past trade step-by-step", category: "Journal", status: "idea" },
  { id: "seed-b-5", title: "Rule Violation Log — when own rules were broken and why", category: "Discipline", status: "idea" },
  { id: "seed-b-6", title: "Streak Tracker — good process streaks, not just P&L streaks", category: "Performance", status: "idea" },
  { id: "seed-b-7", title: "Weekly Pre-Game — structured Monday planning template", category: "Planning", status: "idea" },
  { id: "seed-b-8", title: "Capital Allocation Map — deployed vs available at a glance", category: "Risk", status: "idea" },
  { id: "seed-b-9", title: "Correlation Tracker — fly vs spread vs outright exposure overlap", category: "Risk", status: "idea" },
  { id: "seed-b-10", title: "Scenario Planner — if X market event, then Y response (pre-commitment)", category: "Playbook", status: "idea" },
  { id: "seed-b-11", title: "EIA / FOMC calendar integration with market context", category: "Market Context", status: "idea" },
  { id: "seed-b-12", title: "Outright aggression quantification — define measurable trigger for Playbook Rule 1", category: "Playbook", status: "idea" },
];

// ─── Feedback (3) ───────────────────────────────────────────────
export const SEED_FEEDBACK: FeedbackEntry[] = [
  {
    id: "seed-f-1",
    session_number: 1,
    session_date: "2026-05-01",
    body: "Initiated projectX. Style: systematic. Instruments: general → CL futures. Map style: spatial + detail. Side Brain: health, gaps, feedback, learning.",
    went_well: "Project structure and roadmap clarity were strong.",
    didnt_go_well: "No live trade data was available yet.",
    to_improve: "Finish the feedback page and capture session-level reviews.",
    mistake: "Waiting too long to wire in structured feedback.",
    learning: "Build review capture early so the loop can close from day one.",
    tags: ["origin", "architecture"],
  },
  {
    id: "seed-f-2",
    session_number: 2,
    session_date: "2026-05-01",
    body: "New areas: Map zones, Plan dashboards, Side Brain meta-layer, projectX as learning companion.",
    went_well: "Conceptual model for new modules was clear.",
    didnt_go_well: "No concrete review entry flow existed yet.",
    to_improve: "Add date-driven EOD review sections.",
    mistake: null,
    learning: null,
    tags: ["expansion", "map"],
  },
  {
    id: "seed-f-3",
    session_number: 3,
    session_date: "2026-05-02",
    body: "Core rules defined: PreTrade Checklist, 1.5:1 R:R exit, assumption-break exit, 1% sizing, 2K/2-trade daily limit. Instruments: CL WTI, Outrights/Spreads/Flies. Data: Excel + TT RTD. Strategies: ORB + VWAP Std Scalp. Playbook Rule 1: aggressive bullish outright → hold short entries.",
    went_well: "Rules and trading structure were clearly documented.",
    didnt_go_well: "Trade data capture was still pending.",
    to_improve: "Connect review entries to trade outcomes later.",
    mistake: null,
    learning: null,
    tags: ["rules", "instruments", "strategies", "playbook"],
  },
];
