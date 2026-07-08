import { createClient } from "@/lib/supabase/server";
import { FALLBACK_PRODUCTS } from "@/lib/data/fallback-catalog";
import type { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/types";

export type ProductSort = "newest" | "price-asc" | "price-desc";

export interface ProductQuery {
  category?: string;
  onSale?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sort?: ProductSort;
  limit?: number;
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function applyLocalQuery(products: Product[], q: ProductQuery): Product[] {
  let result = products.filter((p) => {
    if (q.category && p.category !== q.category) return false;
    if (q.onSale && !p.on_sale) return false;
    if (q.isNew && !p.is_new) return false;
    if (q.size && !p.sizes.includes(q.size)) return false;
    if (q.color && !p.colors.includes(q.color)) return false;
    const price = effectivePrice(p);
    if (q.minPrice != null && price < q.minPrice) return false;
    if (q.maxPrice != null && price > q.maxPrice) return false;
    return true;
  });

  switch (q.sort) {
    case "price-asc":
      result = result.toSorted((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price-desc":
      result = result.toSorted((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    default:
      result = result.toSorted(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  return q.limit ? result.slice(0, q.limit) : result;
}

export async function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  if (!supabaseConfigured()) {
    return applyLocalQuery(FALLBACK_PRODUCTS, q);
  }

  const supabase = await createClient();
  let query = supabase.from("products").select("*");

  if (q.category) query = query.eq("category", q.category);
  if (q.onSale) query = query.eq("on_sale", true);
  if (q.isNew) query = query.eq("is_new", true);
  if (q.size) query = query.contains("sizes", [q.size]);
  if (q.color) query = query.contains("colors", [q.color]);

  switch (q.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (q.limit) query = query.limit(q.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }

  let products = (data ?? []) as Product[];
  // Price filters compare against the effective (sale-aware) price, done in JS.
  if (q.minPrice != null || q.maxPrice != null) {
    products = products.filter((p) => {
      const price = effectivePrice(p);
      if (q.minPrice != null && price < q.minPrice) return false;
      if (q.maxPrice != null && price > q.maxPrice) return false;
      return true;
    });
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabaseConfigured()) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
  return data as Product | null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  if (!supabaseConfigured()) {
    return FALLBACK_PRODUCTS.filter((p) => ids.includes(p.id));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").in("id", ids);

  if (error) {
    console.error("Failed to fetch products by ids:", error);
    return [];
  }
  return (data ?? []) as Product[];
}
