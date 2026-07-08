-- ============================================================================
-- Sandryne Boutique — sample catalog seed
-- Optional: run after 001_init.sql so the storefront renders immediately.
-- Replace with your own products/photography via the admin panel.
-- ============================================================================

insert into public.products
  (name, description, price, images, inventory_count, category, slug, sizes, colors, is_new, on_sale, sale_price)
values
  -- DRESSES ------------------------------------------------------------------
  (
    'The Solstice Midi Dress',
    'A fluid midi silhouette cut from breathable crepe with a softly draped neckline. Falls gracefully to mid-calf — the centerpiece of a summer wardrobe.',
    148.00,
    array[
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200&auto=format&fit=crop'
    ],
    24, 'dresses', 'solstice-midi-dress',
    array['XS','S','M','L','XL'], array['Ivory','Black'],
    true, false, null
  ),
  (
    'Linen Column Dress',
    'Minimal, architectural, effortless. Pure European linen in a clean column line with side slits for ease of movement.',
    132.00,
    array[
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop'
    ],
    18, 'dresses', 'linen-column-dress',
    array['XS','S','M','L'], array['Bone','Sand'],
    true, false, null
  ),
  (
    'Silk Slip Dress',
    'Bias-cut silk charmeuse that skims the body. Adjustable straps, delicate cowl neck — timeless from dinner to dawn.',
    189.00,
    array[
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop'
    ],
    12, 'dresses', 'silk-slip-dress',
    array['XS','S','M','L'], array['Champagne','Noir'],
    false, true, 139.00
  ),
  (
    'Wrap Poplin Shirt Dress',
    'Crisp cotton poplin with a self-tie wrap waist. Structured collar, relaxed sleeve — curated simplicity.',
    118.00,
    array[
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop'
    ],
    20, 'dresses', 'wrap-poplin-shirt-dress',
    array['S','M','L','XL'], array['White','Sky'],
    false, false, null
  ),

  -- TOPS ---------------------------------------------------------------------
  (
    'The Essential Silk Camisole',
    'Washable silk with a scooped neckline and fine straps. Layers beautifully or stands alone.',
    88.00,
    array[
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop'
    ],
    30, 'tops', 'essential-silk-camisole',
    array['XS','S','M','L','XL'], array['Ivory','Black','Sage'],
    true, false, null
  ),
  (
    'Oversized Poplin Shirt',
    'The perfect white shirt, reconsidered. Relaxed through the body with a sharp collar and mother-of-pearl buttons.',
    98.00,
    array[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop'
    ],
    26, 'tops', 'oversized-poplin-shirt',
    array['XS','S','M','L','XL'], array['White','Pale Blue'],
    true, false, null
  ),
  (
    'Ribbed Knit Tank',
    'A second-skin ribbed tank in a soft modal blend. The quiet foundation of every elevated look.',
    54.00,
    array[
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop'
    ],
    40, 'tops', 'ribbed-knit-tank',
    array['XS','S','M','L'], array['Bone','Espresso','Black'],
    false, true, 39.00
  ),

  -- BOTTOMS ------------------------------------------------------------------
  (
    'High-Rise Wide Leg Trouser',
    'Fluid tailoring with a high rise and floor-sweeping wide leg. Pressed front crease for polish.',
    128.00,
    array[
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=1200&auto=format&fit=crop'
    ],
    22, 'bottoms', 'high-rise-wide-leg-trouser',
    array['24','25','26','27','28','29','30'], array['Black','Taupe'],
    true, false, null
  ),
  (
    'Vintage Straight Denim',
    'Rigid-wash denim with a relaxed straight leg and just the right amount of give. Ages beautifully.',
    112.00,
    array[
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1200&auto=format&fit=crop'
    ],
    28, 'bottoms', 'vintage-straight-denim',
    array['24','25','26','27','28','29','30','31'], array['Light Wash','Indigo'],
    false, false, null
  ),
  (
    'Bias Satin Midi Skirt',
    'Cut on the bias so it moves like water. Sits at the natural waist with an invisible zip.',
    96.00,
    array[
      'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=1200&auto=format&fit=crop'
    ],
    16, 'bottoms', 'bias-satin-midi-skirt',
    array['XS','S','M','L'], array['Champagne','Black'],
    false, true, 68.00
  ),

  -- ACTIVE WEAR --------------------------------------------------------------
  (
    'Sculpt Seamless Legging',
    'Buttery, squat-proof compression with a sculpting high rise. Movement, elevated.',
    78.00,
    array[
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?q=80&w=1200&auto=format&fit=crop'
    ],
    35, 'active-wear', 'sculpt-seamless-legging',
    array['XS','S','M','L','XL'], array['Black','Mocha','Sage'],
    true, false, null
  ),
  (
    'Align Longline Bra',
    'Featherweight support with a longline band and delicate strappy back. Pairs with the Sculpt legging.',
    58.00,
    array[
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop'
    ],
    32, 'active-wear', 'align-longline-bra',
    array['XS','S','M','L'], array['Black','Bone'],
    false, false, null
  ),

  -- ACCESSORIES & JEWELRY ----------------------------------------------------
  (
    'Gold Vermeil Chain Necklace',
    '18k gold vermeil over recycled sterling silver. A substantial curb chain that anchors any neckline.',
    124.00,
    array[
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop'
    ],
    15, 'accessories-jewelry', 'gold-vermeil-chain-necklace',
    array[]::text[], array['Gold'],
    true, false, null
  ),
  (
    'Sculptural Hoop Earrings',
    'Hand-finished organic hoops in polished gold vermeil. Light enough for all day, bold enough for evening.',
    86.00,
    array[
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop'
    ],
    20, 'accessories-jewelry', 'sculptural-hoop-earrings',
    array[]::text[], array['Gold','Silver'],
    false, true, 59.00
  ),
  (
    'Woven Leather Belt',
    'Vegetable-tanned Italian leather, hand-woven with a matte brass buckle. The quiet detail that finishes a look.',
    72.00,
    array[
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop'
    ],
    18, 'accessories-jewelry', 'woven-leather-belt',
    array['S','M','L'], array['Tan','Black'],
    false, false, null
  ),
  (
    'Silk Twill Scarf',
    'A hand-rolled silk twill square in an exclusive Sandryne print. Wear it at the neck, in the hair, or on a bag.',
    64.00,
    array[
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop'
    ],
    25, 'accessories-jewelry', 'silk-twill-scarf',
    array[]::text[], array['Ivory Print','Noir Print'],
    true, false, null
  );
