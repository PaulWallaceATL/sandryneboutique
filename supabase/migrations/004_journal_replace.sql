-- ============================================================================
-- Journal schema (if missing) + SEO high-impact articles
-- Safe to run in the Supabase SQL editor even when 003_blog.sql was never applied.
-- Requires: 001_init.sql (private.is_admin) and public.products (002_seed or equivalent).
-- ============================================================================

do $$
begin
  if to_regclass('public.products') is null then
    raise exception
      'public.products does not exist. Run 001_init.sql and 002_seed.sql before this migration.';
  end if;
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'is_admin'
  ) then
    raise exception
      'private.is_admin() does not exist. Run 001_init.sql before this migration.';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- POSTS (idempotent bootstrap)
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
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

create index if not exists posts_published_idx
  on public.posts (published, published_at desc);

alter table public.posts enable row level security;

do $$
begin
  create policy "Published posts are publicly readable"
    on public.posts for select
    using (published = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can view all posts"
    on public.posts for select
    using (private.is_admin());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can insert posts"
    on public.posts for insert
    with check (private.is_admin());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can update posts"
    on public.posts for update
    using (private.is_admin())
    with check (private.is_admin());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can delete posts"
    on public.posts for delete
    using (private.is_admin());
exception when duplicate_object then null;
end $$;

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

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function private.touch_post_updated_at();

-- ----------------------------------------------------------------------------
-- POST_PRODUCTS (idempotent bootstrap)
-- ----------------------------------------------------------------------------
create table if not exists public.post_products (
  post_id uuid not null references public.posts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  position integer not null default 0,
  primary key (post_id, product_id)
);

create index if not exists post_products_product_id_idx
  on public.post_products (product_id);

alter table public.post_products enable row level security;

do $$
begin
  create policy "Post products are publicly readable"
    on public.post_products for select
    using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can insert post products"
    on public.post_products for insert
    with check (private.is_admin());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can update post products"
    on public.post_products for update
    using (private.is_admin())
    with check (private.is_admin());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admins can delete post products"
    on public.post_products for delete
    using (private.is_admin());
exception when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- Replace any prior journal seeds with the three SEO articles
-- ----------------------------------------------------------------------------
delete from public.posts
where slug in (
  'how-to-style-a-silk-slip-dress',
  'capsule-wardrobe-edit',
  'summer-26-trend-report',
  'summer-capsule-wardrobe-10-pieces',
  'how-to-style-a-silk-camisole',
  'art-of-modern-minimalism'
);

insert into public.posts (title, slug, excerpt, content, cover_image, published, published_at)
values
  (
    $title$Summer Capsule Wardrobe: 10 Minimalist Pieces for Effortless Style$title$,
    'summer-capsule-wardrobe-10-pieces',
    $excerpt$Build a refined summer wardrobe with ten intentional pieces — and discover how The Solstice Midi Dress, Linen Column Dress, and High-Rise Wide Leg Trouser work harder than a closet full of trends.$excerpt$,
    $content$A summer wardrobe should feel like an exhale. Not fewer clothes for the sake of less — but a quieter edit of shapes that move with heat, light, and the invitations your calendar actually holds.

At Sandryne, we believe elegance is a function of clarity. Ten pieces, worn with intention, will outlast thirty bought in haste. This is your summer capsule: minimalist, breathable, and endlessly rearrangeable.

## The rule of ten

A true summer capsule rests on three roles: foundation, architecture, and finish. Foundations are your daily layer. Architecture gives silhouette. Finish is the detail that makes the look feel decided.

### The ten

1. The Solstice Midi Dress — one-and-done polish for day or dusk
2. Linen Column Dress — linen ease with a clean vertical line
3. High-Rise Wide Leg Trouser — the leg that elongates everything above it
4. The Essential Silk Camisole — the layer that softens structure
5. Oversized Poplin Shirt — crisp cotton for air and contrast
6. Ribbed Knit Tank — tonal base under open shirts and dresses
7. Vintage Straight Denim — grounded cool for linen and silk alike
8. Gold Vermeil Chain Necklace — the metal that reads for every hour
9. Woven Leather Belt — waist definition without fuss
10. Silk Twill Scarf — neck, bag, or hair — three accessories in one

You do not need all ten on day one. Start with the three heroes below; add the rest as your season unfolds.

## Hero 1: The Solstice Midi Dress

The Solstice Midi Dress is the piece that answers the hardest summer question: *what do I wear when I refuse to overthink it?* Cut from breathable crepe with a draped neckline, it is one look that reads as three.

**Look one — gallery afternoon.** Wear it alone with flat sandals and a tucked Silk Twill Scarf at the wrist. The dress does the composition; you bring the calm.

**Look two — dinner in town.** Add the Gold Vermeil Chain Necklace and a woven heel. Leave the scarf. Let the midi hold the line while metal catches candlelight.

**Look three — travel day.** Slip the Oversized Poplin Shirt over the dress, sleeves rolled, buttons open. Suddenly the same silhouette that dressed a reservation feels airport-honest — still elevated, never costume.

Cost-per-wear is the quiet argument for premium cloth: when one dress carries brunch, travel, and evening, the price begins to look like economy.

## Hero 2: Linen Column Dress

The Linen Column Dress is architecture you can breathe in. European linen, side slits, a column that flatters without clinging — it is the antidote to ornament-for-ornament’s-sake dressing.

**Morning market.** Bare arms, soft loafers, hair lifted off the neck. Pair with nothing but sunscreen and the chain if you want a thread of polish.

**Afternoon appointment.** Cinch with the Woven Leather Belt. The column becomes intentional — waist noted, line intact.

**Weekend supper.** Layer the Ribbed Knit Tank underneath for a whisper of texture, or leave the dress alone and add the Gold Vermeil Chain Necklace. Linen asks for restraint; give it that.

## Hero 3: High-Rise Wide Leg Trouser

If dresses are the easy answers of summer, the High-Rise Wide Leg Trouser is the versatile verb. High rise, wide fall, a shape that lengthens the leg and cools the silhouette in warm weather.

**Desk to dusk.** Pair with The Essential Silk Camisole and the Oversized Poplin Shirt — shirt tucked or half-tucked depending on the hour. Swap sneakers for a pointed sandal when the day tips toward evening.

**Gallery opening.** Camisole alone, chain necklace, hair soft. The trouser’s volume balances the silk’s ease; nothing shouts.

**Sunday linen.** The Ribbed Knit Tank, the belt, and vintage denim traded for the wide leg on humid days when denim feels like a negotiation.

Worn three ways a week, the trouser stops being “a purchase” and becomes infrastructure.

## How the capsule earns its keep

Mix across fabric families — crepe against cotton, linen against silk — and the same ten pieces refuse to look repetitive. The Solstice Midi Dress and Linen Column Dress cover the one-and-done days. The High-Rise Wide Leg Trouser anchors everything built from separates. Accessories are not afterthoughts; they are how a small wardrobe stays visually new.

## Shop the season

Edit your closet, then edit your cart. Begin with the three pieces that work hardest — The Solstice Midi Dress, Linen Column Dress, and High-Rise Wide Leg Trouser — and build outward only when a gap is real.

[Explore the full collection →](/shop)$content$,
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop',
    true,
    timestamptz '2026-07-10T10:00:00Z'
  ),
  (
    $title$5 Ways to Style a Silk Camisole: Desk to Summer Gala$title$,
    'how-to-style-a-silk-camisole',
    $excerpt$From the conference table to a summer evening invitation — five refined ways to wear The Essential Silk Camisole, finished with gold that earns its place.$excerpt$,
    $content$The camisole is not a compromise piece. In the right silk, it is a wardrobe’s most fluent translator — of day into night, of structure into ease, of a full calendar into one considered silhouette.

The Essential Silk Camisole was cut for that fluency: washable silk, a scooped neckline, fine straps that disappear under a blazer and catch light when they should. What follows are five ways to wear it from morning remit to summer gala — each one elevating the base, none of them overcomplicating it.

## 1. Soft power at the desk

Tuck The Essential Silk Camisole into the High-Rise Wide Leg Trouser. Add the Oversized Poplin Shirt — open, sleeves rolled — as architecture rather than cover. The silk brings polish the cotton can’t; the trouser keeps the line long and unfussy.

Keep jewelry quiet until late afternoon. A watch is enough. Save the Gold Vermeil Chain Necklace for the walk to your evening reservation — the same outfit, one intentional shift.

## 2. Midday ease, city heat

When the temperature rises, drop the shirt. Camisole alone against the wide-leg trouser, hair off the neck, flats that can walk. This is not underdressing; it is trusting cut and cloth.

If you want a single accent, choose the Sculptural Hoop Earrings over multiple metals. One gesture reads as edit, not assemblage.

## 3. Golden hour after the office

Here is the upsell that does not feel like one: leave the camisole and trouser exactly as they were at 4 p.m., then add the Gold Vermeil Chain Necklace. Substantial curb links against washable silk change the register without a wardrobe change.

That is the point of well-chosen accessories — they finish apparel you already love instead of demanding a second look.

## 4. Dinner, candlelit

Swap the trouser for the Bias Satin Midi Skirt if you own it, or keep the wide leg for cooler architecture. The Essential Silk Camisole becomes the evening’s quiet center. Let the Gold Vermeil Chain Necklace sit slightly longer at the décolletage; pair with the Sculptural Hoop Earrings and nothing else at the wrist.

Lips soft. Shoulders free. The silk will do the rest.

## 5. Summer gala, unforced

For a black-tie-adjacent summer evening, layer is not required — proportion is. Wear The Essential Silk Camisole under a fluid open jacket if the invitation asks for more coverage, or alone with high-rise satin or the High-Rise Wide Leg Trouser in its darkest colorway.

Finish with the Gold Vermeil Chain Necklace as the statement. Vermeil has the quiet luxury of pieces that look inevitable: rich enough for gala light, honest enough for the taxi home.

## The accessory rule

Apparel sets the silhouette. Jewelry sets the hour. When you invest in The Essential Silk Camisole, you are buying a base; when you add the Gold Vermeil Chain Necklace, you are buying range — five looks from one foundation, desk to gala, without a suitcase of options.

## Wear it your way

Start with the camisole. Add the chain when the day asks for more. Shop both below, then build the rest of the look from trousers and earrings that already live in your edit.

[Shop The Essential Silk Camisole →](/products/essential-silk-camisole) · [Shop the Gold Vermeil Chain Necklace →](/products/gold-vermeil-chain-necklace)$content$,
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1600&auto=format&fit=crop',
    true,
    timestamptz '2026-07-12T10:00:00Z'
  ),
  (
    $title$The Art of Modern Minimalism: Why Quality Over Quantity Matters in 2026$title$,
    'art-of-modern-minimalism',
    $excerpt$Quiet luxury is not a trend cycle — it is a closet philosophy. Inside the Sandryne approach to curated simplicity, and why fewer, finer pieces are the only wardrobe that still makes sense in 2026.$excerpt$,
    $content$Modern minimalism is often misunderstood as emptiness. At Sandryne, it is the opposite: a full life, lightly carried. Fewer pieces, chosen with a jeweler’s eye for cut and cloth — that is the closet that still feels generous in 2026.

We live in a decade of abundance that rarely feels abundant. Trends arrive weekly; returns clog the hallway; the morning becomes a negotiation with a wardrobe that does not know what it is for. Quality over quantity is not austerity. It is choosing a rhythm your life can keep.

## Curated simplicity

Sandryne Boutique is built on curated simplicity. Every silhouette in the collection exists because it earns a role — not because a season demanded a SKU. The Solstice Midi Dress is there for the days that need one answer. The Essential Silk Camisole is there for the days that need a fluent base. The High-Rise Wide Leg Trouser is infrastructure. The Gold Vermeil Chain Necklace is the finish that lasts longer than a trend report.

Nothing is ornamental for its own sake. If a piece cannot be worn three ways, it is not invited in.

## Why less still wins in 2026

### Attention is the new luxury

A crowded closet is a crowded mind. Editing is not punishment; it is the return of attention to how cloth feels on the body and how a morning should begin — without twenty nearly-identical tops asking for a verdict.

### Cost-per-wear is honesty

A dress worn twenty times outperforms five dresses worn once. The Solstice Midi Dress and Linen Column Dress are priced for presence in a season, not a photograph. Premium fabric is an investment thesis, not a vanity metric.

### Quiet luxury ages better than logos

In 2026, the most persuasive signal is restraint: exact proportion, honest metal, washable silk that survives the laundry and the candlelit dinner. The Gold Vermeil Chain Necklace is not seasonal costume. It is jewelry you put on in June and remember in September.

## The Sandryne edit

Walk the collection and you will see the same philosophy repeating in different fabrics:

- Architecture without hardness — column dresses, wide legs, clean necks
- Cloth you can live in — linen, crepe, washable silk
- Metal meant for every day — vermeil with weight, not glitter

This is modern minimalism as a practice: buy when the gap is real, keep when the cut still flatters, repair before you replace.

## An invitation

If your wardrobe has grown loud, begin again with four pieces that speak softly — The Solstice Midi Dress, The Essential Silk Camisole, the High-Rise Wide Leg Trouser, and the Gold Vermeil Chain Necklace. Build from there only when necessity, not noise, asks.

We are not asking you to own less as a moral exercise. We are asking you to own what you love — and to love what earns its place.

[Shop the collection →](/shop)$content$,
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
    true,
    timestamptz '2026-07-14T10:00:00Z'
  );

-- Tag products to posts ("Shop the Look")
insert into public.post_products (post_id, product_id, position)
select p.id, pr.id, tag.position
from public.posts p
join lateral (
  values
    ('summer-capsule-wardrobe-10-pieces', 'solstice-midi-dress', 0),
    ('summer-capsule-wardrobe-10-pieces', 'linen-column-dress', 1),
    ('summer-capsule-wardrobe-10-pieces', 'high-rise-wide-leg-trouser', 2),
    ('summer-capsule-wardrobe-10-pieces', 'oversized-poplin-shirt', 3),
    ('summer-capsule-wardrobe-10-pieces', 'ribbed-knit-tank', 4),
    ('how-to-style-a-silk-camisole', 'essential-silk-camisole', 0),
    ('how-to-style-a-silk-camisole', 'gold-vermeil-chain-necklace', 1),
    ('how-to-style-a-silk-camisole', 'high-rise-wide-leg-trouser', 2),
    ('how-to-style-a-silk-camisole', 'sculptural-hoop-earrings', 3),
    ('art-of-modern-minimalism', 'solstice-midi-dress', 0),
    ('art-of-modern-minimalism', 'essential-silk-camisole', 1),
    ('art-of-modern-minimalism', 'high-rise-wide-leg-trouser', 2),
    ('art-of-modern-minimalism', 'gold-vermeil-chain-necklace', 3)
) as tag(post_slug, product_slug, position)
  on tag.post_slug = p.slug
join public.products pr on pr.slug = tag.product_slug;
