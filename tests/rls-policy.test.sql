-- Run after `supabase db reset`. This file documents the ownership assertions
-- exercised by the migration policies and can be adapted to pgTAP in CI.
begin;
-- All user-owned policies bind reads and writes to auth.uid(); child leg access
-- is checked through bets.user_id, and Storage checks the first path segment.
do $$ begin
  assert exists (select 1 from pg_policies where schemaname='public' and tablename='bets' and policyname='bets select own');
  assert exists (select 1 from pg_policies where schemaname='public' and tablename='bet_uploads' and policyname='uploads select own');
  assert exists (select 1 from pg_policies where schemaname='public' and tablename='bet_extractions' and policyname='extractions select own');
  assert exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='betslips select own folder');
end $$;
rollback;
