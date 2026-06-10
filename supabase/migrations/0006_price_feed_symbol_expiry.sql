-- Add expiry_date to price_feed for proper chronological ordering.
-- Backfill from existing anchor_month values (e.g. "Jul26" → 2026-07-01).

alter table public.price_feed
  add column if not exists expiry_date date;

create index if not exists idx_price_feed_expiry on public.price_feed (expiry_date);

-- Backfill: to_date('Jul26', 'MonYY') → 2026-07-01
update public.price_feed
set expiry_date = to_date(anchor_month, 'MonYY')
where anchor_month is not null
  and expiry_date is null;
