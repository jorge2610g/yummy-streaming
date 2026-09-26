-- Streaming scalability: indexed search + server-side paging
create index if not exists streaming_customers_search_trgm_idx
on public.streaming_customers
using gin ((coalesce(full_name,'') || ' ' || coalesce(phone,'') || ' ' || coalesce(email,'')) gin_trgm_ops);

create index if not exists streaming_accounts_search_trgm_idx
on public.streaming_accounts
using gin ((coalesce(label,'') || ' ' || coalesce(login_identifier,'')) gin_trgm_ops);

create index if not exists streaming_platforms_name_trgm_idx
on public.streaming_platforms
using gin (coalesce(name,'') gin_trgm_ops);

create or replace function public.streaming_customer_directory_page(
  p_restaurant_id bigint,
  p_limit integer default 50,
  p_offset integer default 0,
  p_search text default null
)
returns jsonb
language sql
security invoker
set search_path=''
as $$
with customers as (
  select c.*
  from public.streaming_customers c
  where c.restaurant_id=p_restaurant_id
    and (
      nullif(btrim(coalesce(p_search,'')),'') is null
      or (coalesce(c.full_name,'') || ' ' || coalesce(c.phone,'') || ' ' || coalesce(c.email,'')) ilike '%'||btrim(p_search)||'%'
    )
),
page as (
  select * from customers
  order by active desc,full_name,id
  offset greatest(coalesce(p_offset,0),0)
  limit least(greatest(coalesce(p_limit,50),1),100)
),
counts as (
  select s.customer_id,
         count(*)::bigint subscription_count,
         count(*) filter(where s.status not in ('cancelled','paused') and s.expires_at>now())::bigint active_subscription_count
  from public.streaming_subscriptions s
  join page p on p.id=s.customer_id
  where s.restaurant_id=p_restaurant_id
  group by s.customer_id
)
select jsonb_build_object(
 'total',(select count(*) from customers),
 'rows',coalesce((
   select jsonb_agg(
     to_jsonb(p)||jsonb_build_object(
       'subscription_count',coalesce(c.subscription_count,0),
       'active_subscription_count',coalesce(c.active_subscription_count,0)
     ) order by p.active desc,p.full_name,p.id
   )
   from page p left join counts c on c.customer_id=p.id
 ),'[]'::jsonb)
)
$$;

revoke all on function public.streaming_customer_directory_page(bigint,integer,integer,text) from public,anon;
grant execute on function public.streaming_customer_directory_page(bigint,integer,integer,text) to authenticated;

create or replace function public.streaming_subscription_directory_page(
  p_restaurant_id bigint,
  p_limit integer default 50,
  p_offset integer default 0,
  p_search text default null,
  p_view text default 'all'
)
returns jsonb
language sql
security invoker
set search_path=''
as $$
with joined as (
  select s.*,c.full_name customer_name,c.phone customer_phone,c.email customer_email,
         p.name platform_name,a.label account_label
  from public.streaming_subscriptions s
  join public.streaming_customers c on c.id=s.customer_id and c.restaurant_id=s.restaurant_id
  join public.streaming_platforms p on p.id=s.platform_id and p.restaurant_id=s.restaurant_id
  left join public.streaming_accounts a on a.id=s.account_id and a.restaurant_id=s.restaurant_id
  where s.restaurant_id=p_restaurant_id
),
filtered as (
  select * from joined
  where (
    coalesce(p_view,'all')='all'
    or (p_view='active' and status not in ('cancelled','paused') and expires_at>now())
    or (p_view='today' and status not in ('cancelled','paused') and expires_at>now() and expires_at<=now()+interval '1 day')
    or (p_view='urgent' and status not in ('cancelled','paused') and expires_at>now() and expires_at<=now()+interval '3 days')
    or (p_view='expiring' and status not in ('cancelled','paused') and expires_at>now() and expires_at<=now()+interval '7 days')
    or (p_view='expired' and status not in ('cancelled','paused') and expires_at<=now())
  )
  and (
    nullif(btrim(coalesce(p_search,'')),'') is null
    or (coalesce(customer_name,'')||' '||coalesce(customer_phone,'')||' '||coalesce(platform_name,'')||' '||coalesce(account_label,'')||' '||coalesce(profile_label,'')) ilike '%'||btrim(p_search)||'%'
  )
),
page as (
  select * from filtered
  order by expires_at,id
  offset greatest(coalesce(p_offset,0),0)
  limit least(greatest(coalesce(p_limit,50),1),100)
),
metrics as (
  select
    count(*) filter(where status not in ('cancelled','paused') and expires_at>now())::bigint active_count,
    count(*) filter(where status not in ('cancelled','paused') and expires_at>now() and expires_at<=now()+interval '7 days')::bigint expiring_count,
    count(*) filter(where status not in ('cancelled','paused') and expires_at<=now())::bigint expired_count
  from joined
),
slots as (
  select coalesce(sum(greatest(a.max_slots-coalesce(u.used,0),0)) filter(where a.active),0)::bigint free_slots
  from public.streaming_accounts a
  left join (
    select account_id,count(*)::int used
    from public.streaming_subscriptions
    where restaurant_id=p_restaurant_id
      and account_id is not null
      and status not in ('cancelled','paused')
      and starts_at<=now() and expires_at>now()
    group by account_id
  ) u on u.account_id=a.id
  where a.restaurant_id=p_restaurant_id
)
select jsonb_build_object(
 'total',(select count(*) from filtered),
 'active_count',(select active_count from metrics),
 'expiring_count',(select expiring_count from metrics),
 'expired_count',(select expired_count from metrics),
 'free_slots',(select free_slots from slots),
 'rows',coalesce((select jsonb_agg(to_jsonb(page) order by expires_at,id) from page),'[]'::jsonb)
)
$$;

revoke all on function public.streaming_subscription_directory_page(bigint,integer,integer,text,text) from public,anon;
grant execute on function public.streaming_subscription_directory_page(bigint,integer,integer,text,text) to authenticated;

analyze public.streaming_customers;
analyze public.streaming_subscriptions;
analyze public.streaming_accounts;
analyze public.streaming_platforms;
