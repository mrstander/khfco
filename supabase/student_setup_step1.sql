-- STEP 1: Run this FIRST, by itself. Then wait a moment and run Step 2.
-- This must be committed before the new enum value can be used.

alter type public.user_role add value if not exists 'student';
