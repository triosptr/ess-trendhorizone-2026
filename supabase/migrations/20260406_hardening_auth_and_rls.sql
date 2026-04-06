create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  insert into public.profiles (
    id,
    full_name,
    email,
    employee_id,
    department,
    position,
    phone,
    address,
    join_date,
    role,
    status
  )
  values (
    new.id,
    coalesce(meta->>'full_name', ''),
    coalesce(new.email, meta->>'email', ''),
    coalesce(meta->>'employee_id', ''),
    coalesce(meta->>'department', ''),
    coalesce(meta->>'position', ''),
    coalesce(meta->>'phone', ''),
    coalesce(meta->>'address', ''),
    coalesce(nullif(meta->>'join_date', '')::date, now()::date),
    'employee',
    'active'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    employee_id = excluded.employee_id,
    department = excluded.department,
    position = excluded.position,
    phone = excluded.phone,
    address = excluded.address,
    join_date = excluded.join_date,
    updated_at = now();

  return new;
end;
$$;

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (id = auth.uid() and role = 'employee' and status = 'active');

drop policy if exists "profiles_update_self_or_superadmin" on public.profiles;
create policy "profiles_update_self_or_superadmin"
on public.profiles
for update
using (id = auth.uid() or public.current_role() = 'superadmin')
with check (
  public.current_role() = 'superadmin'
  or (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid())
  )
);
