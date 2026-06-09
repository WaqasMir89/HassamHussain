-- ============================================================
--  Hassam Hussain Jafri — Portfolio backend schema (Supabase)
--  Run this once in:  Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Projects table -----------------------------------------
create table if not exists public.projects (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    slug         text,
    category     text default 'other',
    summary      text,
    description  text,
    software     text,
    role         text,
    year         text,
    cover_image  text,
    images       jsonb default '[]'::jsonb,   -- array of public image URLs
    sort_order   int  default 0,
    created_at   timestamptz default now()
);

-- 2) Row Level Security -------------------------------------
alter table public.projects enable row level security;

-- Anyone (the public website) can READ projects.
drop policy if exists "public read projects" on public.projects;
create policy "public read projects"
    on public.projects for select
    using ( true );

-- Only signed-in users (you) can ADD / EDIT / DELETE.
drop policy if exists "auth write projects" on public.projects;
create policy "auth write projects"
    on public.projects for all
    to authenticated
    using ( true )
    with check ( true );

-- 3) Storage bucket for images ------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Public can VIEW images; signed-in users can UPLOAD / DELETE.
drop policy if exists "public read images" on storage.objects;
create policy "public read images"
    on storage.objects for select
    using ( bucket_id = 'project-images' );

drop policy if exists "auth upload images" on storage.objects;
create policy "auth upload images"
    on storage.objects for insert
    to authenticated
    with check ( bucket_id = 'project-images' );

drop policy if exists "auth update images" on storage.objects;
create policy "auth update images"
    on storage.objects for update
    to authenticated
    using ( bucket_id = 'project-images' );

drop policy if exists "auth delete images" on storage.objects;
create policy "auth delete images"
    on storage.objects for delete
    to authenticated
    using ( bucket_id = 'project-images' );

-- Done! Now create your login user under Authentication → Users.
