-- ============================================================================
-- Sandryne Boutique — blog engine (posts + "Shop the Look" product tagging)
-- Run after 001_init.sql (reuses private.is_admin()).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- POSTS
-- ----------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);

alter table public.posts enable row level security;

create policy "Published posts are publicly readable"
  on public.posts for select
  using (published = true);

create policy "Admins can view all posts"
  on public.posts for select
  using (private.is_admin());

create policy "Admins can insert posts"
  on public.posts for insert
  with check (private.is_admin());

create policy "Admins can update posts"
  on public.posts for update
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete posts"
  on public.posts for delete
  using (private.is_admin());

-- Keep updated_at fresh on edits.
create or replace function private.touch_post_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function private.touch_post_updated_at();

-- ----------------------------------------------------------------------------
-- POST_PRODUCTS — "Shop the Look" tagging (many-to-many)
-- ----------------------------------------------------------------------------
create table public.post_products (
  post_id uuid not null references public.posts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  position integer not null default 0,
  primary key (post_id, product_id)
);

create index post_products_product_id_idx on public.post_products (product_id);

alter table public.post_products enable row level security;

create policy "Post products are publicly readable"
  on public.post_products for select
  using (true);

create policy "Admins can insert post products"
  on public.post_products for insert
  with check (private.is_admin());

create policy "Admins can update post products"
  on public.post_products for update
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete post products"
  on public.post_products for delete
  using (private.is_admin());

-- ----------------------------------------------------------------------------
-- SEED — three SEO-oriented journal posts tagged to seeded products
-- ----------------------------------------------------------------------------
insert into public.posts (title, slug, excerpt, content, cover_image, published, published_at)
values
  (
    'How to Style a Silk Slip Dress: Day to Night',
    'how-to-style-a-silk-slip-dress',
    'From weekend brunch to evening cocktails — five effortless ways to wear the season''s most versatile dress.',
    E'The silk slip dress is the quiet workhorse of an elevated wardrobe. Bias-cut and fluid, it moves with you — and with the right styling, it moves from morning coffee to midnight without missing a beat.\n\n## Daytime: layer it down\n\nThrow an oversized poplin shirt over your slip dress, unbuttoned and sleeves rolled. The crisp cotton against liquid silk is the kind of contrast that reads intentional, not accidental. Finish with flat sandals and a woven leather belt to define the waist.\n\n## Golden hour: add polish\n\nSwap the shirt for sculptural gold jewelry. A substantial curb chain and organic hoops catch the light exactly where you want it — at the neckline and the jaw. Keep the rest minimal.\n\n## Evening: let it stand alone\n\nAt night, the slip dress needs almost nothing. A heeled sandal, a swipe of something on the lips, and the confidence of a piece that was cut to skim, not cling.\n\n## Care notes\n\nWashable silk means this is not a precious piece. Cold gentle cycle, lay flat to dry, and it will age like a good decision.',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
    true,
    now() - interval '14 days'
  ),
  (
    'The Capsule Wardrobe Edit: 10 Pieces, 30 Outfits',
    'capsule-wardrobe-edit',
    'Our guide to building a capsule wardrobe around timeless silhouettes — fewer, better pieces that work harder.',
    E'A capsule wardrobe is not about deprivation. It is about removing the noise so the good pieces can speak.\n\n## Start with the foundation\n\nEvery capsule begins with the quiet essentials: a ribbed knit tank in bone, a perfect white poplin shirt, and vintage straight denim. These three alone give you a week of looks.\n\n## Add the columns\n\nA linen column dress and a high-rise wide leg trouser bring architecture to the mix. Both are shapes that flatter without effort and pair with everything above.\n\n## The finishing layer\n\nAccessories are where a capsule earns its keep. A silk twill scarf works at the neck, in the hair, or knotted on a bag — three accessories in one. A woven leather belt sharpens every silhouette it touches.\n\n## The math\n\nTen considered pieces, honestly mixed, yield thirty distinct outfits. That is not minimalism for its own sake — that is a wardrobe that respects your morning.',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop',
    true,
    now() - interval '7 days'
  ),
  (
    'Summer ''26 Trend Report: Elevated Ease',
    'summer-26-trend-report',
    'The silhouettes, fabrics, and details defining the season — and how to wear them your way.',
    E'This season''s mood is ease with intention. Nothing fussy, nothing forced — just fabrics that breathe and lines that flatter.\n\n## Fluid midis\n\nThe midi dress continues its reign, this year in breathable crepe with softly draped necklines. It is the one-and-done answer to every summer invitation.\n\n## Sculpted movement\n\nActive wear has left the gym for good. Seamless leggings and longline bras in tonal neutrals — black, mocha, sage — layer under open shirts and oversized knits for a look that moves.\n\n## Gold, worn daily\n\nJewelry is trending substantial but not loud: curb chains in gold vermeil, hand-finished hoops with organic curves. Pieces you put on in June and take off in September.\n\n## The takeaway\n\nBuy less, choose well, and let the cut do the talking. Summer ''26 rewards the wardrobe that was built, not bought.',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
    true,
    now() - interval '2 days'
  );

-- Tag products to posts ("Shop the Look")
insert into public.post_products (post_id, product_id, position)
select p.id, pr.id, tag.position
from public.posts p
join lateral (
  values
    ('how-to-style-a-silk-slip-dress', 'silk-slip-dress', 0),
    ('how-to-style-a-silk-slip-dress', 'oversized-poplin-shirt', 1),
    ('how-to-style-a-silk-slip-dress', 'gold-vermeil-chain-necklace', 2),
    ('how-to-style-a-silk-slip-dress', 'woven-leather-belt', 3),
    ('capsule-wardrobe-edit', 'ribbed-knit-tank', 0),
    ('capsule-wardrobe-edit', 'vintage-straight-denim', 1),
    ('capsule-wardrobe-edit', 'linen-column-dress', 2),
    ('capsule-wardrobe-edit', 'high-rise-wide-leg-trouser', 3),
    ('capsule-wardrobe-edit', 'silk-twill-scarf', 4),
    ('summer-26-trend-report', 'solstice-midi-dress', 0),
    ('summer-26-trend-report', 'sculpt-seamless-legging', 1),
    ('summer-26-trend-report', 'align-longline-bra', 2),
    ('summer-26-trend-report', 'sculptural-hoop-earrings', 3)
) as tag(post_slug, product_slug, position)
  on tag.post_slug = p.slug
join public.products pr on pr.slug = tag.product_slug;
