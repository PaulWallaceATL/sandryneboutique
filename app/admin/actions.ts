"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionInfo } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  message: string;
  id?: string;
}

const PRODUCT_CATEGORIES = [
  "bottoms",
  "dresses",
  "accessories-jewelry",
  "tops",
  "active-wear",
] as const;

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory_count: number;
  category: string;
  slug: string;
  sizes: string[];
  colors: string[];
  is_new: boolean;
  on_sale: boolean;
  sale_price: number | null;
}

async function requireAdmin(): Promise<ActionResult | null> {
  const { profile } = await getSessionInfo();
  if (profile?.role !== "admin") {
    return { ok: false, message: "You are not authorized to perform this action." };
  }
  return null;
}

function validateProduct(input: ProductInput): string | null {
  if (!input.name?.trim()) return "Product name is required.";
  if (!input.slug?.trim() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens (e.g. silk-slip-dress).";
  }
  if (!Number.isFinite(input.price) || input.price < 0) return "Price must be a positive number.";
  if (!Number.isInteger(input.inventory_count) || input.inventory_count < 0) {
    return "Inventory must be a non-negative whole number.";
  }
  if (!PRODUCT_CATEGORIES.includes(input.category as (typeof PRODUCT_CATEGORIES)[number])) {
    return "Please choose a valid category.";
  }
  if (input.on_sale && (input.sale_price == null || input.sale_price <= 0)) {
    return "Sale price is required when the product is on sale.";
  }
  if (input.images.length === 0) return "Add at least one product image.";
  return null;
}

function revalidateStore() {
  revalidatePath("/", "layout");
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const invalid = validateProduct(input);
  if (invalid) return { ok: false, message: invalid };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, sale_price: input.on_sale ? input.sale_price : null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, message: "That slug is already in use." };
    console.error("Product create failed:", error);
    return { ok: false, message: "Failed to create product. Please try again." };
  }

  revalidateStore();
  return { ok: true, message: "Product created.", id: data.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const invalid = validateProduct(input);
  if (invalid) return { ok: false, message: invalid };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...input, sale_price: input.on_sale ? input.sale_price : null })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, message: "That slug is already in use." };
    console.error("Product update failed:", error);
    return { ok: false, message: "Failed to update product. Please try again." };
  }

  revalidateStore();
  return { ok: true, message: "Product updated.", id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Product delete failed:", error);
    return { ok: false, message: "Failed to delete product. Please try again." };
  }

  revalidateStore();
  return { ok: true, message: "Product deleted." };
}

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, message: "Invalid order status." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    console.error("Order status update failed:", error);
    return { ok: false, message: "Failed to update order status." };
  }

  revalidatePath("/admin/orders");
  return { ok: true, message: "Order updated." };
}
