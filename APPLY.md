# projectX v0.3 — Apply Steps

> One-page command sequence. Detailed background in `docs/MIGRATION.md`.

## 0 · Backup current state

```bash
cd path/to/projectx-vercel
git checkout -b backup/pre-v03
git push origin backup/pre-v03
git checkout main
git checkout -b feat/projectx-v03
```

## 1 · Unzip overlay

```bash
unzip /path/to/projectx-v03-overlay.zip -d .
```

This adds ~45 files. **Files that will be overwritten**:
- `src/app/page.tsx`           (replaced with redirect to `/overview`)
- `src/app/layout.tsx`         (loads new fonts + global CSS)
- `src/app/globals.css`        (full v0.3 theme)
- `src/app/login/page.tsx`     (v0.3-themed login form)

Review the diff before continuing:

```bash
git status
git diff src/app/page.tsx src/app/layout.tsx src/app/globals.css src/app/login/page.tsx
```

## 2 · Resolve route collision

The old repo has `src/app/trade-log/page.tsx` (functional). The new bundle adds
`src/app/(app)/trade-log/page.tsx` (Phase 1 shell). Both would route to `/trade-log`,
which Next.js refuses.

**Move the old one to the legacy slot:**

```bash
# copy old functional logic INTO the new legacy placeholder
cat src/app/trade-log/page.tsx
# manually paste its contents into src/app/(app)/trade-log-legacy/page.tsx
# replacing the placeholder body

# then delete the old route
rm -rf src/app/trade-log

# same drill for /products
cat src/app/products/page.tsx
# paste into src/app/(app)/products/page.tsx
rm -rf src/app/products
```

If `src/app/login/` collided too — keep whichever auth logic you trust. The
new shell expects a `POST /api/login` endpoint; if your existing route is
different, patch the `onSubmit` in `src/app/login/page.tsx`.

## 3 · Verify tsconfig path alias

`src/tsconfig.json` (or `tsconfig.json`) must include:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## 4 · Install + typecheck + dev

```bash
npm install
npx tsc --noEmit          # catch any obvious type issues
npm run dev
# open http://localhost:3000 → should redirect to /overview
```

Smoke test these routes:
- `/overview` → 16 module cards
- `/the-map` → drag canvas works
- `/plan/trading` → 5 rule cards, checklist toggles persist after page reload
- `/strategy-vault` → 2 strategy cards
- `/playbook` → 1 playbook rule with 3 actions
- `/instruments` → CL tree + relationships table
- `/side-brain` → 38/100 ring + 10 module bars
- `/deferred` → 4 items
- `/backlog` → 12 items

## 5 · Set up Supabase (optional — app works without it)

In Supabase SQL editor, paste and run **in order**:

1. `supabase/migrations/0001_init.sql`  ← creates 9 tables + RLS policies
2. `supabase/migrations/0002_seed.sql`  ← populates with v03 data

Confirm `.env.local` (and Vercel env vars) have:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The data layer falls back to seed on any error — safe to ship before migrations.

## 6 · Commit + push

```bash
git add .
git commit -m "feat: projectX v0.3 — 20-page shell, theme, Supabase schema

- Sidebar + topbar shell under (app) route group
- Full v0.3 dark theme (lime/teal, JetBrains Mono + Syne + Fraunces)
- 9 fully-styled pages, 11 placeholder pages
- Supabase schema: rules, strategies, playbook, instruments, principles,
  deferred, backlog, feedback (with seed fallback)
- Drag/zoom map canvas, interactive pre-trade checklist (localStorage)
- Old /trade-log preserved at /trade-log-legacy"

git push origin feat/projectx-v03
```

Open PR → review → merge to `main` → Vercel auto-deploys.

## 7 · Post-deploy

- Set `NEXT_PUBLIC_SUPABASE_*` in Vercel project settings if not already there.
- Once verified, delete the `backup/pre-v03` branch.
- Decide checklist persistence (currently localStorage). See `MIGRATION.md`
  → "Checklist persistence" for the swap recipe.

## Rollback (if needed)

```bash
git checkout main
git reset --hard backup/pre-v03
git push --force-with-lease origin main
```
