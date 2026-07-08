import type { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
};

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = (status as OrderStatus | undefined) ?? "all";

  let orders: Order[] = [];
  if (supabaseConfigured()) {
    const supabase = await createClient();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (activeFilter !== "all") query = query.eq("status", activeFilter);
    const { data } = await query;
    orders = (data ?? []) as Order[];
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Heartland transactions and fulfillment.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin/orders" : `/admin/orders?status=${filter.value}`}
            className={cn(
              "px-4 py-1.5 border text-xs tracking-[0.14em] uppercase transition-colors",
              activeFilter === filter.value
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 hover:border-foreground"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-foreground/15">
          <p className="font-serif text-2xl mb-2">No orders found</p>
          <p className="text-sm text-muted-foreground">
            {activeFilter === "all"
              ? "Orders will appear here as customers check out."
              : `No ${activeFilter} orders right now.`}
          </p>
        </div>
      ) : (
        <Accordion type="multiple" className="border border-foreground/10 divide-y divide-foreground/8">
          {orders.map((order) => (
            <AccordionItem key={order.id} value={order.id} className="border-b-0 px-5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 pr-4 text-left">
                  <div className="min-w-44">
                    <p className="text-sm font-medium">{order.shipping_address.full_name}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <Badge variant="secondary" className="rounded-none text-[10px] uppercase tracking-[0.14em]">
                    {order.status}
                  </Badge>
                  <span className="ml-auto text-sm font-medium tabular-nums">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <h3 className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                      Items
                    </h3>
                    <ul className="space-y-2">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span>
                            {item.quantity} × {item.name}
                            {(item.size || item.color) && (
                              <span className="text-muted-foreground">
                                {" "}
                                ({[item.size, item.color].filter(Boolean).join(" · ")})
                              </span>
                            )}
                          </span>
                          <span className="tabular-nums">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mt-6 mb-2">
                      Ship to
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {order.shipping_address.full_name}
                      <br />
                      {order.shipping_address.line1}
                      {order.shipping_address.line2 && (
                        <>
                          <br />
                          {order.shipping_address.line2}
                        </>
                      )}
                      <br />
                      {order.shipping_address.city}, {order.shipping_address.state}{" "}
                      {order.shipping_address.postal_code}
                      <br />
                      {order.shipping_address.country}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                        Status
                      </h3>
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </div>
                    <div>
                      <h3 className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                        Heartland Transaction
                      </h3>
                      <p className="text-xs font-mono break-all">
                        {order.heartland_transaction_id ?? "—"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
                        Order Ref
                      </h3>
                      <p className="text-xs font-mono break-all">{order.id}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
