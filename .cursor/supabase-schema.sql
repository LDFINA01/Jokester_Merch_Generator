-- Supabase Schema for Jokester Merch Generator V0
-- Run this in your Supabase SQL Editor to set up the database

-- Create uploads table
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  original_image_url text not null,
  mockup_urls jsonb not null,
  user_identifier text
);

-- Add index for faster queries
create index if not exists uploads_created_at_idx on public.uploads (created_at desc);
create index if not exists uploads_user_identifier_idx on public.uploads (user_identifier);

-- Enable Row Level Security (RLS)
alter table public.uploads enable row level security;

-- Create policy to allow all operations for now (V0 - no auth)
-- Note: In production, you should restrict this based on user authentication
create policy "Allow all operations for V0"
  on public.uploads
  for all
  using (true)
  with check (true);

-- Example mockup_urls JSONB structure:
-- {
--   "mug": "https://files.cdn.printful.com/...",
--   "shirt": "https://files.cdn.printful.com/...",
--   "blanket": "https://files.cdn.printful.com/..."
-- }

-- Query examples:
-- Get all uploads: SELECT * FROM uploads ORDER BY created_at DESC;
-- Get specific user's uploads: SELECT * FROM uploads WHERE user_identifier = 'user123';
-- Get mockup URLs: SELECT mockup_urls->>'mug' as mug_url FROM uploads WHERE id = 'uuid';

