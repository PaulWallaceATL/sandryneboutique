export const FREE_SHIPPING_THRESHOLD = 200;

export const FLAT_SHIPPING_RATE = 9.95;

export const SITE_NAME = "Sandryne Boutique";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/sandryneboutique",
  tiktok: "https://www.tiktok.com/@sandryneboutique",
} as const;

export type CategorySlug =
  | "new-arrivals"
  | "bottoms"
  | "dresses"
  | "accessories-jewelry"
  | "tops"
  | "active-wear"
  | "sale";

export interface CategoryDef {
  slug: CategorySlug;
  label: string;
  /** DB category value; null for virtual categories (new-arrivals, sale) */
  dbCategory: string | null;
  description: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "new-arrivals",
    label: "New Arrivals",
    dbCategory: null,
    description: "Be first to wear the story — this week's fresh picks.",
  },
  {
    slug: "bottoms",
    label: "Bottoms",
    dbCategory: "bottoms",
    description: "Tailored trousers, skirts, and denim with timeless lines.",
  },
  {
    slug: "dresses",
    label: "Dresses",
    dbCategory: "dresses",
    description: "Effortless silhouettes for every hour of the day.",
  },
  {
    slug: "accessories-jewelry",
    label: "Accessories & Jewelry",
    dbCategory: "accessories-jewelry",
    description: "The finishing touches — curated pieces that elevate.",
  },
  {
    slug: "tops",
    label: "Tops",
    dbCategory: "tops",
    description: "From crisp poplin to fluid silk — modern minimalism.",
  },
  {
    slug: "active-wear",
    label: "Active Wear",
    dbCategory: "active-wear",
    description: "Movement, elevated. Performance meets polish.",
  },
  {
    slug: "sale",
    label: "Sale",
    dbCategory: null,
    description: "Elevated looks, gracefully priced.",
  },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
