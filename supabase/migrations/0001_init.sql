-- ╔══════════════════════════════════════════════════════════════╗
-- ║ projectX v0.3 — initial schema                               ║
-- ║ Tables: rules, checklist, strategies, playbook, instruments, ║
-- ║         principles, deferred, backlog, feedback              ║
-- ╚══════════════════════════════════════════════════════════════╝

create extension if not exists "uuid-ossp";

-- ─── trading_rules ──────────────────────────────────────────────
create table if not exists public.trading_rules (
  id           uuid primary key default uuid_generate_v4(),
  rule_number  int not null,
  category     text not null check (category in ('entry', 'exit', 'sizing', 'market', 'limit')),
  title        text not null,
  body         text not null,
  tags         text[] not null default '{}',
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists trading_rules_rule_number_idx on public.trading_rules (rule_number);

-- ─── checklist_items ────────────────────────────────────────────
create table if not exists public.checklist_items (
  id          uuid primary key default uuid_generate_v4(),
  position    int not null,
  text        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists checklist_items_position_idx on public.checklist_items (position);

-- ─── strategies ─────────────────────────────────────────────────
create table if not exists public.strategies (
  id                 uuid primary key default uuid_generate_v4(),
  code               text not null unique,
  name               text not null,
  tagline            text,
  status             text not null default 'testing' check (status in ('testing', 'active', 'retired')),
  setup_conditions   text,
  entry_rules        text,
  exit_rules         text,
  market_conditions  text,
  edge_hypothesis    text,
  tags               text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── playbook_rules ─────────────────────────────────────────────
create table if not exists public.playbook_rules (
  id                  uuid primary key default uuid_generate_v4(),
  code                text not null unique,
  trigger_label       text not null,
  trigger_title       text not null,
  trigger_definition  text not null,
  actions             jsonb not null default '[]'::jsonb,
  tags                text[] not null default '{}',
  status              text not null default 'active' check (status in ('active', 'draft', 'retired')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── instruments ────────────────────────────────────────────────
create table if not exists public.instruments (
  id          uuid primary key default uuid_generate_v4(),
  symbol      text not null,
  name        text not null,
  parent_id   uuid references public.instruments(id) on delete set null,
  type        text not null check (type in ('underlying', 'outright', 'spread', 'fly')),
  formula     text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ─── principles ─────────────────────────────────────────────────
create table if not exists public.principles (
  id          uuid primary key default uuid_generate_v4(),
  number      int not null,
  title       text not null,
  body        text not null,
  source      text,
  created_at  timestamptz not null default now()
);
create index if not exists principles_number_idx on public.principles (number);

-- ─── deferred_items ─────────────────────────────────────────────
create table if not exists public.deferred_items (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  title       text not null,
  reason      text,
  category    text not null,
  created_at  timestamptz not null default now()
);

-- ─── backlog_items ──────────────────────────────────────────────
create table if not exists public.backlog_items (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null,
  status      text not null default 'idea' check (status in ('idea', 'in_progress', 'done')),
  created_at  timestamptz not null default now()
);

-- ─── feedback_log ───────────────────────────────────────────────
create table if not exists public.feedback_log (
  id              uuid primary key default uuid_generate_v4(),
  session_number  int not null,
  session_date    date not null,
  body            text not null,
  went_well       text,
  didnt_go_well   text,
  to_improve      text,
  mistake         text,
  learning        text,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index if not exists feedback_log_session_number_idx on public.feedback_log (session_number);
create index if not exists feedback_log_session_date_idx on public.feedback_log (session_date);

-- ─── Row-Level Security (open read for anon, write only via service role) ───
alter table public.trading_rules    enable row level security;
alter table public.checklist_items  enable row level security;
alter table public.strategies       enable row level security;
alter table public.playbook_rules   enable row level security;
alter table public.instruments      enable row level security;
alter table public.principles       enable row level security;
alter table public.deferred_items   enable row level security;
alter table public.backlog_items    enable row level security;
alter table public.feedback_log     enable row level security;

-- Allow public read on everything (this is the trader's own data; lock down later if needed)
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'trading_rules', 'checklist_items', 'strategies', 'playbook_rules',
    'instruments', 'principles', 'deferred_items', 'backlog_items', 'feedback_log'
  ]) loop
    execute format(
      'drop policy if exists "Public read" on public.%I;', t
    );
    execute format(
      'create policy "Public read" on public.%I for select using (true);', t
    );
  end loop;
end$$;
