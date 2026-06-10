-- Remove stale price_feed rows that pre-date the symbol-key change.
-- These are rows keyed as "CL MAR27" (product+anchorMonth) with no symbol,
-- replaced by symbol-keyed rows (CLN6) from the current Excel bridge.
DELETE FROM public.price_feed
WHERE symbol IS NULL;
