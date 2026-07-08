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
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profiles.length} registered {profiles.length === 1 ? "profile" : "profiles"}
          {guestOrders > 0 && ` · ${guestOrders} guest ${guestOrders === 1 ? "order" : "orders"}`}
        </p>
      </header>

      <div className="border border-foreground/10">
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
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  No customer profiles yet — they are created automatically when users sign up.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => {
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
