import type { Post } from "@/lib/types";

/**
 * Local mirror of supabase/migrations/003_blog.sql seed posts.
 * Served when Supabase env vars are not configured yet, matching the
 * fallback-catalog.ts pattern for products.
 */
export const FALLBACK_POSTS: Post[] = [
  {
    id: "1b5e2d2f-4a7e-4f7b-8c2b-000000000001",
    title: "How to Style a Silk Slip Dress: Day to Night",
    slug: "how-to-style-a-silk-slip-dress",
    excerpt:
      "From weekend brunch to evening cocktails — five effortless ways to wear the season's most versatile dress.",
    content: `The silk slip dress is the quiet workhorse of an elevated wardrobe. Bias-cut and fluid, it moves with you — and with the right styling, it moves from morning coffee to midnight without missing a beat.

## Daytime: layer it down

Throw an oversized poplin shirt over your slip dress, unbuttoned and sleeves rolled. The crisp cotton against liquid silk is the kind of contrast that reads intentional, not accidental. Finish with flat sandals and a woven leather belt to define the waist.

## Golden hour: add polish

Swap the shirt for sculptural gold jewelry. A substantial curb chain and organic hoops catch the light exactly where you want it — at the neckline and the jaw. Keep the rest minimal.

## Evening: let it stand alone

At night, the slip dress needs almost nothing. A heeled sandal, a swipe of something on the lips, and the confidence of a piece that was cut to skim, not cling.

## Care notes

Washable silk means this is not a precious piece. Cold gentle cycle, lay flat to dry, and it will age like a good decision.`,
    cover_image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop",
    published: true,
    published_at: "2026-06-24T10:00:00Z",
    created_at: "2026-06-24T10:00:00Z",
    updated_at: "2026-06-24T10:00:00Z",
  },
  {
    id: "1b5e2d2f-4a7e-4f7b-8c2b-000000000002",
    title: "The Capsule Wardrobe Edit: 10 Pieces, 30 Outfits",
    slug: "capsule-wardrobe-edit",
    excerpt:
      "Our guide to building a capsule wardrobe around timeless silhouettes — fewer, better pieces that work harder.",
    content: `A capsule wardrobe is not about deprivation. It is about removing the noise so the good pieces can speak.

## Start with the foundation

Every capsule begins with the quiet essentials: a ribbed knit tank in bone, a perfect white poplin shirt, and vintage straight denim. These three alone give you a week of looks.

## Add the columns

A linen column dress and a high-rise wide leg trouser bring architecture to the mix. Both are shapes that flatter without effort and pair with everything above.

## The finishing layer

Accessories are where a capsule earns its keep. A silk twill scarf works at the neck, in the hair, or knotted on a bag — three accessories in one. A woven leather belt sharpens every silhouette it touches.

## The math

Ten considered pieces, honestly mixed, yield thirty distinct outfits. That is not minimalism for its own sake — that is a wardrobe that respects your morning.`,
    cover_image:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop",
    published: true,
    published_at: "2026-07-01T10:00:00Z",
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
  {
    id: "1b5e2d2f-4a7e-4f7b-8c2b-000000000003",
    title: "Summer '26 Trend Report: Elevated Ease",
    slug: "summer-26-trend-report",
    excerpt:
      "The silhouettes, fabrics, and details defining the season — and how to wear them your way.",
    content: `This season's mood is ease with intention. Nothing fussy, nothing forced — just fabrics that breathe and lines that flatter.

## Fluid midis

The midi dress continues its reign, this year in breathable crepe with softly draped necklines. It is the one-and-done answer to every summer invitation.

## Sculpted movement

Active wear has left the gym for good. Seamless leggings and longline bras in tonal neutrals — black, mocha, sage — layer under open shirts and oversized knits for a look that moves.

## Gold, worn daily

Jewelry is trending substantial but not loud: curb chains in gold vermeil, hand-finished hoops with organic curves. Pieces you put on in June and take off in September.

## The takeaway

Buy less, choose well, and let the cut do the talking. Summer '26 rewards the wardrobe that was built, not bought.`,
    cover_image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
    published: true,
    published_at: "2026-07-06T10:00:00Z",
    created_at: "2026-07-06T10:00:00Z",
    updated_at: "2026-07-06T10:00:00Z",
  },
];

/** post id -> tagged product ids (mirrors post_products seed, in position order) */
export const FALLBACK_POST_PRODUCTS: Record<string, string[]> = {
  "1b5e2d2f-4a7e-4f7b-8c2b-000000000001": [
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000003", // silk-slip-dress
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000006", // oversized-poplin-shirt
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000013", // gold-vermeil-chain-necklace
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000015", // woven-leather-belt
  ],
  "1b5e2d2f-4a7e-4f7b-8c2b-000000000002": [
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000007", // ribbed-knit-tank
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000009", // vintage-straight-denim
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000002", // linen-column-dress
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000008", // high-rise-wide-leg-trouser
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000016", // silk-twill-scarf
  ],
  "1b5e2d2f-4a7e-4f7b-8c2b-000000000003": [
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000001", // solstice-midi-dress
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000011", // sculpt-seamless-legging
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000012", // align-longline-bra
    "0a4f1c1e-3f6d-4e6a-9b1a-000000000014", // sculptural-hoop-earrings
  ],
};
