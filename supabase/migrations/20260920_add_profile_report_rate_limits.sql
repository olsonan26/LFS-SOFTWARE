create table if not exists public.lfs_profile_report_rate_limits (
  id bigint generated always as identity primary key,
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists lfs_profile_report_rate_limits_fingerprint_created_idx
  on public.lfs_profile_report_rate_limits (fingerprint, created_at desc);

alter table public.lfs_profile_report_rate_limits enable row level security;

revoke all on table public.lfs_profile_report_rate_limits from anon, authenticated;
