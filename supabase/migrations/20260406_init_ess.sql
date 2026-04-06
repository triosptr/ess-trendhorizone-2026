create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  employee_id text not null unique,
  department text not null,
  position text not null,
  phone text not null,
  address text not null,
  join_date date not null,
  role text not null default 'employee' check (role in ('superadmin', 'employee')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  face_descriptor jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_type text not null check (check_type in ('check_in', 'check_out')),
  captured_at timestamptz not null default now(),
  confidence_score numeric(8,6) not null,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.attendance_logs enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop policy if exists "profiles_select_self_or_superadmin" on public.profiles;
create policy "profiles_select_self_or_superadmin"
on public.profiles
for select
using (id = auth.uid() or public.current_role() = 'superadmin');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_superadmin" on public.profiles;
create policy "profiles_update_self_or_superadmin"
on public.profiles
for update
using (id = auth.uid() or public.current_role() = 'superadmin')
with check (id = auth.uid() or public.current_role() = 'superadmin');

drop policy if exists "attendance_select_self_or_superadmin" on public.attendance_logs;
create policy "attendance_select_self_or_superadmin"
on public.attendance_logs
for select
using (user_id = auth.uid() or public.current_role() = 'superadmin');

drop policy if exists "attendance_insert_self" on public.attendance_logs;
create policy "attendance_insert_self"
on public.attendance_logs
for insert
with check (user_id = auth.uid());
