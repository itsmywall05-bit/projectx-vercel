Position Monitor & Risk Calculator — Quick Guide

- `src/lib/riskCalc.ts`
  - `computePerContractRisk(entry, sl, tick_size, tick_value)`
    - Returns dollar risk per contract: `Math.abs(entry - sl) / tick_size * tick_value`
  - `computeMaxLots(riskAllowed, perContractRisk)`
    - Returns integer max lots: `Math.floor(riskAllowed / perContractRisk)` (0 if non-positive)

- `src/components/position-monitor.tsx`
  - Client component that fetches open trades from `/api/trades`, live prices from `/api/prices`, and taxonomy strategies.
  - Aggregates spread-normalised exposures by mapping taxonomy legs to outrights starting at a trade's anchor month.

- `src/components/live-risk-engine.tsx`
  - Now shows summary cards (Open Risk / Current Risk / Aggregated Max Risk).
  - Highlights trades near their assigned `risk_lt` (>= 80%) and shows a banner count.

- `src/components/CurvePlot.tsx`
  - Simple SVG plot used in Watchlist to render outright curve shapes from `/api/prices`.

Notes:
- These changes are intentionally lightweight and avoid adding new runtime deps.
- If you want automated tests, I can add `vitest` and a small test suite for `riskCalc` next.
