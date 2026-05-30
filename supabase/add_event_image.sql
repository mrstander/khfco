-- Run this in your Supabase SQL Editor to add image support

-- 1. Add image_url column to events table
alter table public.events add column if not exists image_url text;

-- 2. Create the storage bucket for event images (requires storage schema privileges, usually fine in SQL editor)
insert into storage.buckets (id, name, public) 
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- 3. Set up Storage RLS Policies
-- Allow public to read images
create policy "Public can view event images" on storage.objects for select using ( bucket_id = 'event-images' );

-- Allow authenticated users to upload images
create policy "Schools can upload event images" on storage.objects for insert with check ( bucket_id = 'event-images' and auth.role() = 'authenticated' );
