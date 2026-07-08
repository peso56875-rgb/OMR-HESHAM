-- Launch readiness hardening and CMS foundations.
-- Non-destructive: adds columns/tables and tightens overly broad public write policies.

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Keep trigger/helper functions out of public RPC access.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute 'revoke execute on function public.is_admin() from public, anon, authenticated';
  end if;
end $$;

-- Content publishing fields.
alter table public.campaigns
  add column if not exists slug text,
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now()),
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists beneficiaries_count integer not null default 0,
  add column if not exists sort_order integer not null default 0;

alter table public.news
  add column if not exists slug text,
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.events
  add column if not exists slug text,
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.stories
  add column if not exists slug text,
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.jobs
  add column if not exists slug text,
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

-- Donation workflow fields.
alter table public.donations
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists receipt_number text,
  add column if not exists verified_at timestamptz,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

-- Shared operational tables.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  report_type text not null default 'financial',
  period_label text,
  file_url text,
  summary text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'public-assets',
  path text not null,
  alt text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.site_settings enable row level security;
alter table public.reports enable row level security;
alter table public.media enable row level security;
alter table public.audit_logs enable row level security;

create unique index if not exists campaigns_slug_key on public.campaigns(slug) where slug is not null;
create unique index if not exists news_slug_key on public.news(slug) where slug is not null;
create unique index if not exists events_slug_key on public.events(slug) where slug is not null;
create unique index if not exists stories_slug_key on public.stories(slug) where slug is not null;
create unique index if not exists jobs_slug_key on public.jobs(slug) where slug is not null;
create unique index if not exists donations_receipt_number_key on public.donations(receipt_number) where receipt_number is not null;
create index if not exists donations_payment_reference_idx on public.donations(payment_reference) where payment_reference is not null;
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_table, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['campaigns','news','events','stories','jobs','donations','site_settings','reports']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Replace dangerous public content insertion policies.
drop policy if exists "Allow anon insert to campaigns" on public.campaigns;
drop policy if exists "Allow anon insert to news" on public.news;
drop policy if exists "Allow anon insert to events" on public.events;
drop policy if exists "Allow anon insert to jobs" on public.jobs;
drop policy if exists "Allow anon insert to stories" on public.stories;

drop policy if exists "Admins can manage campaigns" on public.campaigns;
drop policy if exists "Admins can manage news" on public.news;
drop policy if exists "Admins can manage events" on public.events;
drop policy if exists "Admins can manage stories" on public.stories;
drop policy if exists "Admins can manage jobs" on public.jobs;
drop policy if exists "Admins can manage donations" on public.donations;
drop policy if exists "Admins can manage volunteers" on public.volunteers;
drop policy if exists "Admins can manage contacts" on public.contacts;
drop policy if exists "Admins can manage job applications" on public.job_applications;
drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Donations are viewable by everyone" on public.donations;
drop policy if exists "Users can view own donations" on public.donations;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

create policy "Admins can manage campaigns" on public.campaigns for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage news" on public.news for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage events" on public.events for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage stories" on public.stories for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage jobs" on public.jobs for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage donations" on public.donations for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage volunteers" on public.volunteers for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage contacts" on public.contacts for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage job applications" on public.job_applications for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage profiles" on public.profiles for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can view own donations" on public.donations for select to authenticated using ((select auth.uid()) = profile_id);

-- Tightened public submission policies: still allow forms, but require meaningful fields.
drop policy if exists "Users can insert their own donations or guests" on public.donations;
create policy "Public can submit pending donations" on public.donations
for insert to anon, authenticated
with check (
  amount > 0
  and length(trim(donor_name)) >= 2
  and length(trim(donor_phone)) >= 8
  and coalesce(status, 'pending') = 'pending'
  and coalesce(payment_status, 'pending') = 'pending'
);

drop policy if exists "Anyone can submit volunteer application" on public.volunteers;
create policy "Public can submit volunteer applications" on public.volunteers
for insert to anon, authenticated
with check (
  length(trim(full_name)) >= 2
  and length(trim(phone)) >= 8
  and coalesce(status, 'pending') = 'pending'
);

drop policy if exists "Anyone can submit a contact message" on public.contacts;
create policy "Public can submit contact messages" on public.contacts
for insert to anon, authenticated
with check (
  length(trim(name)) >= 2
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(message)) >= 5
  and coalesce(status, 'unread') = 'unread'
);

drop policy if exists "Anyone can submit job applications" on public.job_applications;
create policy "Public can submit job applications" on public.job_applications
for insert to anon, authenticated
with check (
  length(trim(full_name)) >= 2
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(phone)) >= 8
  and coalesce(status, 'pending') = 'pending'
);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter" on public.newsletter_subscribers
for insert to anon, authenticated
with check (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and coalesce(status, 'active') in ('active', 'subscribed')
);

create policy "Published reports are viewable by everyone" on public.reports for select to anon, authenticated using (is_published = true);
create policy "Admins can manage reports" on public.reports for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Public media is viewable by everyone" on public.media for select to anon, authenticated using (bucket = 'public-assets');
create policy "Admins can manage media" on public.media for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage site settings" on public.site_settings for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins can read audit logs" on public.audit_logs for select to authenticated using (private.is_admin());
create policy "Admins can insert audit logs" on public.audit_logs for insert to authenticated with check (private.is_admin());

insert into public.site_settings (key, value, description)
values
  ('donation_methods', '{"bank_account":"10010397596901014","wallet_phone":"01060920249"}', 'Public donation account and wallet information'),
  ('organization_profile', '{"name":"مؤسسة الدكتور عمر هشام الخيرية","area":"كفر العنانبة","country":"Egypt"}', 'Public organization profile')
on conflict (key) do nothing;
