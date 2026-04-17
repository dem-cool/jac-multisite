-- M01 Schema: dealers, posts, press_notes, carousel_slides, promos, forms, submissions

-- Tables

create table public.dealers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact_json jsonb default '{}'::jsonb,
  footer_json jsonb default '{}'::jsonb,
  tracking_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  title text not null,
  slug text not null,
  body text,
  cover_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  unique(dealer_id, slug)
);

create table public.press_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text,
  cover_url text,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  image_url text not null,
  headline text,
  link text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.promos (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  title text not null,
  slug text not null,
  hero_url text,
  body text,
  active bool not null default true,
  created_at timestamptz default now(),
  unique(dealer_id, slug)
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  name text not null,
  recipient_email text not null,
  fields_json jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  data_json jsonb default '{}'::jsonb,
  sent_at timestamptz,
  error text,
  created_at timestamptz default now()
);

-- Enable RLS on all tables

alter table public.dealers enable row level security;
alter table public.posts enable row level security;
alter table public.press_notes enable row level security;
alter table public.carousel_slides enable row level security;
alter table public.promos enable row level security;
alter table public.forms enable row level security;
alter table public.submissions enable row level security;

-- RLS policies

-- dealers: superadmin full access
create policy "superadmin_all_dealers" on public.dealers
  for all using ((auth.jwt() ->> 'role') = 'superadmin');

-- posts: dealer_admin all operations
create policy "dealer_admin_all_posts" on public.posts
  for all using (dealer_id = (auth.jwt() ->> 'dealer_id')::uuid);

-- press_notes: public read, superadmin write
create policy "public_read_press_notes" on public.press_notes
  for select using (true);

create policy "superadmin_write_press_notes" on public.press_notes
  for all using ((auth.jwt() ->> 'role') = 'superadmin');

-- carousel_slides: dealer_admin all operations
create policy "dealer_admin_all_carousel_slides" on public.carousel_slides
  for all using (dealer_id = (auth.jwt() ->> 'dealer_id')::uuid);

-- promos: dealer_admin all operations
create policy "dealer_admin_all_promos" on public.promos
  for all using (dealer_id = (auth.jwt() ->> 'dealer_id')::uuid);

-- forms: dealer_admin all operations
create policy "dealer_admin_all_forms" on public.forms
  for all using (dealer_id = (auth.jwt() ->> 'dealer_id')::uuid);

-- submissions: anon insert, dealer_admin read
create policy "anon_insert_submissions" on public.submissions
  for insert with check (true);

create policy "dealer_admin_read_submissions" on public.submissions
  for select using (dealer_id = (auth.jwt() ->> 'dealer_id')::uuid);

-- Storage bucket

insert into storage.buckets (id, name, public)
values ('dealer-media', 'dealer-media', false)
on conflict (id) do nothing;

create policy "dealer_media_upload" on storage.objects
  for insert with check (
    bucket_id = 'dealer-media'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'dealer_id')
  );

create policy "dealer_media_read_own" on storage.objects
  for select using (
    bucket_id = 'dealer-media'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'dealer_id')
  );

create policy "dealer_media_delete_own" on storage.objects
  for delete using (
    bucket_id = 'dealer-media'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'dealer_id')
  );
