-- ============================================================================
-- Sandryne Boutique — initial schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Includes: profiles, products, orders, newsletter_subscribers,
--           RLS policies, auth trigger, inventory RPC, storage bucket.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Private schema for helper functions (kept out of the exposed `public` schema)
-- ----------------------------------------------------------------------------
create schema if not exists private;

-- ----------------------------------------------------------------------------
-- PROFILES — extends auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: is the current user an admin?
-- SECURITY DEFINER so it can read profiles without recursive RLS evaluation.
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Auto-create a profile row when a user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (private.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (private.is_admin())
  with check (private.is_admin());

-- Prevent non-admins from changing roles: column-level privileges.
revoke update on public.profiles from authenticated;
grant update (full_name, email) on public.profiles to authenticated;

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  images text[] not null default '{}',
  inventory_count integer not null default 0 check (inventory_count >= 0),
  category text not null check (category in ('bottoms', 'dresses', 'accessories-jewelry', 'tops', 'active-wear')),
  slug text not null unique,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  is_new boolean not null default false,
  on_sale boolean not null default false,
  sale_price numeric(10, 2) check (sale_price is null or sale_price >= 0),
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (private.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (private.is_admin());

-- ----------------------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  heartland_transaction_id text,
  shipping_address jsonb not null,
  items jsonb not null,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Customers can only view their own orders. Order creation happens
-- server-side with the service role key (bypasses RLS) at checkout.
create policy "Customers can view their own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (private.is_admin());

create policy "Admins can update orders"
  on public.orders for update
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete orders"
  on public.orders for delete
  using (private.is_admin());

-- ----------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS
-- ----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  using (private.is_admin());
-- Inserts happen server-side via the service role (bypasses RLS).

-- ----------------------------------------------------------------------------
-- INVENTORY RPC — atomic decrement used by checkout (service role only)
-- ----------------------------------------------------------------------------
create or replace function public.decrement_inventory(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.products
  set inventory_count = inventory_count - p_quantity
  where id = p_product_id and inventory_count >= p_quantity;

  if not found then
    raise exception 'Insufficient inventory for product %', p_product_id;
  end if;
end;
$$;

revoke execute on function public.decrement_inventory(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_inventory(uuid, integer) to service_role;

-- ----------------------------------------------------------------------------
-- STORAGE — product images bucket (public read, admin write)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and private.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and private.is_admin())
  with check (bucket_id = 'product-images' and private.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and private.is_admin());

-- ============================================================================
-- To promote a user to admin after they sign up:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================
