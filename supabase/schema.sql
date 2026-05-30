-- =====================================================
-- REMOVE OLD TRIGGER SYSTEM
-- =====================================================

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user cascade;

-- =====================================================
-- REMOVE OLD STUDENT PROFILE COLUMNS
-- =====================================================

alter table public.profiles
drop column if exists surname;

alter table public.profiles
drop column if exists grade;

-- =====================================================
-- FIX ROLE DEFAULT
-- =====================================================

alter table public.profiles
alter column role set default 'parent';

-- =====================================================
-- REMOVE INVALID student_id FK FROM PROFILES
-- =====================================================

-- Remove incorrect FK if it references profiles
alter table public.tickets
drop constraint if exists tickets_student_id_fkey;

-- =====================================================
-- RECREATE CORRECT student_id FK
-- =====================================================

alter table public.tickets
add constraint tickets_student_id_fkey
foreign key (student_id)
references public.students(id)
on delete cascade;

-- =====================================================
-- REMOVE OLD STUDENT POLICIES
-- =====================================================

drop policy if exists "Students can view their school events" on public.events;

drop policy if exists "Students can view own tickets" on public.tickets;

-- =====================================================
-- CREATE CORRECT PARENT POLICIES
-- =====================================================

-- Parents can view their own students
drop policy if exists "Parents view own students" on public.students;

create policy "Parents view own students"
on public.students
for select
using (
  parent_id = auth.uid()
);

-- Parents can create students
drop policy if exists "Parents create own students" on public.students;

create policy "Parents create own students"
on public.students
for insert
with check (
  parent_id = auth.uid()
);

-- Parents can update own students
drop policy if exists "Parents update own students" on public.students;

create policy "Parents update own students"
on public.students
for update
using (
  parent_id = auth.uid()
);

-- Parents can delete own students
drop policy if exists "Parents delete own students" on public.students;

create policy "Parents delete own students"
on public.students
for delete
using (
  parent_id = auth.uid()
);

-- =====================================================
-- SCHOOL ACCESS TO STUDENTS
-- =====================================================

drop policy if exists "Schools view school students" on public.students;

create policy "Schools view school students"
on public.students
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
    and p.school_id = students.school_id
    and p.role = 'school'
  )
);

-- =====================================================
-- PARENT TICKET ACCESS
-- =====================================================

drop policy if exists "Parents view own tickets" on public.tickets;

create policy "Parents view own tickets"
on public.tickets
for select
using (
  parent_id = auth.uid()
);

-- =====================================================
-- SCHOOL TICKET ACCESS
-- =====================================================

drop policy if exists "Schools can view tickets for their events" on public.tickets;

create policy "Schools can view tickets for their events"
on public.tickets
for select
using (
  exists (
    select 1
    from public.events e
    join public.profiles p
      on p.school_id = e.school_id
    where e.id = tickets.event_id
    and p.id = auth.uid()
    and p.role = 'school'
  )
);

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================