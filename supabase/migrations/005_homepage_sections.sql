-- ============================================================================
-- Homepage curated sections — admin-managed product rails for the storefront.
-- Run in Supabase SQL Editor after 001–004.
-- ============================================================================

create table if not exists public.homepage_sections (
  id text primary key,
  label text not null,
  title text not null,
  subtitle text not null default '',
  cta_label text not null default 'Explore all',
  cta_href text not null default '/shop',
  product_ids uuid[] not null default '{}',
  max_items integer not null default 8 check (max_items > 0 and max_items <= 24),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.homepage_sections enable row level security;

create policy "Homepage sections are publicly readable"
  on public.homepage_sections for select
  using (true);

create policy "Admins can insert homepage sections"
  on public.homepage_sections for insert
  with check (private.is_admin());

create policy "Admins can update homepage sections"
  on public.homepage_sections for update
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete homepage sections"
  on public.homepage_sections for delete
  using (private.is_admin());

insert into public.homepage_sections (
  id, label, title, subtitle, cta_label, cta_href, product_ids, max_items, enabled, sort_order
) values
  (
    'featured_carousel',
    'Featured carousel',
    'Fresh Summer Picks',
    'A rotating selection of elevated essentials.',
    'Explore all',
    '/shop?category=new-arrivals',
    '{}',
    8,
    true,
    10
  ),
  (
    'new_arrivals',
    'New arrivals grid',
    'New Arrivals',
    'Just In',
    'Explore all',
    '/shop?category=new-arrivals',
    '{}',
    8,
    true,
    20
  )
on conflict (id) do nothing;
