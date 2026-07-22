-- Heartland Retail linkage: products map to Retail items; orders track sales-order sync.
-- Heartland Retail is the inventory source of truth; inventory_count is a mirror.

alter table public.products
  add column if not exists heartland_item_id bigint unique,
  add column if not exists heartland_public_id text;

create index if not exists products_heartland_item_id_idx
  on public.products (heartland_item_id)
  where heartland_item_id is not null;

alter table public.orders
  add column if not exists heartland_sales_order_id bigint,
  add column if not exists heartland_sync_status text
    check (heartland_sync_status is null or heartland_sync_status in ('pending', 'synced', 'failed'));

comment on column public.products.heartland_item_id is
  'Heartland Retail internal item id (GET /api/items/{id}). Required for online sales sync.';
comment on column public.products.heartland_public_id is
  'Heartland Retail Item # / public_id — match to Shopify SKU for native inventory sync.';
comment on column public.orders.heartland_sales_order_id is
  'Heartland Retail sales order id created after Portico charge.';
comment on column public.orders.heartland_sync_status is
  'pending | synced | failed — Retail sales-order sync after payment.';
