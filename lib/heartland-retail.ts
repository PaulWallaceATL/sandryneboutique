import "server-only";

/**
 * Heartland Retail POS REST client.
 * Docs: https://dev.retail.heartland.us/
 * Base: https://{subdomain}.retail.heartland.us/api
 */

export interface HeartlandRetailItem {
  id: number;
  public_id: string | null;
  description: string;
  long_description: string | null;
  price: number;
  cost: number;
  active: boolean;
}

export interface HeartlandInventoryValue {
  item_id: number;
  location_id?: number;
  qty_available: number;
  qty_on_hand?: number;
  qty_committed?: number;
}

export interface HeartlandCustomer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  name: string | null;
}

interface SearchResult<T> {
  total: number;
  pages: number;
  results: T[];
}

export function heartlandRetailConfigured(): boolean {
  const station = Number(process.env.HEARTLAND_RETAIL_STATION_ID);
  const location = Number(process.env.HEARTLAND_RETAIL_LOCATION_ID);
  const paymentType = Number(process.env.HEARTLAND_RETAIL_WEB_PAYMENT_TYPE);
  return Boolean(
    process.env.HEARTLAND_RETAIL_SUBDOMAIN &&
      process.env.HEARTLAND_RETAIL_API_TOKEN &&
      Number.isFinite(station) &&
      station > 0 &&
      Number.isFinite(location) &&
      location > 0 &&
      Number.isFinite(paymentType) &&
      paymentType > 0
  );
}

function baseUrl(): string {
  const subdomain = process.env.HEARTLAND_RETAIL_SUBDOMAIN!;
  return `https://${subdomain}.retail.heartland.us/api`;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.HEARTLAND_RETAIL_API_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function parseLocationId(location: string | null): number {
  if (!location) throw new Error("Heartland Retail response missing Location header.");
  const match = location.match(/\/(\d+)\s*$/);
  if (!match) throw new Error(`Could not parse Retail id from Location: ${location}`);
  return Number(match[1]);
}

async function retailFetch(
  path: string,
  init?: RequestInit
): Promise<{ res: Response; body: unknown }> {
  const url = path.startsWith("http") ? path : `${baseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null
        ? JSON.stringify(body)
        : String(body ?? res.statusText);
    throw new Error(`Heartland Retail ${init?.method ?? "GET"} ${path} → ${res.status}: ${detail}`);
  }

  return { res, body };
}

export async function getItem(itemId: number): Promise<HeartlandRetailItem> {
  const { body } = await retailFetch(`/items/${itemId}`);
  return body as HeartlandRetailItem;
}

export async function searchItemsByPublicId(
  publicId: string
): Promise<HeartlandRetailItem[]> {
  const filter = encodeURIComponent(JSON.stringify({ public_id: publicId }));
  const { body } = await retailFetch(`/items?_filter[]=${filter}&per_page=10`);
  const result = body as SearchResult<HeartlandRetailItem>;
  return result.results ?? [];
}

/** Qty available for one item (all locations summed, or filtered to web location). */
export async function getItemQtyAvailable(itemId: number): Promise<number> {
  const locationId = Number(process.env.HEARTLAND_RETAIL_LOCATION_ID || 0);
  const params = new URLSearchParams();
  params.append("group[]", "item_id");
  if (locationId > 0) params.append("group[]", "location_id");
  params.set("per_page", "100");
  const filter = encodeURIComponent(JSON.stringify({ item_id: itemId }));
  params.append("_filter[]", filter);

  const { body } = await retailFetch(`/inventory/values?${params.toString()}`);
  const result = body as SearchResult<HeartlandInventoryValue>;
  const rows = result.results ?? [];

  if (locationId > 0) {
    const atLocation = rows.filter((r) => r.location_id === locationId);
    if (atLocation.length > 0) {
      return Math.max(0, Math.floor(atLocation.reduce((s, r) => s + (r.qty_available ?? 0), 0)));
    }
  }

  return Math.max(0, Math.floor(rows.reduce((s, r) => s + (r.qty_available ?? 0), 0)));
}

/**
 * Map of item_id → qty_available for the given ids.
 * Pages through inventory values grouped by item_id.
 */
export async function getInventoryByItemIds(
  itemIds: number[]
): Promise<Map<number, number>> {
  const wanted = new Set(itemIds);
  const map = new Map<number, number>();
  if (wanted.size === 0) return map;

  // Prefer per-item lookups when the set is small (admin / checkout).
  if (wanted.size <= 25) {
    await Promise.all(
      [...wanted].map(async (id) => {
        try {
          map.set(id, await getItemQtyAvailable(id));
        } catch (err) {
          console.error(`Retail inventory lookup failed for item ${id}:`, err);
          map.set(id, 0);
        }
      })
    );
    return map;
  }

  let page = 1;
  let pages = 1;
  while (page <= pages) {
    const params = new URLSearchParams();
    params.append("group[]", "item_id");
    params.set("per_page", "100");
    params.set("page", String(page));
    const { body } = await retailFetch(`/inventory/values?${params.toString()}`);
    const result = body as SearchResult<HeartlandInventoryValue>;
    pages = result.pages || 1;
    for (const row of result.results ?? []) {
      if (wanted.has(row.item_id)) {
        const prev = map.get(row.item_id) ?? 0;
        map.set(row.item_id, prev + Math.max(0, Math.floor(row.qty_available ?? 0)));
      }
    }
    page += 1;
    if (map.size >= wanted.size) break;
  }

  for (const id of wanted) {
    if (!map.has(id)) map.set(id, 0);
  }
  return map;
}

export async function findCustomerByEmail(email: string): Promise<HeartlandCustomer | null> {
  const filter = encodeURIComponent(JSON.stringify({ email: email.toLowerCase() }));
  const { body } = await retailFetch(`/customers?_filter[]=${filter}&per_page=5`);
  const result = body as SearchResult<HeartlandCustomer>;
  const hits = result.results ?? [];
  return hits[0] ?? null;
}

export async function createCustomer(input: {
  first_name: string;
  last_name: string;
  email: string;
}): Promise<number> {
  const { res } = await retailFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function upsertCustomerByEmail(input: {
  email: string;
  fullName: string;
}): Promise<number> {
  const existing = await findCustomerByEmail(input.email);
  if (existing) return existing.id;

  const parts = input.fullName.trim().split(/\s+/);
  const first_name = parts[0] || "Customer";
  const last_name = parts.slice(1).join(" ") || "Web";
  return createCustomer({
    first_name,
    last_name,
    email: input.email.toLowerCase(),
  });
}

export async function createCustomerAddress(
  customerId: number,
  address: {
    address_1: string;
    address_2?: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
  }
): Promise<number> {
  const { res } = await retailFetch(`/customers/${customerId}/addresses`, {
    method: "POST",
    body: JSON.stringify({
      address_1: address.address_1,
      address_2: address.address_2 || null,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    }),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function createSalesOrder(input: {
  customer_id: number;
  station_id: number;
  source_location_id: number;
  shipping_charge?: number;
}): Promise<number> {
  const { res } = await retailFetch("/sales/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function addOrderLine(
  orderId: number,
  input: { item_id: number; qty: number; adjusted_unit_price?: number }
): Promise<number> {
  const { res } = await retailFetch(`/sales/orders/${orderId}/lines`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function distributeOrderLine(
  orderId: number,
  lineId: number,
  shipFromLocationId: number
): Promise<void> {
  await retailFetch(`/sales/orders/${orderId}/lines/${lineId}`, {
    method: "PUT",
    body: JSON.stringify({ ship_from_location_id: shipFromLocationId }),
  });
}

export async function addOrderPayment(
  orderId: number,
  input: {
    amount: number;
    payment_type_id: number;
    /** Portico transaction id for reconciliation */
    reference?: string;
  }
): Promise<number> {
  const payload: Record<string, unknown> = {
    type: "CustomPayment",
    deposit: true,
    amount: input.amount,
    payment_type_id: input.payment_type_id,
  };
  if (input.reference) {
    payload.custom = { portico_transaction_id: input.reference };
  }
  const { res } = await retailFetch(`/sales/orders/${orderId}/payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function openSalesOrder(orderId: number): Promise<void> {
  await retailFetch(`/sales/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "open" }),
  });
}

export async function createInvoice(input: {
  order_id: number;
  station_id: number;
  source_location_id: number;
}): Promise<number> {
  const { res } = await retailFetch("/sales/invoices", {
    method: "POST",
    body: JSON.stringify({
      type: "Invoice",
      order_id: input.order_id,
      station_id: input.station_id,
      source_location_id: input.source_location_id,
    }),
  });
  return parseLocationId(res.headers.get("location"));
}

export async function completeInvoice(invoiceId: number): Promise<void> {
  await retailFetch(`/sales/invoices/${invoiceId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "complete" }),
  });
}

export interface RetailCheckoutLine {
  heartlandItemId: number;
  quantity: number;
  unitPrice: number;
}

/**
 * After Portico charge: create Retail sales order, custom payment, open + invoice
 * so inventory is deducted in Heartland Retail (source of truth).
 */
export async function syncPaidOrderToRetail(input: {
  email: string;
  fullName: string;
  shipping: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  lines: RetailCheckoutLine[];
  shippingCharge: number;
  totalAmount: number;
  porticoTransactionId?: string;
}): Promise<{ salesOrderId: number; invoiceId: number }> {
  if (!heartlandRetailConfigured()) {
    throw new Error("Heartland Retail is not fully configured.");
  }

  const stationId = Number(process.env.HEARTLAND_RETAIL_STATION_ID);
  const locationId = Number(process.env.HEARTLAND_RETAIL_LOCATION_ID);
  const paymentTypeId = Number(process.env.HEARTLAND_RETAIL_WEB_PAYMENT_TYPE);

  const customerId = await upsertCustomerByEmail({
    email: input.email,
    fullName: input.fullName,
  });

  try {
    await createCustomerAddress(customerId, {
      address_1: input.shipping.line1,
      address_2: input.shipping.line2,
      city: input.shipping.city,
      state: input.shipping.state,
      zip: input.shipping.postal_code,
      country: input.shipping.country,
    });
  } catch (err) {
    // Address shape varies by account; order can still proceed.
    console.warn("Heartland Retail customer address create skipped:", err);
  }

  const salesOrderId = await createSalesOrder({
    customer_id: customerId,
    station_id: stationId,
    source_location_id: locationId,
    shipping_charge: input.shippingCharge,
  });

  for (const line of input.lines) {
    const lineId = await addOrderLine(salesOrderId, {
      item_id: line.heartlandItemId,
      qty: line.quantity,
      adjusted_unit_price: line.unitPrice,
    });
    await distributeOrderLine(salesOrderId, lineId, locationId);
  }

  await addOrderPayment(salesOrderId, {
    amount: input.totalAmount,
    payment_type_id: paymentTypeId,
    reference: input.porticoTransactionId,
  });

  await openSalesOrder(salesOrderId);

  const invoiceId = await createInvoice({
    order_id: salesOrderId,
    station_id: stationId,
    source_location_id: locationId,
  });

  try {
    await completeInvoice(invoiceId);
  } catch (err) {
    // Some accounts auto-complete on create; log and continue.
    console.warn("Heartland Retail invoice complete step:", err);
  }

  return { salesOrderId, invoiceId };
}
