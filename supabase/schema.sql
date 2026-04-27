create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_leads (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  company text not null,
  niche text not null,
  interest text not null,
  source text not null,
  status text not null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  next_meeting jsonb
);

create table if not exists public.crm_lead_timeline (
  id text primary key,
  lead_id text not null references public.crm_leads(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_leads_owner_idx on public.crm_leads(owner_user_id);
create index if not exists crm_leads_updated_idx on public.crm_leads(updated_at desc);
create index if not exists crm_timeline_lead_idx on public.crm_lead_timeline(lead_id, created_at desc);
create index if not exists profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_lead_timeline enable row level security;

create or replace function public.handle_profile_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_timestamp on public.profiles;
create trigger profiles_set_timestamp
before update on public.profiles
for each row
execute function public.handle_profile_timestamp();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "leads_select_owner_or_admin" on public.crm_leads;
create policy "leads_select_owner_or_admin"
on public.crm_leads
for select
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "leads_insert_owner_or_admin" on public.crm_leads;
create policy "leads_insert_owner_or_admin"
on public.crm_leads
for insert
to authenticated
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "leads_update_owner_or_admin" on public.crm_leads;
create policy "leads_update_owner_or_admin"
on public.crm_leads
for update
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "leads_delete_owner_or_admin" on public.crm_leads;
create policy "leads_delete_owner_or_admin"
on public.crm_leads
for delete
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "timeline_select_owner_or_admin" on public.crm_lead_timeline;
create policy "timeline_select_owner_or_admin"
on public.crm_lead_timeline
for select
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "timeline_insert_owner_or_admin" on public.crm_lead_timeline;
create policy "timeline_insert_owner_or_admin"
on public.crm_lead_timeline
for insert
to authenticated
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "timeline_update_owner_or_admin" on public.crm_lead_timeline;
create policy "timeline_update_owner_or_admin"
on public.crm_lead_timeline
for update
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "timeline_delete_owner_or_admin" on public.crm_lead_timeline;
create policy "timeline_delete_owner_or_admin"
on public.crm_lead_timeline
for delete
to authenticated
using (
  auth.uid() = owner_user_id
  or exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);
