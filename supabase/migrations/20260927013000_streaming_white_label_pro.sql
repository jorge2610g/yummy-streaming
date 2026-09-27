-- Streaming: Marca Blanca PLUS solo para planes con capacidad white_label.
-- Aplicado primero en Staging. Mantener este archivo para la promoción controlada a Producción.

update public.subscription_plans
   set modules = case
     when coalesce(modules,'[]'::jsonb) ? 'white_label' then modules
     else coalesce(modules,'[]'::jsonb) || '["white_label"]'::jsonb
   end,
   updated_at = now()
 where business_type='streaming'
   and lower(name)='pro';

create or replace function public.enforce_white_label_plan_capability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean := false;
  plan_modules jsonb := '[]'::jsonb;
begin
  if coalesce(new.white_label_enabled,false)=false then
    return new;
  end if;

  if new.active is distinct from true
     or lower(coalesce(new.subscription_status,'')) not in ('trial','active')
     or (new.subscription_expires_at is not null and new.subscription_expires_at <= now()) then
    allowed := false;
  elsif coalesce(new.subscription_modules_customized,false) then
    allowed := coalesce(new.subscription_module_overrides,'[]'::jsonb) ? 'white_label';
  elsif new.subscription_plan_id is not null then
    select coalesce(sp.modules,'[]'::jsonb)
      into plan_modules
      from public.subscription_plans sp
     where sp.id=new.subscription_plan_id
       and sp.active=true
       and sp.business_type=new.business_type;
    allowed := coalesce(plan_modules,'[]'::jsonb) ? 'white_label';
  else
    allowed := false;
  end if;

  if allowed then
    return new;
  end if;

  if tg_op='UPDATE'
     and coalesce(old.white_label_enabled,false)=false
     and coalesce(new.white_label_enabled,false)=true then
    raise exception 'Marca Blanca está disponible únicamente para planes con la capacidad white_label (Plan Pro).';
  end if;

  new.white_label_enabled := false;
  return new;
end;
$$;

drop trigger if exists trg_enforce_white_label_plan_capability on public.restaurants;
create trigger trg_enforce_white_label_plan_capability
  before insert or update of white_label_enabled, subscription_plan_id, subscription_status,
         subscription_expires_at, subscription_modules_customized, subscription_module_overrides
  on public.restaurants
  for each row
  execute function public.enforce_white_label_plan_capability();

create or replace function public.streaming_public_catalog(p_restaurant_id bigint)
returns jsonb
language sql
stable security definer
set search_path to ''
as $function$
  select jsonb_build_object(
    'business',
      jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'is_demo', coalesce(r.is_demo,false),
        'effective_demo', coalesce(r.is_demo,false) and not coalesce(o.enabled,false),
        'logo_url', r.logo_url,
        'whatsapp', r.whatsapp,
        'currency_code', coalesce(r.currency_code,'CLP'),
        'locale', coalesce(r.locale,'es-CL'),
        'country_code', coalesce(r.country_code,'CL'),
        'theme_primary_color', r.theme_primary_color,
        'theme_secondary_color', r.theme_secondary_color,
        'white_label_enabled',
          coalesce(r.white_label_enabled,false)
          and public.restaurant_subscription_module_enabled(r.id,'white_label'),
        'accept_mercadopago', coalesce(r.accept_mercadopago,true),
        'payment_online_ready',
          coalesce(r.accept_mercadopago,true)
          and nullif(trim(coalesce(r.mercadopago_public_key,'')),'') is not null
          and exists (
            select 1 from public.restaurant_payment_connections pc
            where pc.restaurant_id=r.id
              and nullif(trim(coalesce(pc.access_token,'')),'') is not null
          )
      ),
    'products',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'default_duration_days', p.default_duration_days,
            'sale_price', p.sale_price,
            'free_slots', greatest(
              coalesce((
                select sum(
                  greatest(
                    coalesce(a.max_slots,1)::bigint -
                    (
                      select count(*)
                      from public.streaming_subscriptions s
                      where s.restaurant_id = r.id
                        and s.account_id = a.id
                        and s.status = 'active'
                        and coalesce(s.starts_at, now()) <= now()
                        and s.expires_at > now()
                    ),
                    0
                  )
                )
                from public.streaming_accounts a
                where a.restaurant_id = r.id
                  and a.platform_id = p.id
                  and a.active is distinct from false
              ),0)
              -
              coalesce((
                select sum(greatest(1,coalesce(nullif(i->>'qty','')::integer,1)))
                from public.streaming_orders so
                cross join lateral jsonb_array_elements(so.items) i
                where so.restaurant_id=r.id
                  and so.status='pending_payment'
                  and so.payment_status='pending'
                  and so.created_at > now() - interval '30 minutes'
                  and (i->>'platform_id')::bigint=p.id
              ),0),
              0
            )
          )
          order by p.sort_order nulls last, p.name
        )
        from public.streaming_platforms p
        where p.restaurant_id = r.id
          and p.active is distinct from false
      ), '[]'::jsonb)
  )
  from public.restaurants r
  left join public.business_payment_test_overrides o on o.restaurant_id=r.id
  where r.id = p_restaurant_id
    and r.business_type = 'streaming'
    and r.active is distinct from false
    and coalesce(r.subscription_status,'trial') in ('trial','active')
    and (r.subscription_expires_at is null or r.subscription_expires_at > now());
$function$;
