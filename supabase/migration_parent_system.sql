-- Parent Dashboard System Migration
-- This file contains the SQL changes needed to convert from student-based to parent-based system

-- 1. Update user_role enum to include 'parent'
-- Note: In Supabase, you may need to:
-- 1. Create new enum type
-- 2. Alter columns to use new type
-- Here's the safe way to do it:

-- First check if 'parent' already exists, if not add it
DO $$ BEGIN
  BEGIN
    ALTER TYPE user_role ADD VALUE 'parent' BEFORE 'user';
  EXCEPTION WHEN duplicate_object THEN
    -- Value already exists, continue
    NULL;
  END;
END $$;

-- 2. Add phone field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 3. Create students table (children registered by parents)
CREATE TABLE IF NOT EXISTS public.students (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references auth.users(id) on delete cascade not null,
  school_id uuid references public.schools(id) on delete cascade not null,
  name text not null,
  grade text not null,
  created_at timestamp with time zone default now()
);

-- 4. Update tickets table to include parent and student references
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS student_id uuid references public.students(id) on delete set null,
  ADD COLUMN IF NOT EXISTS parent_id uuid references auth.users(id) on delete cascade;

-- 5. Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for students table

-- Parents can view their own children
CREATE POLICY "Parents can view their children" ON public.students
  FOR SELECT
  USING (parent_id = auth.uid());

-- Schools can view students in their school
CREATE POLICY "Schools can view students in their school" ON public.students
  FOR SELECT
  USING (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'school' and p.school_id = students.school_id
    )
  );

-- Parents can insert students (their children)
CREATE POLICY "Parents can add students" ON public.students
  FOR INSERT
  WITH CHECK (
    parent_id = auth.uid() and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

-- Parents can update their own children
CREATE POLICY "Parents can update their children" ON public.students
  FOR UPDATE
  USING (parent_id = auth.uid());

-- Parents can delete their own children
CREATE POLICY "Parents can delete their children" ON public.students
  FOR DELETE
  USING (parent_id = auth.uid());

-- Admin can do all on students
CREATE POLICY "Admin can all on students" ON public.students
  FOR ALL
  USING (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. Update tickets table RLS policies

-- Drop old "Users can view own tickets" policy if it exists
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;

-- Add new parent-based ticket policies
CREATE POLICY "Parents can view their tickets" ON public.tickets
  FOR SELECT
  USING (parent_id = auth.uid());

-- Schools can view tickets for their events (already exists but ensure it's there)
-- CREATE POLICY "Schools can view tickets for their events" ON public.tickets
--   FOR SELECT
--   USING (
--     exists (
--       select 1 from public.events e
--       join public.profiles p on p.school_id = e.school_id
--       where e.id = tickets.event_id and p.id = auth.uid()
--     )
--   );

-- 8. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_tickets_parent_id ON public.tickets(parent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_student_id ON public.tickets(student_id);

-- 9. Verify the changes
-- Run these queries to verify everything is set up correctly:
-- SELECT * FROM information_schema.tables WHERE table_name = 'students';
-- SELECT * FROM pg_policies WHERE tablename = 'students';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone';

