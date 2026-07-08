"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";
import { chargeCard, heartlandConfigured } from "@/lib/heartland";
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { discountAmount, findDiscount } from "@/lib/discounts";
import type { OrderItem, Product, ShippingAddress } from "@/lib/types";
import { effectivePrice } from "@/lib/types";

export interface CheckoutLine {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface CheckoutInput {
  token: string;
  shipping: ShippingAddress;
  lines: CheckoutLine[];
  discountCode?: string | null;
}

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

function validateShipping(s: ShippingAddress): string | null {
  if (!s.full_name?.trim()) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email ?? "")) return "Please enter a valid email.";
  if (!s.line1?.trim()) return "Please enter your street address.";
  if (!s.city?.trim()) return "Please enter your city.";
  if (!s.state?.trim()) return "Please enter your state.";
  if (!s.postal_code?.trim()) return "Please enter your postal code.";
  if (!s.country?.trim()) return "Please select your country.";
  return null;
}

export async function processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!heartlandConfigured()) {
    return { ok: false, error: "Payments are not configured yet. Add your Heartland keys to enable checkout." };
  }
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "The store database is not configured yet. Add your Supabase keys to enable checkout." };
  }

  if (!input.token) {
    return { ok: false, error: "Missing payment token. Please re-enter your card details." };
  }

  const shippingError = validateShipping(input.shipping);
  if (shippingError) return { ok: false, error: shippingError };

  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      return { ok: false, error: "Invalid quantity in cart." };
    }
  }

  const admin = createAdminClient();

  // Re-price every line from the database — never trust client totals.
  const ids = [...new Set(input.lines.map((l) => l.productId))];
  const { data: productRows, error: productError } = await admin
    .from("products")
    .select("*")
    .in("id", ids);

  if (productError || !productRows) {
    console.error("Checkout product lookup failed:", productError);
    return { ok: false, error: "We couldn't verify your cart. Please try again." };
  }

  const products = new Map((productRows as Product[]).map((p) => [p.id, p]));

  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const line of input.lines) {
    const product = products.get(line.productId);
    if (!product) {
      return { ok: false, error: "An item in your cart is no longer available." };
    }
    if (product.inventory_count < line.quantity) {
      return {
        ok: false,
        error: `Sorry, we only have ${product.inventory_count} of "${product.name}" left.`,
      };
    }
    const price = effectivePrice(product);
    subtotal += price * line.quantity;
    orderItems.push({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      price,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    });
  }

  // Discount codes are validated server-side; an unknown code is rejected
  // rather than silently ignored so the shopper isn't surprised at charge time.
  let discount = 0;
  if (input.discountCode?.trim()) {
    const def = findDiscount(input.discountCode);
    if (!def) {
      return { ok: false, error: "That discount code isn't valid." };
    }
    discount = discountAmount(subtotal, def);
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const total = Math.round((discountedSubtotal + shippingCost) * 100) / 100;

  // Charge the card via Heartland.
  const charge = await chargeCard({
    token: input.token,
    amount: total,
    postalCode: input.shipping.postal_code,
    streetAddress: input.shipping.line1,
  });

  if (!charge.ok) {
    return { ok: false, error: charge.message ?? "Payment failed. Please try again." };
  }

  // Payment approved — record the order and adjust inventory.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      email: input.shipping.email,
      total_amount: total,
      status: "paid",
      heartland_transaction_id: charge.transactionId,
      shipping_address: input.shipping,
      items: orderItems,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    // Payment went through but the order insert failed — surface for manual follow-up.
    console.error(
      `CRITICAL: payment ${charge.transactionId} succeeded but order insert failed:`,
      orderError
    );
    return {
      ok: false,
      error:
        "Your payment was received but we hit a problem saving your order. Please contact us with your email address — do not retry.",
    };
  }

  for (const item of orderItems) {
    const { error: invError } = await admin.rpc("decrement_inventory", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
    if (invError) {
      console.error(`Inventory decrement failed for ${item.product_id}:`, invError);
    }
  }

  return { ok: true, orderId: order.id };
}
