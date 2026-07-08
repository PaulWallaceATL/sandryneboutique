import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";
import { FALLBACK_PRODUCTS } from "@/lib/data/fallback-catalog";
import {
  FALLBACK_POSTS,
  FALLBACK_POST_PRODUCTS,
} from "@/lib/data/fallback-posts";
import type { Post, Product } from "@/lib/types";

export interface PostQuery {
  limit?: number;
  /** Include unpublished drafts (admin views only). */
  includeDrafts?: boolean;
}

export async function getPosts(q: PostQuery = {}): Promise<Post[]> {
  if (!supabaseConfigured()) {
    const sorted = FALLBACK_POSTS.toSorted(
      (a, b) =>
        new Date(b.published_at ?? b.created_at).getTime() -
        new Date(a.published_at ?? a.created_at).getTime()
    );
    return q.limit ? sorted.slice(0, q.limit) : sorted;
  }

  const supabase = await createClient();
  let query = supabase.from("posts").select("*");

  if (!q.includeDrafts) query = query.eq("published", true);
  query = query.order("published_at", { ascending: false, nullsFirst: false });
  if (q.limit) query = query.limit(q.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!supabaseConfigured()) {
    return FALLBACK_POSTS.find((p) => p.slug === slug && p.published) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
  return data as Post | null;
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!supabaseConfigured()) {
    return FALLBACK_POSTS.find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
  return data as Post | null;
}

/** Products tagged to a post, ordered by their "Shop the Look" position. */
export async function getPostProducts(postId: string): Promise<Product[]> {
  if (!supabaseConfigured()) {
    const ids = FALLBACK_POST_PRODUCTS[postId] ?? [];
    return ids
      .map((id) => FALLBACK_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => p != null);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_products")
    .select("position, products (*)")
    .eq("post_id", postId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to fetch post products:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => row.products as unknown as Product | null)
    .filter((p): p is Product => p != null);
}

/** Product ids tagged to a post (for the admin edit form). */
export async function getPostProductIds(postId: string): Promise<string[]> {
  if (!supabaseConfigured()) {
    return FALLBACK_POST_PRODUCTS[postId] ?? [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_products")
    .select("product_id, position")
    .eq("post_id", postId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to fetch post product ids:", error);
    return [];
  }
  return (data ?? []).map((row) => row.product_id as string);
}
