alter table public.bets drop constraint if exists bets_status_check;
alter table public.bets add constraint bets_status_check check (status in ('won','lost','void','push','cashout','partial_cashout','settled_unknown','pending'));

create or replace function public.finalize_bet_import(p_upload_id uuid, p_bet jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_user uuid := auth.uid(); v_upload public.bet_uploads%rowtype; v_bet_id uuid; v_bookmaker_id uuid;
  v_status text := p_bet->>'status'; v_currency text := upper(p_bet->>'currency');
  v_cash numeric := coalesce((p_bet->>'cashStake')::numeric, 0); v_promo numeric := coalesce((p_bet->>'promotionalStake')::numeric, 0);
  v_return numeric := nullif(p_bet->>'displayedReturn','')::numeric; v_return_kind text := p_bet->>'returnKind'; v_gross numeric;
  v_when timestamptz := coalesce(nullif(p_bet->>'settledAt','')::timestamptz, now());
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
  select id into v_bookmaker_id from public.bookmakers where lower(name) = lower(p_bet->>'bookmakerName') or slug = lower(replace(p_bet->>'bookmakerName',' ','-')) limit 1;
  v_gross := case when v_status = 'won' and v_return_kind = 'net_profit' then v_return + v_cash when v_status in ('won','cashout','void','push') then v_return else null end;
  if v_status = 'won' and v_gross is null then raise exception using errcode = '22023', message = 'RETURN_REQUIRED'; end if;
  insert into public.bets (user_id, bookmaker_id, bookmaker_name_raw, external_bet_id, bet_type, status, currency, cash_stake, promo_stake, total_odds_decimal, total_odds_raw, odds_format, gross_return, placed_at, settled_at, source_upload_id)
  values (v_user, v_bookmaker_id, case when v_bookmaker_id is null then nullif(p_bet->>'bookmakerName','') else null end, nullif(p_bet->>'externalBetId',''), coalesce(nullif(p_bet->>'betType',''), 'single'), v_status, v_currency, v_cash, v_promo, nullif(p_bet->>'totalOddsDecimal','')::numeric, nullif(p_bet->>'totalOddsRaw',''), nullif(p_bet->>'oddsFormat',''), v_gross, nullif(p_bet->>'placedAt','')::timestamptz, nullif(p_bet->>'settledAt','')::timestamptz, p_upload_id)
  returning id into v_bet_id;
  if v_cash > 0 then insert into public.bet_transactions (bet_id,user_id,type,amount,currency,occurred_at) values (v_bet_id,v_user,'stake',-v_cash,v_currency,coalesce(nullif(p_bet->>'placedAt','')::timestamptz,v_when)); end if;
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
