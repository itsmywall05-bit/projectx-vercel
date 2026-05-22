-- Create a durable price feed table for Excel RTD updates.
-- This table stores the latest price payload for each normalized price key.

create table if not exists price_feed (
  price_key text primary key,
  instrument text,
  symbol text,
  product text,
  anchor_month text,
  last numeric not null,
  change numeric,
  settle numeric,
  updated_at timestamptz not null default now()
);

create index if not exists idx_price_feed_instrument on price_feed (instrument);
create index if not exists idx_price_feed_symbol on price_feed (symbol);
create index if not exists idx_price_feed_product_anchor on price_feed (product, anchor_month);
