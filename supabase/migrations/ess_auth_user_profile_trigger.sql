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

drop trigger if exists trg_auth_user_profile on auth.users;
create trigger trg_auth_user_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();
