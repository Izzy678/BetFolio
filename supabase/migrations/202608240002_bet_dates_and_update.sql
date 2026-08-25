-- Prefer bet placement / settlement dates over upload time for ledger + dashboard.
-- Allow editing confirmed bets after import.

create or replace function public.finalize_bet_import(p_upload_id uuid, p_bet jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_user uuid := auth.uid(); v_upload public.bet_uploads%rowtype; v_bet_id uuid; v_bookmaker_id uuid;
  v_status text := p_bet->>'status'; v_currency text := upper(p_bet->>'currency');
  v_cash numeric := coalesce((p_bet->>'cashStake')::numeric, 0); v_promo numeric := coalesce((p_bet->>'promotionalStake')::numeric, 0);
  v_return numeric := nullif(p_bet->>'displayedReturn','')::numeric; v_return_kind text := p_bet->>'returnKind'; v_gross numeric;
  v_placed timestamptz := nullif(p_bet->>'placedAt','')::timestamptz;
  v_settled timestamptz := nullif(p_bet->>'settledAt','')::timestamptz;
  v_when timestamptz;
begin
  if v_user is null then raise exception using errcode = '42501', message = 'AUTH_REQUIRED'; end if;
  select * into v_upload from public.bet_uploads where id = p_upload_id and user_id = v_user for update;
  if not found then raise exception using errcode = 'P0001', message = 'UPLOAD_NOT_FOUND'; end if;
  select id into v_bet_id from public.bets where source_upload_id = p_upload_id;
  if v_bet_id is not null then return v_bet_id; end if;
  if v_upload.status not in ('ready','needs_review') then raise exception using errcode = 'P0001', message = 'UPLOAD_NOT_READY'; end if;
  if v_currency !~ '^[A-Z]{3}$' or v_cash < 0 or v_promo < 0 or coalesce(v_return,0) < 0 then raise exception using errcode = '22023', message = 'INVALID_FINANCIAL_INPUT'; end if;
  if v_status not in ('won','lost','void','push','cashout','pending') then raise exception using errcode = '22023', message = 'UNSUPPORTED_SETTLEMENT'; end if;
  if v_promo > 0 and v_status <> 'lost' then raise exception using errcode = '22023', message = 'UNSUPPORTED_PROMOTIONAL_SETTLEMENT'; end if;
  if v_status in ('void','push') and v_return is not null and abs(v_return-v_cash) > 0.009 then raise exception using errcode = '22023', message = 'REFUND_MISMATCH'; end if;
  if v_status = 'won' and coalesce(v_return_kind,'') not in ('gross_return','net_profit') then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  if v_status = 'cashout' and coalesce(v_return_kind,'') <> 'cashout' then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  if v_placed is null then raise exception using errcode = '22023', message = 'PLACED_AT_REQUIRED'; end if;
  if v_status = 'pending' then v_settled := null; end if;
  if v_status <> 'pending' and v_settled is null then v_settled := v_placed; end if;
  v_when := coalesce(v_settled, v_placed);
  select id into v_bookmaker_id from public.bookmakers where lower(name) = lower(p_bet->>'bookmakerName') or slug = lower(replace(p_bet->>'bookmakerName',' ','-')) limit 1;
  v_gross := case when v_status = 'won' and v_return_kind = 'net_profit' then v_return + v_cash when v_status in ('won','cashout','void','push') then v_return else null end;
  if v_status = 'won' and v_gross is null then raise exception using errcode = '22023', message = 'RETURN_REQUIRED'; end if;
  insert into public.bets (user_id, bookmaker_id, bookmaker_name_raw, external_bet_id, bet_type, status, currency, cash_stake, promo_stake, total_odds_decimal, total_odds_raw, odds_format, gross_return, placed_at, settled_at, source_upload_id)
  values (v_user, v_bookmaker_id, case when v_bookmaker_id is null then nullif(p_bet->>'bookmakerName','') else null end, nullif(p_bet->>'externalBetId',''), coalesce(nullif(p_bet->>'betType',''), 'single'), v_status, v_currency, v_cash, v_promo, nullif(p_bet->>'totalOddsDecimal','')::numeric, nullif(p_bet->>'totalOddsRaw',''), nullif(p_bet->>'oddsFormat',''), v_gross, v_placed, v_settled, p_upload_id)
  returning id into v_bet_id;
  if v_cash > 0 then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'stake',-v_cash,v_currency,v_placed); end if;
  if v_status = 'won' then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'settlement',v_gross,v_currency,v_when);
  elsif v_status in ('void','push') then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'refund',coalesce(v_return,v_cash),v_currency,v_when);
  elsif v_status = 'cashout' then if v_return is null then raise exception using errcode='22023',message='RETURN_REQUIRED'; end if; insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'cashout',v_return,v_currency,v_when);
  end if;
  update public.bet_uploads set status = 'imported', error_code = null, error_message = null where id = p_upload_id;
  return v_bet_id;
exception when unique_violation then
  raise exception using errcode = '23505', message = 'BET_DUPLICATE';
end;
$$;

create or replace function public.update_bet(p_bet_id uuid, p_bet jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_user uuid := auth.uid(); v_existing public.bets%rowtype; v_bookmaker_id uuid;
  v_status text := p_bet->>'status'; v_currency text := upper(p_bet->>'currency');
  v_cash numeric := coalesce((p_bet->>'cashStake')::numeric, 0); v_promo numeric := coalesce((p_bet->>'promotionalStake')::numeric, 0);
  v_return numeric := nullif(p_bet->>'displayedReturn','')::numeric; v_return_kind text := p_bet->>'returnKind'; v_gross numeric;
  v_placed timestamptz := nullif(p_bet->>'placedAt','')::timestamptz;
  v_settled timestamptz := nullif(p_bet->>'settledAt','')::timestamptz;
  v_when timestamptz;
begin
  if v_user is null then raise exception using errcode = '42501', message = 'AUTH_REQUIRED'; end if;
  select * into v_existing from public.bets where id = p_bet_id and user_id = v_user for update;
  if not found then raise exception using errcode = 'P0001', message = 'BET_NOT_FOUND'; end if;
  if v_currency !~ '^[A-Z]{3}$' or v_cash < 0 or v_promo < 0 or coalesce(v_return,0) < 0 then raise exception using errcode = '22023', message = 'INVALID_FINANCIAL_INPUT'; end if;
  if v_status not in ('won','lost','void','push','cashout','pending') then raise exception using errcode = '22023', message = 'UNSUPPORTED_SETTLEMENT'; end if;
  if v_promo > 0 and v_status <> 'lost' then raise exception using errcode = '22023', message = 'UNSUPPORTED_PROMOTIONAL_SETTLEMENT'; end if;
  if v_status in ('void','push') and v_return is not null and abs(v_return-v_cash) > 0.009 then raise exception using errcode = '22023', message = 'REFUND_MISMATCH'; end if;
  if v_status = 'won' and coalesce(v_return_kind,'') not in ('gross_return','net_profit') then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  if v_status = 'cashout' and coalesce(v_return_kind,'') <> 'cashout' then raise exception using errcode = '22023', message = 'AMBIGUOUS_RETURN'; end if;
  if v_placed is null then raise exception using errcode = '22023', message = 'PLACED_AT_REQUIRED'; end if;
  if v_status = 'pending' then v_settled := null; end if;
  if v_status <> 'pending' and v_settled is null then v_settled := v_placed; end if;
  v_when := coalesce(v_settled, v_placed);
  select id into v_bookmaker_id from public.bookmakers where lower(name) = lower(p_bet->>'bookmakerName') or slug = lower(replace(p_bet->>'bookmakerName',' ','-')) limit 1;
  v_gross := case when v_status = 'won' and v_return_kind = 'net_profit' then v_return + v_cash when v_status in ('won','cashout','void','push') then v_return else null end;
  if v_status = 'won' and v_gross is null then raise exception using errcode = '22023', message = 'RETURN_REQUIRED'; end if;

  update public.bets set
    bookmaker_id = v_bookmaker_id,
    bookmaker_name_raw = case when v_bookmaker_id is null then nullif(p_bet->>'bookmakerName','') else null end,
    external_bet_id = coalesce(nullif(p_bet->>'externalBetId',''), v_existing.external_bet_id),
    bet_type = coalesce(nullif(p_bet->>'betType',''), v_existing.bet_type),
    status = v_status,
    currency = v_currency,
    cash_stake = v_cash,
    promo_stake = v_promo,
    total_odds_decimal = nullif(p_bet->>'totalOddsDecimal','')::numeric,
    total_odds_raw = nullif(p_bet->>'totalOddsRaw',''),
    odds_format = nullif(p_bet->>'oddsFormat',''),
    gross_return = v_gross,
    placed_at = v_placed,
    settled_at = v_settled,
    updated_at = now()
  where id = p_bet_id;

  delete from public.bet_transactions where bet_id = p_bet_id;

  if v_cash > 0 then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (p_bet_id,v_user,'stake',-v_cash,v_currency,v_placed); end if;
  if v_status = 'won' then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (p_bet_id,v_user,'settlement',v_gross,v_currency,v_when);
  elsif v_status in ('void','push') then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (p_bet_id,v_user,'refund',coalesce(v_return,v_cash),v_currency,v_when);
  elsif v_status = 'cashout' then if v_return is null then raise exception using errcode='22023',message='RETURN_REQUIRED'; end if; insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (p_bet_id,v_user,'cashout',v_return,v_currency,v_when);
  end if;

  return p_bet_id;
end;
$$;

revoke all on function public.update_bet(uuid,jsonb) from public;
grant execute on function public.update_bet(uuid,jsonb) to authenticated;

drop view if exists public.bet_list;
create view public.bet_list with (security_invoker = true) as
select b.id, b.user_id, coalesce(bm.name, b.bookmaker_name_raw, 'Unknown bookmaker') as bookmaker,
  b.external_bet_id, b.bet_type, b.status, b.currency, b.cash_stake, b.total_odds_decimal,
  b.placed_at, b.settled_at, coalesce(sum(t.amount), 0)::numeric(18,2) as pnl
from public.bets b left join public.bookmakers bm on bm.id = b.bookmaker_id
left join public.bet_transactions t on t.bet_id = b.id
group by b.id, bm.name;
grant select on public.bet_list to authenticated;

create or replace function public.dashboard_snapshot(p_currency text, p_days integer default 30)
returns jsonb language sql stable security invoker set search_path = '' as $$
with filtered_tx as (
  select t.* from public.bet_transactions t where t.user_id = auth.uid() and t.currency = upper(p_currency)
    and (p_days is null or t.occurred_at >= now() - make_interval(days => p_days))
), filtered_bets as (
  select b.* from public.bets b where b.user_id = auth.uid() and b.currency = upper(p_currency)
    and (p_days is null or coalesce(b.settled_at, b.placed_at, b.created_at) >= now() - make_interval(days => p_days))
), summary as (
  select coalesce(sum(amount),0) net_pnl, coalesce(-sum(amount) filter(where type='stake'),0) cash_staked,
    coalesce(sum(amount) filter(where type in ('settlement','refund','cashout') and amount > 0),0) total_returned from filtered_tx
), bet_summary as (
  select count(*) total_bets, count(*) filter(where status='won') wins, count(*) filter(where status='lost') losses from filtered_bets
), daily_base as (
  select occurred_at::date as bucket_day, sum(amount) pnl from filtered_tx group by 1
), daily as (
  select bucket_day, pnl, sum(pnl) over(order by bucket_day) cumulative from daily_base
), by_bookmaker as (
  select coalesce(bm.name,b.bookmaker_name_raw,'Unknown bookmaker') name, sum(t.amount) pnl, count(distinct b.id) bets
  from filtered_bets b join filtered_tx t on t.bet_id=b.id left join public.bookmakers bm on bm.id=b.bookmaker_id group by 1
), recent as (
  select b.id, coalesce(bm.name,b.bookmaker_name_raw,'Unknown bookmaker') bookmaker, b.bet_type, b.status, b.cash_stake stake,
    coalesce(sum(t.amount),0) pnl, b.placed_at, b.settled_at from filtered_bets b left join public.bookmakers bm on bm.id=b.bookmaker_id left join public.bet_transactions t on t.bet_id=b.id
    group by b.id, bm.name, b.bookmaker_name_raw, b.bet_type, b.status, b.cash_stake, b.placed_at, b.settled_at
    order by coalesce(b.settled_at, b.placed_at) desc nulls last limit 8
), currencies as (select distinct currency from public.bets where user_id=auth.uid())
select jsonb_build_object('currency',upper(p_currency),'summary',jsonb_build_object('netPnl',s.net_pnl,'cashStaked',s.cash_staked,'totalReturned',s.total_returned,'roi',case when s.cash_staked=0 then null else round(s.net_pnl/s.cash_staked*100,2) end,'totalBets',bs.total_bets,'winRate',case when bs.wins+bs.losses=0 then null else round(bs.wins::numeric/(bs.wins+bs.losses)*100,1) end),'daily',coalesce((select jsonb_agg(jsonb_build_object('date',bucket_day,'pnl',pnl,'cumulative',cumulative) order by bucket_day) from daily),'[]'::jsonb),'bookmakers',coalesce((select jsonb_agg(jsonb_build_object('name',name,'pnl',pnl,'bets',bets) order by pnl desc) from by_bookmaker),'[]'::jsonb),'recent',coalesce((select jsonb_agg(jsonb_build_object('id',id,'bookmaker',bookmaker,'betType',bet_type,'status',status,'stake',stake,'pnl',pnl,'placedAt',placed_at,'settledAt',settled_at)) from recent),'[]'::jsonb),'currencies',coalesce((select jsonb_agg(currency order by currency) from currencies),jsonb_build_array(upper(p_currency)))) from summary s cross join bet_summary bs;
$$;
