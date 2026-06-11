-- Fix taxonomy_catalog: use strategy code (e.g. "6MS") as text primary key.
-- sym is NOT unique — multiple strategies can share the same tower symbol.
drop table if exists public.taxonomy_catalog;

create table public.taxonomy_catalog (
  id         text primary key,        -- strategy code, e.g. "6MS", "3F"
  sym        text not null,           -- tower, e.g. "S", "F" (not unique)
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
