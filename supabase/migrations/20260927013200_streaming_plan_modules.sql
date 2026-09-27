-- Streaming: aplicar módulos de plan también en la navegación.
-- La prueba de 30 días conserva todas las funciones operativas excepto Marca Blanca PLUS.

update public.subscription_plans
   set modules='["dashboard","streaming_subscriptions","streaming_customers","streaming_accounts","streaming_platforms","streaming_renewals","qr","settings"]'::jsonb,
       updated_at=now()
 where business_type='streaming'
   and is_default_trial=true;

create or replace function public.get_restaurant_subscription_access(p_restaurant_id bigint)
returns table(
  restaurant_id bigint,
  subscription_usable boolean,
  subscription_status text,
  plan_id bigint,
  plan_name text,
  customized boolean,
  base_modules jsonb,
  effective_modules jsonb
)
language plpgsql
stable security definer
set search_path to 'public','auth'
as $function$
declare
  r public.restaurants%rowtype;
  p public.subscription_plans%rowtype;
  v_base jsonb := '[]'::jsonb;
  v_effective jsonb := '[]'::jsonb;
  v_usable boolean := false;
  v_type text := 'restaurant';
begin
  if not (
    public.is_site_admin()
    or exists(
      select 1 from public.restaurant_staff s
      where s.restaurant_id=p_restaurant_id
        and s.user_id=auth.uid()
        and s.active=true
    )
  ) then
    raise exception 'No autorizado';
  end if;

  select * into r from public.restaurants where id=p_restaurant_id;
  if not found then raise exception 'Restaurante no encontrado'; end if;

  v_type := lower(coalesce(r.business_type,'restaurant'));
  v_usable := r.active
    and lower(coalesce(r.subscription_status,'')) in ('trial','active')
    and (r.subscription_expires_at is null or r.subscription_expires_at > now());

  if r.subscription_plan_id is not null then
    select * into p
    from public.subscription_plans
    where id=r.subscription_plan_id
      and business_type=coalesce(r.business_type,'restaurant')
    limit 1;
  elsif lower(coalesce(r.subscription_status,''))='trial'
     or lower(coalesce(r.subscription_plan,'')) like '%prueba%' then
    select * into p
    from public.subscription_plans
    where is_default_trial=true
      and business_type=coalesce(r.business_type,'restaurant')
    limit 1;
  end if;

  v_base := public.normalize_module_array(coalesce(p.modules,'[]'::jsonb));

  if coalesce(r.is_demo,false) then
    if v_type='streaming' then
      v_effective := public.normalize_module_array(
        '["dashboard","streaming_subscriptions","streaming_customers","streaming_accounts","streaming_platforms","streaming_renewals","qr","settings"]'::jsonb
      );
    elsif v_type in ('supermarket','minimarket') then
      v_effective := public.normalize_module_array(
        '["dashboard","cash","retail_orders","retail_pos","retail_products","retail_suppliers","retail_purchases","staff","qr","plans","settings"]'::jsonb
      );
    elsif v_type='professional' then
      v_effective := public.normalize_module_array(
        '["dashboard","appointments","services","professionals","clients","cash","staff","reports","qr","plans","settings"]'::jsonb
      );
    else
      v_effective := public.normalize_module_array(
        '["dashboard","orders","pos","kitchen","cash","products","categories","inventory","staff","promotions","reviews","table_qr","qr","plans","settings"]'::jsonb
      );
    end if;
    v_base := v_effective;
  elsif coalesce(r.subscription_modules_customized,false) then
    v_effective := public.normalize_module_array(coalesce(r.subscription_module_overrides,'[]'::jsonb));
  else
    v_effective := v_base;
  end if;

  if not v_usable then v_effective := '[]'::jsonb; end if;

  return query
  select r.id,v_usable,r.subscription_status,coalesce(r.subscription_plan_id,p.id),
         coalesce(p.name,r.subscription_plan),coalesce(r.subscription_modules_customized,false),
         v_base,v_effective;
end;
$function$;
