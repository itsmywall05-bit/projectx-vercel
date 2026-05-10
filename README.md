# projectX — Trading Mind

A modular trading dashboard for futures traders. Enter trades, track P&L, manage products, export data.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (dark theme)
- **Supabase** (Postgres database)
- **Vercel** (hosting, auto-deploy)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

Every push to `main` auto-deploys via Vercel.

## Project Structure

```
src/app/login/        → Passcode login
src/app/trade-log/    → Trade log (form + table + stats)
src/app/products/     → Product management
src/app/api/          → API routes (auth, trades, products, export)
src/components/       → Reusable UI components
src/lib/              → Supabase clients, utilities
docs/                 → Documentation for non-technical users
```
