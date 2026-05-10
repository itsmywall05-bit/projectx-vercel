# How to Add or Modify Fields

This guide explains what to change when you want to add a new column to the Trade Log (or Products), or modify an existing one.

---

## Example: Adding a "Confidence Level" field to Trade Log

You need to touch **3 places**: Database → API → Frontend.

---

### Step 1: Database (Supabase)

Go to Supabase Dashboard → SQL Editor → run:

```sql
ALTER TABLE trades ADD COLUMN confidence TEXT CHECK (confidence IN ('High', 'Medium', 'Low'));
```

That's it for the database.

---

### Step 2: API (Backend)

**File:** `src/app/api/trades/route.ts`

Nothing to change here — the API already passes through whatever fields the frontend sends. It uses `insert(body)` and `update(updates)` which accept any valid column.

**File:** `src/app/api/export/route.ts`

Add the new column to the CSV export:

```typescript
// In the headers array, add:
"Confidence",

// In the rows map, add:
t.confidence || "",
```

---

### Step 3: Frontend

**File:** `src/components/trade-form.tsx`

1. Add to the `TradeFormData` interface:
```typescript
confidence: string;
```

2. Add to `EMPTY_FORM`:
```typescript
confidence: "",
```

3. Add the input field in the form JSX (put it wherever makes sense):
```tsx
<div>
  <label className={labelCls}>Confidence</label>
  <select value={form.confidence} onChange={(e) => set("confidence", e.target.value)} className={inputCls}>
    <option value="">Select</option>
    <option>High</option>
    <option>Medium</option>
    <option>Low</option>
  </select>
</div>
```

**File:** `src/components/trade-table.tsx`

1. Add to the `Trade` interface:
```typescript
confidence: string;
```

2. Show it in the expanded detail section:
```tsx
<div>Confidence: <span className="text-text">{t.confidence || "—"}</span></div>
```

3. (Optional) Add it as a table column or filter.

---

### Step 4: Deploy

```bash
git add .
git commit -m "feat(trade-log): add confidence level field"
git push origin main
```

Vercel auto-deploys. Done.

---

## Quick Reference: Where each piece lives

| What you want to do | Files to change |
|---------------------|----------------|
| Add a column to Trade Log | DB (SQL) + `trade-form.tsx` + `trade-table.tsx` + `api/export/route.ts` |
| Add a column to Products | DB (SQL) + `app/products/page.tsx` + `api/products/route.ts` |
| Change a dropdown's options | Only the frontend component (e.g., `trade-form.tsx`) |
| Add a new filter | `trade-table.tsx` (add dropdown) + `api/trades/route.ts` (add query param) |
| Change P&L calculation | `trade-table.tsx` (`calcPnl` function) + `summary-stats.tsx` + `api/export/route.ts` |
| Add a new page/module | Create `src/app/new-module/page.tsx` + add to `sidebar.tsx` nav |

---

## Field Types Cheat Sheet

| Field type | Database SQL | Frontend input |
|-----------|-------------|----------------|
| Text (free) | `ADD COLUMN x TEXT` | `<input>` |
| Dropdown | `ADD COLUMN x TEXT CHECK (x IN ('A','B','C'))` | `<select>` |
| Number | `ADD COLUMN x DECIMAL` | `<input type="number">` |
| Yes/No | `ADD COLUMN x BOOLEAN DEFAULT false` | `<input type="checkbox">` |
| Date | `ADD COLUMN x DATE` | `<input type="date">` |
| Time | `ADD COLUMN x TIMESTAMPTZ` | `<input type="time">` |

---

## AI Prompt Template

If you're using Claude/AI to make the change, give it this prompt:

```
I want to add a new field "[FIELD NAME]" to the Trade Log in my projectX app.
- Type: [text / dropdown with options X,Y,Z / number / boolean / date]
- Where in the form: [after which existing field]

Please update:
1. The Supabase SQL to add the column
2. src/components/trade-form.tsx (interface + empty form + input)
3. src/components/trade-table.tsx (interface + expanded detail)
4. src/app/api/export/route.ts (add to CSV headers and rows)
```

This gives the AI everything it needs to make the change in one shot.
