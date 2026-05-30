-- Run this in your Supabase SQL Editor to set up Student features

-- 1. Add 'student' to the user_role enum
alter type public.user_role add value if not exists 'student';

-- 2. Add columns to profiles
alter table public.profiles add column if not exists surname text;
alter table public.profiles add column if not exists grade text;

-- 3. Change default role for new users
alter table public.profiles alter column role set default 'student';

-- 4. Update the trigger to capture student info and school_id automatically on registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, school_id, name, surname, grade)
  values (
    new.id, 
    'student', 
    nullif(new.raw_user_meta_data->>'school_id', '')::uuid,
    coalesce(new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'full_name', '')),
    coalesce(new.raw_user_meta_data->>'surname', ''),
    coalesce(new.raw_user_meta_data->>'grade', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Add student_id to tickets
alter table public.tickets add column if not exists student_id uuid references public.profiles(id) on delete cascade;

-- 6. Student RLS Policies

-- Allow students to update their own profile
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());

-- Allow students to view events for their school
create policy "Students can view their school events" on public.events for select using (
  school_id = (select school_id from public.profiles where id = auth.uid())
);

-- Allow students to view their own tickets
create policy "Students can view own tickets" on public.tickets for select using (
  student_id = auth.uid()
);
