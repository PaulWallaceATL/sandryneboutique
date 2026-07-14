import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPrivilegedClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";
import type { Order, Profile } from "@/lib/types";
import { formatPrice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  let profiles: Profile[] = [];
  let orders: Order[] = [];

  if (supabaseConfigured()) {
    const supabase = await createPrivilegedClient();
    const [profileRes, orderRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*"),
    ]);
    profiles = (profileRes.data ?? []) as Profile[];
    orders = (orderRes.data ?? []) as Order[];
  }

  const statsByUser = new Map<string, { count: number; total: number }>();
  for (const order of orders) {
    if (!order.user_id) continue;
    const entry = statsByUser.get(order.user_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    if (order.status === "paid" || order.status === "shipped") {
      entry.total += Number(order.total_amount);
    }
    statsByUser.set(order.user_id, entry);
  }

  const guestOrders = orders.filter((o) => !o.user_id).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profiles.length} registered {profiles.length === 1 ? "profile" : "profiles"}
          {guestOrders > 0 && ` · ${guestOrders} guest ${guestOrders === 1 ? "order" : "orders"}`}
        </p>
      </header>

      {profiles.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-foreground/15">
          <p className="font-serif text-2xl mb-2">No customers yet</p>
          <p className="text-sm text-muted-foreground px-4">
            Profiles are created automatically when users sign up.
          </p>
        </div>
      ) : (
        <>
          <ul className="md:hidden space-y-3">
            {profiles.map((profile) => {
              const stats = statsByUser.get(profile.id);
              return (
                <li
                  key={profile.id}
                  className="border border-foreground/10 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground break-all">{profile.email}</p>
                    </div>
                    <Badge
                      variant={profile.role === "admin" ? "default" : "secondary"}
                      className="rounded-none text-[10px] uppercase tracking-[0.14em] shrink-0"
                    >
                      {profile.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Joined{" "}
                      {new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="tabular-nums">{stats?.count ?? 0} orders</span>
                    <span className="tabular-nums">{formatPrice(stats?.total ?? 0)} LTV</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block border border-foreground/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Lifetime Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const stats = statsByUser.get(profile.id);
                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <p className="font-medium">{profile.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={profile.role === "admin" ? "default" : "secondary"}
                          className="rounded-none text-[10px] uppercase tracking-[0.14em]"
                        >
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {stats?.count ?? 0}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(stats?.total ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
