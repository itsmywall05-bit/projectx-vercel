-- ╔══════════════════════════════════════════════════════════════╗
-- ║ projectX v0.3 — seed data                                    ║
-- ║ Mirrors src/lib/data/seed.ts verbatim. Idempotent: ON        ║
-- ║ CONFLICT clauses use unique fields (code / number).          ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── trading_rules ──────────────────────────────────────────────
insert into public.trading_rules (rule_number, category, title, body, tags) values
(1, 'entry',
 'Pre-Trade Checklist — must be completed before any entry',
 E'Before entering **any** trade, the Pre-Trade Checklist must be followed and completed. No exceptions. A trade that hasn''t passed the checklist is not a trade — it''s a gamble.\n\n*Checklist fields can be edited in the interactive checklist below.*',
 array['Mandatory', 'No bypass']),
(2, 'exit',
 'Exit when target hit (≥1.5:1 R:R) or when trade assumption breaks',
 E'**Target:** Minimum reward-to-risk ratio of **1.5:1**. This is the floor — not the ideal. Higher R:R targets are acceptable, but nothing below 1.5:1 is a valid target.\n\n**Assumption break:** If the basis on which the trade was taken is no longer valid — regardless of P&L — exit. The assumption is documented at entry; if it breaks, the trade is done. No hoping.',
 array['Min 1.5:1 R:R', 'Basis breaks → exit', 'No holding losers']),
(3, 'sizing',
 '1% of capital per trade — no exceptions',
 E'Every trade is sized at **1% of total capital**. This is fixed. No conviction-based sizing up. No "this one feels different" overrides.\n\nConsistent sizing keeps the feedback loop clean — performance reflects edge quality, not bet sizing decisions.',
 array['1% fixed', 'No scaling up on conviction']),
(4, 'market',
 'Conditions required depend on the strategy in play',
 E'Each strategy has its own required market conditions. **ORB** requires a clear opening range formation and a breakout close. **VWAP Std Scalp** requires price to be oscillating between SD bands — not trending through them.\n\nIf market conditions don''t match the strategy''s requirements, there is no trade. Forcing a strategy into the wrong conditions destroys edge.',
 array['Strategy-dependent', 'ORB conditions', 'VWAP conditions']),
(5, 'limit',
 'Stop trading: 2 failed trades OR loss exceeds 2,000',
 E'Two triggers, either one ends the session:\n\n**Trigger A:** Two consecutive or two total trade failures in a session — close the book. The market may not be cooperating, or something is off. Either way, more trading compounds the problem.\n\n**Trigger B:** Cumulative loss exceeds **₹2,000 / $2,000** (currency TBC) in a single session — stop. This hard cap protects the account from bad-day spirals.',
 array['2 fails = stop', '2K loss = stop', 'No overrides'])
on conflict do nothing;

-- ─── checklist_items ────────────────────────────────────────────
insert into public.checklist_items (position, text) values
(1, 'Market context assessed (regime, direction bias)'),
(2, 'Strategy conditions met (ORB trigger or VWAP band touch confirmed)'),
(3, 'Playbook checked (if outright is aggressive, short-side orders reviewed)'),
(4, 'R:R confirmed ≥ 1.5:1 before entry'),
(5, 'Position size calculated at 1% of capital'),
(6, 'Daily limit check — less than 2 failed trades today, less than 2K loss'),
(7, 'Trade assumption (basis) clearly defined and written')
on conflict do nothing;

-- ─── strategies ─────────────────────────────────────────────────
insert into public.strategies (code, name, tagline, status, setup_conditions, entry_rules, exit_rules, market_conditions, edge_hypothesis, tags) values
(
  'ST-01',
  'Opening Range Breakout (ORB)',
  'Market opens → range forms in first 15 minutes → price closes beyond range → trade the continuation (or the false signal reversal)',
  'testing',
  E'· Market opens and trades for **first 15 minutes**\n· A clear high and low forms — this is the **Opening Range**\n· Wait for a candle/bar to **close beyond** the range (not just wick through)\n· Volume and conviction should be present on the breakout',
  E'· **Continuation play:** Enter in direction of breakout after close beyond range\n· **False signal reversal:** If price breaks out then snaps back through the opposite extreme of the range — enter in reversal direction\n· Pre-Trade Checklist must be completed',
  E'· Target: **min 1.5:1 R:R** (measured from entry to stop)\n· Stop: other side of the Opening Range (assumption breaks if price re-enters range against you)\n· **Assumption break:** Price closes back inside the range after entry → exit',
  E'· Must have a **clean, identifiable opening range** in first 15 min\n· Not to be used in low-volatility choppy opens where range is indistinct\n· Outright must not be in extreme directional aggression (Playbook check)',
  E'The first 15 minutes of a session establishes the emotional range — early buyers and sellers are trapped. When price closes beyond that range, trapped participants are forced to cover/exit, creating momentum. The edge is **trapped participants providing fuel for the move**. The false signal reversal captures the same dynamic in reverse — the initial breakout was a trap itself.',
  array['CL Outright', 'CL Spreads', '15-min range', '1.5:1 min R:R']
),
(
  'ST-02',
  'VWAP Standard Deviation Scalp',
  'Price tends to oscillate between VWAP SD bands — trade the mean-reversion from +1/+2 SD to −1/−2 SD and back',
  'testing',
  null,
  E'· **Long entry:** Price touches −1 SD or −2 SD → wait for rejection/stabilization → enter long, target VWAP or +1/+2 SD\n· **Short entry:** Price touches +1 SD or +2 SD → wait for rejection → enter short, target VWAP or −1/−2 SD\n· Pre-Trade Checklist must be completed',
  E'· Target: opposite SD band (min 1.5:1 R:R must be achievable)\n· Stop: beyond the SD band touched (assumption = price will not close through the band with conviction)\n· **Assumption break:** Price closes through SD band and continues → exit, band is not holding',
  E'**This strategy requires a ranging/oscillating environment.** VWAP SD scalping breaks down in trending markets where price continuously walks through bands without reverting. Check: is price oscillating around VWAP, or is it directionally trending away from it? If trending — no trade, wrong strategy.',
  E'VWAP represents the average price paid by all market participants on the day. Deviations beyond 1-2 SD represent statistically unusual price levels — institutional participants who care about their average execution price will trade back toward VWAP. The edge is **mean-reversion pressure from volume-weighted participants**.',
  array['CL Outright', 'CL Spreads', 'Mean-reversion', 'Ranging market required']
)
on conflict (code) do nothing;

-- ─── playbook_rules ─────────────────────────────────────────────
insert into public.playbook_rules (code, trigger_label, trigger_title, trigger_definition, actions, tags, status) values
(
  'PB-01',
  'Trigger Condition',
  'Main outright (CL) is aggressively directional — excessively bullish',
  E'The main outright (current front/active CL contract) is showing strong, sustained directional buying — rapid successive upticks, no pullback, orders being absorbed aggressively on the bid side, price moving well beyond its normal intraday range. This is not a normal trend — it''s an aggressive, conviction-driven move.\n\n*Quantification to be added as experience builds — e.g. "price moves more than X% from open" or "price beyond +2 SD of intraday VWAP with increasing volume".*',
  '[
    {"icon": "⊡", "label": "Action A — Short-side orders", "text": "**Pull or hold all short-side entry orders.** Do not enter short on spreads, flies, or outrights while the main outright is aggressively bullish. The force working against you is too strong to fade without additional confirmation."},
    {"icon": "◑", "label": "Action B — Existing long positions", "text": "**Review and potentially hold** any long-side positions — the aggressive move may be working in your favor. Don''t exit prematurely but keep stop discipline active."},
    {"icon": "◷", "label": "Action C — Wait and re-assess", "text": "Allow the aggressive move to exhaust or stabilize. **Only re-engage** short-side when the outright shows clear evidence of direction fatigue — reversal signal, consolidation, or normalization of pace."}
  ]'::jsonb,
  array['Trigger: Aggressive Outright', 'Action: Hold shorts', 'Scope: CL family', 'Status: Active'],
  'active'
)
on conflict (code) do nothing;

-- ─── instruments (parent-child) ─────────────────────────────────
-- Insert root first, then children referencing the root by symbol lookup.
insert into public.instruments (symbol, name, parent_id, type, formula, notes) values
('CL', 'Crude Oil WTI (NYMEX)', null, 'underlying', null,
 'West Texas Intermediate crude oil futures. Underlying instrument. All spreads and flies derive from this.')
on conflict do nothing;

insert into public.instruments (symbol, name, parent_id, type, formula, notes)
select
  t.symbol,
  t.name,
  parent.parent_id,
  t.type,
  t.formula,
  t.notes
from (values
  ('Ox', 'Outright — single month contract',
    'outright',
    'e.g. CLZ5, CLH6, CLM6 ...',
    'Direct exposure to a single expiry. Most liquid. Drives all downstream complex instruments. When the outright is aggressive in a direction, all related spreads and flies are affected. This is the instrument your Playbook Rule 1 monitors.'),
  ('Ox1−Ox2', 'Spread — two-leg calendar',
    'spread',
    'Long Ox1, Short Ox2 (or vice versa)',
    'Calendar spread between two expiries. Relative value trade. Less directional than the outright but still affected by outright aggressiveness. Spread = near month premium/discount to far month.'),
  ('Ox1−2×Ox2+Ox3', 'Fly — three-leg butterfly',
    'fly',
    'Long Ox1, Short 2×Ox2, Long Ox3   |   Fly = Spread(Ox1−Ox2) − Spread(Ox2−Ox3)',
    'Butterfly spread across three expiries. Measures the curvature of the forward curve — whether the middle month is cheap or expensive relative to the wings. Lower delta to outright. More complex to manage but offers different edge characteristics.')
) as t(symbol, name, type, formula, notes)
cross join lateral (select id from public.instruments where symbol = 'CL' limit 1) as parent(parent_id)
on conflict do nothing;

-- ─── principles ─────────────────────────────────────────────────
insert into public.principles (number, title, body, source) values
(1, 'Process quality ≠ outcome quality', 'Track independently. A bad process that wins teaches nothing. A good process that loses is still progress.', 'Core philosophy'),
(2, 'The opening range is a psychological trap', 'Early session participants who trade the range extremes get trapped. Breakouts release this pressure. False signals trap the breakout traders in turn — same dynamic, opposite direction.', 'ORB strategy design'),
(3, 'VWAP is the institutional anchor', 'Volume-weighted price represents the average cost for the day. Institutions care about this. Mean-reversion pressure from VWAP deviations comes from participants managing their average.', 'VWAP Std Scalp design'),
(4, 'Spreads and flies are non-linear', 'A calendar spread is not just two outrights. The relationship between legs creates different behavior, different risk, and different edge characteristics than trading either leg alone.', 'Instruments module'),
(5, 'Outright aggressiveness corrupts spread signals', 'When the front contract is moving violently in one direction, spread and fly mean-reversion signals are unreliable — the outright force overwhelms the relative value dynamics.', 'Playbook Rule 1'),
(6, 'The assumption is the stop', 'Every trade has a basis — a condition that must be true for the trade to make sense. When that condition breaks, the trade logic is gone. Price shouldn''t be your only stop — logic should be.', 'Exit Rule 2'),
(7, 'Hard daily limits protect compounding', 'The 2K/2-trade daily limit is not about being cautious. It''s about protecting the base from which edge compounds. A 10% drawdown requires more than 10% gain to recover.', 'Session limit rule')
on conflict do nothing;

-- ─── deferred_items ─────────────────────────────────────────────
insert into public.deferred_items (code, title, reason, category) values
('DQ-001', 'TT Direct API integration (beyond Excel)', 'Updated 2026-05-02 · Current stage: Excel + TT RTD. Direct API integration deferred to Phase 5+.', 'Infrastructure'),
('DQ-002', 'Authentication / multi-device access', 'Parked 2026-05-01 · Single user for now', 'Infrastructure'),
('DQ-003', 'Mobile view optimization', 'Parked 2026-05-01 · Desktop first', 'UI / UX'),
('DQ-004', 'Advanced backtesting (beyond Excel data)', 'Parked 2026-05-02 · Basic backtest frameworks are live. Full historical data engine deferred.', 'Feature')
on conflict (code) do nothing;

-- ─── backlog_items ──────────────────────────────────────────────
insert into public.backlog_items (title, category) values
('Playbook — aggressive bearish outright → mirror of Rule 01', 'Playbook'),
('ORB range size classifier — small/medium/large range behavior', 'Strategy'),
('VWAP regime filter — auto-detect ranging vs trending before trade', 'Strategy'),
('Trade Replay — annotate a past trade step-by-step', 'Journal'),
('Rule Violation Log — when own rules were broken and why', 'Discipline'),
('Streak Tracker — good process streaks, not just P&L streaks', 'Performance'),
('Weekly Pre-Game — structured Monday planning template', 'Planning'),
('Capital Allocation Map — deployed vs available at a glance', 'Risk'),
('Correlation Tracker — fly vs spread vs outright exposure overlap', 'Risk'),
('Scenario Planner — if X market event, then Y response (pre-commitment)', 'Playbook'),
('EIA / FOMC calendar integration with market context', 'Market Context'),
('Outright aggression quantification — define measurable trigger for Playbook Rule 1', 'Playbook')
on conflict do nothing;

-- ─── feedback_log ───────────────────────────────────────────────
insert into public.feedback_log (session_number, session_date, body, went_well, didnt_go_well, to_improve, mistake, learning, tags) values
(1, '2026-05-01',
 'Initiated projectX. Style: systematic. Instruments: general → CL futures. Map style: spatial + detail. Side Brain: health, gaps, feedback, learning.',
 'Project structure and roadmap clarity were strong.',
 'No live trade data was available yet.',
 'Finish the feedback page and capture session-level reviews.',
 'Waiting too long to wire in structured feedback.',
 'Build review capture early so the loop can close from day one.',
 array['origin', 'architecture']),
(2, '2026-05-01',
 'New areas: Map zones, Plan dashboards, Side Brain meta-layer, projectX as learning companion.',
 'Conceptual model for new modules was clear.',
 'No concrete review entry flow existed yet.',
 'Add date-driven EOD review sections.',
 null,
 null,
 array['expansion', 'map']),
(3, '2026-05-02',
 'Core rules defined: PreTrade Checklist, 1.5:1 R:R exit, assumption-break exit, 1% sizing, 2K/2-trade daily limit. Instruments: CL WTI, Outrights/Spreads/Flies. Data: Excel + TT RTD. Strategies: ORB + VWAP Std Scalp. Playbook Rule 1: aggressive bullish outright → hold short entries.',
 'Rules and trading structure were clearly documented.',
 'Trade data capture was still pending.',
 'Connect review entries to trade outcomes later.',
 null,
 null,
 array['rules', 'instruments', 'strategies', 'playbook'])
on conflict do nothing;
