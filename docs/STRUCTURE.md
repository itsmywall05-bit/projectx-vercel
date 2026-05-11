# projectX v0.3 — Structure

> See [`docs/MIGRATION.md`](./MIGRATION.md) for the step-by-step apply guide.

## Routes

All authenticated pages live under the `(app)` route group, which shares the
sidebar + topbar layout. `/login` is outside the group.

| Route                  | Purpose                                                  | State        |
|------------------------|----------------------------------------------------------|--------------|
| `/overview`            | Module grid + build phases                               | Styled       |
| `/mind-feed`           | Daily check-in feed                                      | Styled       |
| `/the-map`             | Drag/zoom spatial canvas (9 zones)                       | Styled       |
| `/plan/trading`        | 5 rules + interactive pre-trade checklist + sessions     | Styled (DB)  |
| `/plan/general`        | Long-term timeline + trader goals                        | Styled       |
| `/instruments`         | CL family hierarchy + relationships table                | Styled (DB)  |
| `/strategy-vault`      | ORB + VWAP cards with edge hypotheses                    | Styled (DB)  |
| `/playbook`            | PB-01 with trigger condition + 3 actions                 | Styled (DB)  |
| `/backtest`            | Backtest frameworks for ST-01 + ST-02                    | Styled       |
| `/side-brain`          | System health, gaps, feedback log                        | Styled (DB)  |
| `/learning`            | 7 principles + learning queue + knowledge areas          | Styled (DB)  |
| `/data-conn`           | Excel + TT RTD (current) + TT direct (deferred)          | Styled       |
| `/deferred`            | 4 parked items                                           | Styled (DB)  |
| `/backlog`             | 12 feature ideas                                         | Styled (DB)  |
| `/blueprint`           | Core philosophy + conventions                            | Styled       |
| `/trade-log`           | Phase 1 shell — fields defined, form pending             | Placeholder  |
| `/trade-log-legacy`    | **Manual merge:** old `/trade-log` from existing repo    | Placeholder  |
| `/products`            | **Manual merge:** existing `/products`                   | Placeholder  |
| `/risk-console`        | Phase 2                                                  | Placeholder  |
| `/performance`         | Phase 3                                                  | Placeholder  |
| `/market-context`      | Phase 3                                                  | Placeholder  |
| `/watchlist`           | Phase 2                                                  | Placeholder  |
| `/feedback`            | Phase 4                                                  | Placeholder  |

"DB" = reads from Supabase via `src/lib/data/queries.ts`, silently falling
back to seed data when env vars are absent.

## Directory layout

```
src/
├── app/
│   ├── (app)/              # shared shell — sidebar + topbar + content
│   │   ├── layout.tsx
│   │   ├── overview/page.tsx
│   │   ├── mind-feed/page.tsx
│   │   ├── the-map/page.tsx
│   │   ├── plan/
│   │   │   ├── trading/page.tsx
│   │   │   └── general/page.tsx
│   │   ├── instruments/page.tsx
│   │   ├── strategy-vault/page.tsx
│   │   ├── playbook/page.tsx
│   │   ├── backtest/page.tsx
│   │   ├── trade-log/page.tsx           # new shell, Phase 1
│   │   ├── trade-log-legacy/page.tsx    # manual merge target
│   │   ├── products/page.tsx            # manual merge target
│   │   ├── risk-console/page.tsx
│   │   ├── performance/page.tsx
│   │   ├── market-context/page.tsx
│   │   ├── watchlist/page.tsx
│   │   ├── feedback/page.tsx
│   │   ├── side-brain/page.tsx
│   │   ├── learning/page.tsx
│   │   ├── data-conn/page.tsx
│   │   ├── deferred/page.tsx
│   │   ├── backlog/page.tsx
│   │   └── blueprint/page.tsx
│   ├── api/                # preserved from existing repo
│   ├── login/page.tsx
│   ├── globals.css         # v0.3 theme + utility classes
│   ├── layout.tsx          # root — fonts + html
│   └── page.tsx            # → redirect to /overview
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     # 'use client' — 9 nav sections
│   │   └── Topbar.tsx      # 'use client' — clock + phase pill
│   ├── ui/
│   │   ├── index.tsx       # StatCard, SectionHeader, PageIntro,
│   │   │                   #   Highlight, Card, StubPage
│   │   ├── Tag.tsx
│   │   └── markdown.tsx    # **bold** / *italic* / newline renderer
│   ├── map/
│   │   └── MapCanvas.tsx   # 'use client' — drag/zoom, 9 zones
│   └── checklist/
│       └── PreTradeChecklist.tsx  # 'use client' — localStorage for now
└── lib/
    ├── data/
    │   ├── types.ts        # all domain types
    │   ├── seed.ts         # in-memory fallback (verbatim from v03.html)
    │   └── queries.ts      # Supabase-or-seed accessor pattern
    └── supabase/
        ├── server.ts       # server component client (or null)
        └── browser.ts      # client component client (or null)

supabase/
└── migrations/
    ├── 0001_init.sql       # 9 tables + RLS + public-read policies
    └── 0002_seed.sql       # mirrors src/lib/data/seed.ts verbatim

docs/
└── MIGRATION.md            # apply-the-overlay guide
```

## Data layer pattern

Every page that needs data calls an accessor from `src/lib/data/queries.ts`:

```tsx
const rules = await getTradingRules();
```

That function does:

```ts
const sb = getServerSupabase();
if (!sb) return SEED_RULES;
const { data, error } = await sb.from('trading_rules').select('*').order('rule_number');
if (error || !data?.length) return SEED_RULES;
return data;
```

So:
- **No env vars** → seed renders (good for first deploy).
- **Env vars + empty tables** → seed renders (good before running migrations).
- **Env vars + populated tables** → DB renders.
- **DB error** → seed renders, error logged to server console.

## Theme

All colors and fonts are defined twice for full coverage:

- Tailwind `@theme { ... }` block in `globals.css` — exposes them as
  Tailwind classes (`bg-px-bg`, `text-px-accent`, etc.) for future use.
- `:root { ... }` CSS custom properties — used by all the v03-ported utility
  classes (`.card`, `.cv`, `.tag`, etc.) and inline `style={{ background: 'var(--bg3)' }}`.

Both blocks reference the same hex values so changes propagate.

Fonts are loaded via `next/font/google` in `src/app/layout.tsx`:
- **Syne** (display / headings) → `--font-syne`
- **JetBrains Mono** (body / mono) → `--font-mono`
- **Fraunces** (italic accents) → `--font-serif-italic`
