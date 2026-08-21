create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$'),
  base_currency text null check (base_currency is null or base_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_username_lower_key on public.profiles (lower(username));

create table public.bookmakers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.bet_uploads (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  sha256 text null check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  status text not null default 'uploaded' check (status in ('uploaded','processing','needs_review','ready','imported','duplicate','failed')),
  duplicate_of uuid null references public.bet_uploads(id) on delete set null,
  error_code text null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bet_upload_path_owner check (split_part(storage_path, '/', 1) = user_id::text)
);
create index bet_uploads_user_created_idx on public.bet_uploads(user_id, created_at desc);
create index bet_uploads_user_status_idx on public.bet_uploads(user_id, status);
create unique index bet_uploads_unique_original_hash on public.bet_uploads(user_id, sha256) where sha256 is not null and duplicate_of is null;

create table public.bet_extractions (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.bet_uploads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  model text not null,
  prompt_version text not null,
  schema_version text not null,
  raw_response jsonb not null,
  normalized_data jsonb not null,
  validation_issues jsonb not null default '[]'::jsonb,
  confidence_score numeric(5,2) null check (confidence_score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (upload_id, schema_version)
);
create index bet_extractions_user_idx on public.bet_extractions(user_id, created_at desc);
create index bet_extractions_upload_idx on public.bet_extractions(upload_id);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bookmaker_id uuid null references public.bookmakers(id) on delete set null,
  bookmaker_name_raw text null,
  external_bet_id text null,
  bet_type text not null check (bet_type in ('single','accumulator','bet_builder','system','each_way','other')),
  status text not null check (status in ('won','lost','void','push','cashout','partial_cashout','settled_unknown')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  cash_stake numeric(18,2) not null check (cash_stake >= 0),
  promo_stake numeric(18,2) not null default 0 check (promo_stake >= 0),
  total_odds_decimal numeric(18,6) null check (total_odds_decimal >= 0),
  total_odds_raw text null,
  odds_format text null check (odds_format is null or odds_format in ('decimal','fractional','american','unknown')),
  gross_return numeric(18,2) null check (gross_return >= 0),
  placed_at timestamptz null,
  settled_at timestamptz null,
  source_upload_id uuid null references public.bet_uploads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bets_user_settled_idx on public.bets(user_id, settled_at desc);
create index bets_user_status_idx on public.bets(user_id, status);
create index bets_user_bookmaker_idx on public.bets(user_id, bookmaker_id);
create unique index bets_source_upload_key on public.bets(source_upload_id) where source_upload_id is not null;
create unique index bets_external_id_key on public.bets(user_id, coalesce(bookmaker_id::text, lower(bookmaker_name_raw), 'unknown'), external_bet_id) where external_bet_id is not null;

create table public.bet_legs (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets(id) on delete cascade,
  position integer not null check (position > 0),
  sport text null,
  competition text null,
  event_name text null,
  market text null,
  selection text null,
  odds_decimal numeric(18,6) null check (odds_decimal >= 0),
  odds_raw text null,
  result text null check (result is null or result in ('won','lost','void','push','unknown')),
  event_started_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (bet_id, position)
);
create index bet_legs_bet_idx on public.bet_legs(bet_id);

create table public.bet_transactions (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('stake','settlement','refund','cashout','bonus','fee','tax','adjustment')),
  amount numeric(18,2) not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index bet_transactions_user_currency_date_idx on public.bet_transactions(user_id, currency, occurred_at desc);
create index bet_transactions_bet_idx on public.bet_transactions(bet_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger bet_uploads_set_updated_at before update on public.bet_uploads for each row execute function public.set_updated_at();
create trigger bets_set_updated_at before update on public.bets for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.bookmakers enable row level security;
alter table public.bet_uploads enable row level security;
alter table public.bet_extractions enable row level security;
alter table public.bets enable row level security;
alter table public.bet_legs enable row level security;
alter table public.bet_transactions enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "bookmakers authenticated read" on public.bookmakers for select to authenticated using (true);
create policy "uploads select own" on public.bet_uploads for select to authenticated using (user_id = auth.uid());
create policy "uploads insert own" on public.bet_uploads for insert to authenticated with check (user_id = auth.uid() and split_part(storage_path, '/', 1) = auth.uid()::text);
create policy "uploads update own" on public.bet_uploads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "uploads delete own" on public.bet_uploads for delete to authenticated using (user_id = auth.uid());
create policy "extractions select own" on public.bet_extractions for select to authenticated using (user_id = auth.uid());
create policy "extractions insert own" on public.bet_extractions for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.bet_uploads u where u.id = upload_id and u.user_id = auth.uid()));
create policy "bets select own" on public.bets for select to authenticated using (user_id = auth.uid());
create policy "bets insert own" on public.bets for insert to authenticated with check (user_id = auth.uid());
create policy "bets update own" on public.bets for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bets delete own" on public.bets for delete to authenticated using (user_id = auth.uid());
create policy "legs select through own bet" on public.bet_legs for select to authenticated using (exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "legs insert through own bet" on public.bet_legs for insert to authenticated with check (exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "legs update through own bet" on public.bet_legs for update to authenticated using (exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid())) with check (exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "legs delete through own bet" on public.bet_legs for delete to authenticated using (exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "transactions select own" on public.bet_transactions for select to authenticated using (user_id = auth.uid());
create policy "transactions insert own bet" on public.bet_transactions for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "transactions update own bet" on public.bet_transactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid()));
create policy "transactions delete own" on public.bet_transactions for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('betslips', 'betslips', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "betslips insert own folder" on storage.objects for insert to authenticated with check (bucket_id = 'betslips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "betslips select own folder" on storage.objects for select to authenticated using (bucket_id = 'betslips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "betslips delete own folder" on storage.objects for delete to authenticated using (bucket_id = 'betslips' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace view public.bet_list with (security_invoker = true) as
select b.id, b.user_id, coalesce(bm.name, b.bookmaker_name_raw, 'Unknown bookmaker') as bookmaker,
  b.external_bet_id, b.bet_type, b.status, b.currency, b.cash_stake, b.total_odds_decimal,
  b.settled_at, coalesce(sum(t.amount), 0)::numeric(18,2) as pnl
from public.bets b left join public.bookmakers bm on bm.id = b.bookmaker_id
left join public.bet_transactions t on t.bet_id = b.id
group by b.id, bm.name;
grant select on public.bet_list to authenticated;

create or replace function public.finalize_bet_import(p_upload_id uuid, p_bet jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_user uuid := auth.uid(); v_upload public.bet_uploads%rowtype; v_bet_id uuid; v_bookmaker_id uuid;
  v_status text := p_bet->>'status'; v_currency text := upper(p_bet->>'currency');
  v_cash numeric := coalesce((p_bet->>'cashStake')::numeric, 0); v_promo numeric := coalesce((p_bet->>'promotionalStake')::numeric, 0);
  v_return numeric := nullif(p_bet->>'displayedReturn','')::numeric; v_return_kind text := p_bet->>'returnKind'; v_gross numeric;
  v_when timestamptz := coalesce(nullif(p_bet->>'settledAt','')::timestamptz, now()); v_leg jsonb;
begin
  if v_user is null then raise exception using errcode = '42501', message = 'AUTH_REQUIRED'; end if;
  select * into v_upload from public.bet_uploads where id = p_upload_id and user_id = v_user for update;
  if not found then raise exception using errcode = 'P0001', message = 'UPLOAD_NOT_FOUND'; end if;
  select id into v_bet_id from public.bets where source_upload_id = p_upload_id;
  if v_bet_id is not null then return v_bet_id; end if;
  if v_upload.status not in ('ready','needs_review') then raise exception using errcode = 'P0001', message = 'UPLOAD_NOT_READY'; end if;
  if v_currency !~ '^[A-Z]{3}$' or v_cash < 0 or v_promo < 0 or coalesce(v_return,0) < 0 then raise exception using errcode = '22023', message = 'INVALID_FINANCIAL_INPUT'; end if;
  if v_status not in ('won','lost','void','push','cashout') then raise exception using errcode = '22023', message = 'UNSUPPORTED_SETTLEMENT'; end if;
  if v_promo > 0 and v_status <> 'lost' then raise exception using errcode = '22023', message = 'UNSUPPORTED_PROMOTIONAL_SETTLEMENT'; end if;
  if v_status in ('void','push') and v_return is not null and abs(v_return-v_cash) > 0.009 then raise exception using errcode = '22023', message = 'REFUND_MISMATCH'; end if;
  if v_status = 'won' and coalesce(v_return_kind,'') not in ('gross_return','net_profit') then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  if v_status = 'cashout' and coalesce(v_return_kind,'') <> 'cashout' then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  select id into v_bookmaker_id from public.bookmakers where lower(name) = lower(p_bet->>'bookmakerName') or slug = lower(replace(p_bet->>'bookmakerName',' ','-')) limit 1;
  v_gross := case when v_status = 'won' and v_return_kind = 'net_profit' then v_return + v_cash when v_status in ('won','cashout','void','push') then v_return else null end;
  if v_status = 'won' and v_gross is null then raise exception using errcode = '22023', message = 'RETURN_REQUIRED'; end if;
  insert into public.bets (user_id, bookmaker_id, bookmaker_name_raw, external_bet_id, bet_type, status, currency, cash_stake, promo_stake, total_odds_decimal, total_odds_raw, odds_format, gross_return, placed_at, settled_at, source_upload_id)
  values (v_user, v_bookmaker_id, case when v_bookmaker_id is null then nullif(p_bet->>'bookmakerName','') else null end, nullif(p_bet->>'externalBetId',''), p_bet->>'betType', v_status, v_currency, v_cash, v_promo, nullif(p_bet->>'totalOddsDecimal','')::numeric, nullif(p_bet->>'totalOddsRaw',''), nullif(p_bet->>'oddsFormat',''), v_gross, nullif(p_bet->>'placedAt','')::timestamptz, nullif(p_bet->>'settledAt','')::timestamptz, p_upload_id)
  returning id into v_bet_id;
  for v_leg in select * from jsonb_array_elements(coalesce(p_bet->'legs','[]'::jsonb)) loop
    insert into public.bet_legs (bet_id, position, sport, competition, event_name, market, selection, odds_decimal, odds_raw, result)
    values (v_bet_id, (v_leg->>'position')::integer, nullif(v_leg->>'sport',''), nullif(v_leg->>'competition',''), nullif(v_leg->>'eventName',''), nullif(v_leg->>'market',''), nullif(v_leg->>'selection',''), nullif(v_leg->>'oddsDecimal','')::numeric, nullif(v_leg->>'oddsRaw',''), coalesce(nullif(v_leg->>'result',''),'unknown'));
  end loop;
  if v_cash > 0 then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'stake',-v_cash,v_currency,coalesce(nullif(p_bet->>'placedAt','')::timestamptz,v_when)); end if;
  if v_status = 'won' then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'settlement',v_gross,v_currency,v_when);
  elsif v_status in ('void','push') then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'refund',coalesce(v_return,v_cash),v_currency,v_when);
  elsif v_status = 'cashout' then if v_return is null then raise exception using errcode='22023',message='RETURN_REQUIRED'; end if; insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'cashout',v_return,v_currency,v_when); end if;
  update public.bet_uploads set status = 'imported', error_code = null, error_message = null where id = p_upload_id;
  return v_bet_id;
exception when unique_violation then
  raise exception using errcode = '23505', message = 'BET_DUPLICATE';
end;
$$;
revoke all on function public.finalize_bet_import(uuid,jsonb) from public;
grant execute on function public.finalize_bet_import(uuid,jsonb) to authenticated;

create or replace function public.dashboard_snapshot(p_currency text, p_days integer default 30)
returns jsonb language sql stable security invoker set search_path = '' as $$
with filtered_tx as (
  select t.* from public.bet_transactions t where t.user_id = auth.uid() and t.currency = upper(p_currency)
    and (p_days is null or t.occurred_at >= now() - make_interval(days => p_days))
), filtered_bets as (
  select b.* from public.bets b where b.user_id = auth.uid() and b.currency = upper(p_currency)
    and (p_days is null or coalesce(b.settled_at,b.created_at) >= now() - make_interval(days => p_days))
), summary as (
  select coalesce(sum(amount),0) net_pnl, coalesce(-sum(amount) filter(where type='stake'),0) cash_staked,
    coalesce(sum(amount) filter(where type in ('settlement','refund','cashout') and amount > 0),0) total_returned from filtered_tx
), bet_summary as (
  select count(*) total_bets, count(*) filter(where status='won') wins, count(*) filter(where status='lost') losses from filtered_bets
), daily_base as (
  select occurred_at::date day, sum(amount) pnl from filtered_tx group by 1
), daily as (
  select day, pnl, sum(pnl) over(order by day) cumulative from daily_base
), by_bookmaker as (
  select coalesce(bm.name,b.bookmaker_name_raw,'Unknown bookmaker') name, sum(t.amount) pnl, count(distinct b.id) bets
  from filtered_bets b join filtered_tx t on t.bet_id=b.id left join public.bookmakers bm on bm.id=b.bookmaker_id group by 1
), recent as (
  select b.id, coalesce(bm.name,b.bookmaker_name_raw,'Unknown bookmaker') bookmaker, b.bet_type, b.status, b.cash_stake stake,
    coalesce(sum(t.amount),0) pnl, b.settled_at from filtered_bets b left join public.bookmakers bm on bm.id=b.bookmaker_id left join public.bet_transactions t on t.bet_id=b.id group by b.id,bm.name order by b.settled_at desc nulls last limit 8
), currencies as (select distinct currency from public.bets where user_id=auth.uid())
select jsonb_build_object('currency',upper(p_currency),'summary',jsonb_build_object('netPnl',s.net_pnl,'cashStaked',s.cash_staked,'totalReturned',s.total_returned,'roi',case when s.cash_staked=0 then null else round(s.net_pnl/s.cash_staked*100,2) end,'totalBets',bs.total_bets,'winRate',case when bs.wins+bs.losses=0 then null else round(bs.wins::numeric/(bs.wins+bs.losses)*100,1) end),'daily',coalesce((select jsonb_agg(jsonb_build_object('date',day,'pnl',pnl,'cumulative',cumulative) order by day) from daily),'[]'::jsonb),'bookmakers',coalesce((select jsonb_agg(jsonb_build_object('name',name,'pnl',pnl,'bets',bets) order by pnl desc) from by_bookmaker),'[]'::jsonb),'recent',coalesce((select jsonb_agg(jsonb_build_object('id',id,'bookmaker',bookmaker,'betType',bet_type,'status',status,'stake',stake,'pnl',pnl,'settledAt',settled_at)) from recent),'[]'::jsonb),'currencies',coalesce((select jsonb_agg(currency order by currency) from currencies),jsonb_build_array(upper(p_currency)))) from summary s cross join bet_summary bs;
$$;
revoke all on function public.dashboard_snapshot(text,integer) from public;
grant execute on function public.dashboard_snapshot(text,integer) to authenticated;

insert into public.bookmakers (slug,name) values ('bet365','Bet365'),('sky-bet','Sky Bet'),('paddy-power','Paddy Power'),('william-hill','William Hill'),('betfair','Betfair') on conflict (slug) do nothing;
