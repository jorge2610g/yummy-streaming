-- Streaming es un producto digital: Delivery siempre queda deshabilitado.
-- Aplicado primero en Staging y versionado para la promoción controlada a Producción.

create or replace function public.enforce_streaming_no_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.business_type,''))='streaming' then
    new.delivery_enabled := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_streaming_no_delivery on public.restaurants;
create trigger trg_enforce_streaming_no_delivery
  before insert or update of business_type, delivery_enabled
  on public.restaurants
  for each row
  execute function public.enforce_streaming_no_delivery();

update public.restaurants
   set delivery_enabled=false,
       updated_at=now()
 where business_type='streaming'
   and delivery_enabled is distinct from false;
