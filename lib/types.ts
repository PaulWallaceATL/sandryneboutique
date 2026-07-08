export type Role = "admin" | "customer";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
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
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface OrderItem {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  email: string;
  total_amount: number;
  status: OrderStatus;
  heartland_transaction_id: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  created_at: string;
}

/** Effective selling price (sale price when on sale). */
export function effectivePrice(p: Pick<Product, "price" | "on_sale" | "sale_price">): number {
  return p.on_sale && p.sale_price != null ? p.sale_price : p.price;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
