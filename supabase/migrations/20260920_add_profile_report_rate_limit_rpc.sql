create or replace function public.lfs_reserve_profile_report_slot(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hourly_count integer;
  daily_count integer;
begin
  if p_fingerprint is null or length(trim(p_fingerprint)) < 16 then
    raise exception 'Invalid rate-limit fingerprint';
  end if;

  delete from public.lfs_profile_report_rate_limits
  where created_at < now() - interval '7 days';

  select
    count(*) filter (where created_at >= now() - interval '1 hour'),
    count(*) filter (where created_at >= now() - interval '24 hours')
  into hourly_count, daily_count
  from public.lfs_profile_report_rate_limits
  where fingerprint = p_fingerprint;

  if hourly_count >= 8 or daily_count >= 30 then
    return false;
  end if;

  insert into public.lfs_profile_report_rate_limits (fingerprint)
  values (p_fingerprint);

  return true;
end;
$$;

revoke all on function public.lfs_reserve_profile_report_slot(text) from public;
grant execute on function public.lfs_reserve_profile_report_slot(text) to anon, authenticated, service_role;
