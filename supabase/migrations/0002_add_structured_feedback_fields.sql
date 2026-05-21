-- ───────────────────────────────────────────────────────────────
-- Add structured EOD feedback fields to feedback_log
-- ───────────────────────────────────────────────────────────────

alter table if exists public.feedback_log
  add column if not exists went_well text,
  add column if not exists didnt_go_well text,
  add column if not exists to_improve text,
  add column if not exists mistake text,
  add column if not exists learning text;

create index if not exists feedback_log_session_date_idx on public.feedback_log (session_date);
