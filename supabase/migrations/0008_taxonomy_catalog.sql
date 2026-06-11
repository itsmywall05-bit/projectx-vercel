-- Taxonomy strategy catalog (custom/user-defined structures)
-- Built-in strategies (S, F, FF, D, ...) remain hardcoded in taxonomy.ts.
-- This table holds only user-created custom strategies.

create table if not exists public.taxonomy_catalog (
  id         uuid primary key default gen_random_uuid(),
  sym        text not null unique,
  name       text not null,
  rule       text not null default '',
  tier       integer,
  legs       jsonb not null default '[]'::jsonb,
  fill_form  text not null default '',
  diff_form  text not null default '',
  created_at timestamptz not null default now()
);

alter table public.taxonomy_catalog enable row level security;

create policy "Public read"  on public.taxonomy_catalog for select using (true);
create policy "Public write" on public.taxonomy_catalog for all    using (true);
