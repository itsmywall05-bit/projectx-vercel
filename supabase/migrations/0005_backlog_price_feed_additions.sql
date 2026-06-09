-- ─── backlog_items: add priority, entry_date, notes, tags ───────
alter table public.backlog_items
  add column if not exists priority   text    default 'medium'
                                              check (priority in ('low', 'medium', 'high')),
  add column if not exists entry_date date,
  add column if not exists notes      text,
  add column if not exists tags       text[]  not null default '{}';

-- ─── price_feed: add exchange ────────────────────────────────────
alter table public.price_feed
  add column if not exists exchange text;
