-- Run this in your Supabase SQL Editor to fix the infinite recursion

-- 1. Drop the problematic policy
drop policy if exists "Admin can read all profiles" on public.profiles;

-- 2. Create a security definer function to securely check if a user is an admin 
-- (This bypasses RLS temporarily just for the check, preventing infinite loops!)
create or replace function public.is_admin()
returns boolean as $$
declare
  current_role public.user_role;
begin
  select role into current_role from public.profiles where id = auth.uid();
  return coalesce(current_role = 'admin', false);
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Re-create the admin policy using the safe function
create policy "Admin can read all profiles" on public.profiles for all using (public.is_admin());
