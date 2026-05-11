# projectX v0.3 — Migration Guide

This bundle is an **overlay** for the existing
[`itsmywall05-bit/projectx-vercel`](https://github.com/itsmywall05-bit/projectx-vercel)
repo. It adds the full v0.3 trading-mind UI on top of the existing
Next.js 16 + React 19 + Tailwind v4 + Supabase stack.

## What it adds

- **20 routes** under `src/app/(app)/` — overview, mind-feed, the-map, plan/trading,
  plan/general, instruments, strategy-vault, playbook, backtest, trade-log,
  trade-log-legacy, products, risk-console, performance, market-context,
  watchlist, feedback, side-brain, learning, data-conn, deferred, backlog, blueprint
- **Sidebar + topbar shell** with all nav sections (Core, Plan, Instruments,
  Strategy, Modules, Intelligence, Data, System)
- **Global v0.3 theme** — lime/teal dark palette, JetBrains Mono + Syne + Fraunces
- **Supabase schema** for trading rules, strategies, playbook, instruments,
  principles, deferred queue, backlog, feedback log (9 tables, all RLS-enabled,
  public read)
- **Seed data** identical to the static `projectX_v03.html` — falls back to
  in-memory data if Supabase env vars are missing, so the app runs immediately

## Apply the overlay

```bash
# from your local clone of projectx-vercel
cd path/to/projectx-vercel

# unzip the bundle on top — it will create new files and replace
# src/app/page.tsx + src/app/login/page.tsx + src/app/globals.css
unzip /path/to/projectx-bundle.zip -d .

# install (no new deps but lockfile may want a touch)
npm install
```

## Resolve route conflicts

Two existing routes are intentionally preserved but **need manual merge**:

### `/trade-log-legacy`
The old `src/app/trade-log/page.tsx` from your repo had a working Supabase form
+ table + stats. The overlay moved a placeholder into `src/app/(app)/trade-log-legacy/page.tsx`.

**Action:** Open your existing `src/app/trade-log/page.tsx` (before the overlay,
or from git history), and paste its logic into
`src/app/(app)/trade-log-legacy/page.tsx`, replacing the placeholder body.
Wrap inputs / tables in v0.3 classes:

```tsx
<div className="card">
  <table className="dt">...</table>
</div>
```

### `/products`
Same pattern — `src/app/(app)/products/page.tsx` is a placeholder. Bring your
existing products logic into it.

### Old root `/trade-log` directory
The new `/trade-log` route is a **shell** for the upcoming Phase 1 form. If the
old `src/app/trade-log/page.tsx` (outside the `(app)` group) still exists after
unzipping, **delete it** so Next.js doesn't see two `/trade-log` routes.

```bash
# only if it exists at the old location:
rm -rf src/app/trade-log
```

### Login
`src/app/login/page.tsx` was replaced with a v0.3-themed shell. The form
POSTs to `/api/login` — verify that endpoint still exists in `src/app/api/`.
If your existing login uses a different mechanism (server action, etc.),
patch the `onSubmit` handler in the new file.

## Supabase setup (optional but recommended)

Without Supabase the app still runs — every page falls back to the seed data
in `src/lib/data/seed.ts`. To enable persistence:

1. In your Supabase project, open the SQL editor.
2. Paste and run `supabase/migrations/0001_init.sql` — creates 9 tables.
3. Paste and run `supabase/migrations/0002_seed.sql` — populates them with
   the same data the seed file uses.
4. Confirm `.env.local` has:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```

The data layer (`src/lib/data/queries.ts`) tries Supabase first and silently
falls back to seed data on any error — safe to deploy before migrations are run.

## Verify locally

```bash
npm run dev
# → http://localhost:3000  (redirects to /overview)
```

Check:
- `/overview` — modules grid renders, all 16 cards visible
- `/the-map` — drag the canvas, scroll-zoom works, +/− buttons work
- `/plan/trading` — 5 rules render, checklist toggles + persists across reload (localStorage)
- `/strategy-vault` — ORB + VWAP cards with full edge hypotheses
- `/playbook` — PB-01 with 3 actions
- `/side-brain` — 38/100 ring + module health bars
- `/learning` — 7 principles
- `/deferred` — 4 items
- `/backlog` — 12 items

## Commit + push (triggers Vercel)

```bash
git add .
git commit -m "feat: projectX v0.3 — full 20-page shell, theme, Supabase schema"
git push origin main
```

Vercel will auto-deploy. Set the two `NEXT_PUBLIC_SUPABASE_*` env vars in the
Vercel dashboard if you haven't already.

## Notes on Next.js 16

The repo's `AGENTS.md` warns that Next 16 has breaking changes from older
training data. The overlay sticks to conservative patterns:

- App Router with route groups `(app)`
- `async` server components reading data
- `'use client'` for the sidebar, topbar, map, checklist, and login form
- `next/font/google` for fonts
- Tailwind v4 `@theme { ... }` block + `@import "tailwindcss"`

If a build fails on `next/font` or async components, check `node_modules/next/dist/docs/`
as the AGENTS file suggests and adjust the import / signature accordingly.

## Checklist persistence

The Pre-Trade Checklist currently saves to `localStorage` under the key
`projectx_checklist_v1`. Swap to Supabase when ready:

1. Add a `checklist_completions` table (user_id, item_id, checked_at).
2. In `src/components/checklist/PreTradeChecklist.tsx`, replace the
   `localStorage.getItem` / `setItem` calls with `supabase.from('checklist_completions').upsert(...)`.

Comments in the file mark the swap points.
