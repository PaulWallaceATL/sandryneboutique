/**
 * Maps Shopify Product Type / Tags to Sandryne DB categories.
 * Unmapped products still import with a fallback category and are listed in the report.
 */

export const DB_CATEGORIES = [
  "bottoms",
  "dresses",
  "accessories-jewelry",
  "tops",
  "active-wear",
] as const;

export type DbCategory = (typeof DB_CATEGORIES)[number];

/** Exact Product Type strings (normalized lowercase). */
const TYPE_MAP: Record<string, DbCategory> = {
  tops: "tops",
  top: "tops",
  tanks: "tops",
  tank: "tops",
  blouse: "tops",
  blouses: "tops",
  shirt: "tops",
  shirts: "tops",
  tee: "tops",
  tees: "tops",
  "t-shirt": "tops",
  "t-shirts": "tops",
  sweater: "tops",
  sweaters: "tops",
  sweatshirt: "tops",
  sweatshirts: "tops",
  hoodie: "tops",
  hoodies: "tops",
  vest: "tops",
  vests: "tops",
  jacket: "tops",
  jackets: "tops",
  blazer: "tops",
  blazers: "tops",
  coat: "tops",
  coats: "tops",
  cardigan: "tops",
  cardigans: "tops",
  cardi: "tops",
  cami: "tops",
  camisole: "tops",
  henley: "tops",
  "knit top": "tops",
  knittop: "tops",
  halter: "tops",
  shrug: "tops",
  kimono: "tops",
  outerwear: "tops",
  loungewear: "active-wear",
  bottoms: "bottoms",
  bottom: "bottoms",
  pants: "bottoms",
  pant: "bottoms",
  trousers: "bottoms",
  jeans: "bottoms",
  denim: "bottoms",
  skirt: "bottoms",
  skirts: "bottoms",
  shorts: "bottoms",
  short: "bottoms",
  jogger: "bottoms",
  joggers: "bottoms",
  palazzo: "bottoms",
  dress: "dresses",
  dresses: "dresses",
  gown: "dresses",
  jumpsuit: "dresses",
  jumpsuits: "dresses",
  rompers: "dresses",
  romper: "dresses",
  mididress: "dresses",
  "midi dress": "dresses",
  minidress: "dresses",
  "mini dress": "dresses",
  maxidress: "dresses",
  "maxi dress": "dresses",
  accessory: "accessories-jewelry",
  accessories: "accessories-jewelry",
  "accessories & jewelry": "accessories-jewelry",
  "accessories and jewelry": "accessories-jewelry",
  jewelry: "accessories-jewelry",
  jewellery: "accessories-jewelry",
  necklace: "accessories-jewelry",
  necklaces: "accessories-jewelry",
  earring: "accessories-jewelry",
  earrings: "accessories-jewelry",
  bracelet: "accessories-jewelry",
  bracelets: "accessories-jewelry",
  ring: "accessories-jewelry",
  rings: "accessories-jewelry",
  hat: "accessories-jewelry",
  hats: "accessories-jewelry",
  cap: "accessories-jewelry",
  caps: "accessories-jewelry",
  "baseball hat": "accessories-jewelry",
  "baseball cap": "accessories-jewelry",
  bag: "accessories-jewelry",
  bags: "accessories-jewelry",
  handbag: "accessories-jewelry",
  handbags: "accessories-jewelry",
  purse: "accessories-jewelry",
  purses: "accessories-jewelry",
  tote: "accessories-jewelry",
  clutch: "accessories-jewelry",
  wallet: "accessories-jewelry",
  belt: "accessories-jewelry",
  belts: "accessories-jewelry",
  scarf: "accessories-jewelry",
  scarves: "accessories-jewelry",
  sunglasses: "accessories-jewelry",
  candle: "accessories-jewelry",
  candles: "accessories-jewelry",
  gift: "accessories-jewelry",
  gifts: "accessories-jewelry",
  active: "active-wear",
  "active wear": "active-wear",
  "active-wear": "active-wear",
  activewear: "active-wear",
  athleisure: "active-wear",
  leggings: "active-wear",
  sportswear: "active-wear",
};

/** Keyword → category (checked against type, tags, and title). Longer phrases first. */
const KEYWORD_RULES: Array<{ pattern: RegExp; category: DbCategory }> = [
  { pattern: /\b(active\s*-?\s*wear|athleisure|leggings|sportswear)\b/i, category: "active-wear" },
  { pattern: /\b(dress|dresses|gown|jumpsuit|romper)\b/i, category: "dresses" },
  {
    pattern: /\b(skirt|skirts|jean|jeans|pant|pants|trouser|shorts|bottom|jogger)\b/i,
    category: "bottoms",
  },
  {
    pattern:
      /\b(hat|hats|cap|caps|bag|bags|handbag|purse|tote|clutch|wallet|belt|belts|scarf|jewelry|jewellery|necklace|earring|bracelet|ring|candle|accessory|accessories)\b/i,
    category: "accessories-jewelry",
  },
  {
    pattern:
      /\b(tank|blouse|shirt|tee|t-shirt|sweater|hoodie|vest|jacket|blazer|coat|cardigan|cardi|kimono|outerwear|top|tops)\b/i,
    category: "tops",
  },
];

const FALLBACK_CATEGORY: DbCategory = "tops";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface CategoryMapResult {
  category: DbCategory;
  /** True when we used keyword heuristics or the fallback — review these. */
  unmapped: boolean;
  source: "type" | "tag" | "keyword" | "fallback";
}

export function mapShopifyCategory(
  productType: string,
  tags: string[],
  title = ""
): CategoryMapResult {
  const typeKey = normalize(productType);
  if (typeKey && TYPE_MAP[typeKey]) {
    return { category: TYPE_MAP[typeKey], unmapped: false, source: "type" };
  }

  for (const tag of tags) {
    const tagKey = normalize(tag);
    // Shopify often uses Type_Dress / Type_Handbag style tags
    const typeTag = tagKey.startsWith("type_") ? tagKey.slice(5) : tagKey;
    if (TYPE_MAP[tagKey] || TYPE_MAP[typeTag]) {
      return {
        category: TYPE_MAP[tagKey] ?? TYPE_MAP[typeTag]!,
        unmapped: false,
        source: "tag",
      };
    }
  }

  const haystack = [productType, ...tags, title].filter(Boolean).join(" ");
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(haystack)) {
      // Title/tag heuristics are intentional — only pure fallback needs review.
      return { category: rule.category, unmapped: false, source: "keyword" };
    }
  }

  return { category: FALLBACK_CATEGORY, unmapped: true, source: "fallback" };
}
