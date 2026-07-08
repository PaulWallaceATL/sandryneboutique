import type { Metadata } from "next";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OrdersByStatusChart,
  RevenueOverTimeChart,
  type RevenuePoint,
  type StatusPoint,
} from "@/components/admin/revenue-charts";
import { createPrivilegedClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

const REVENUE_STATUSES: Order["status"][] = ["paid", "shipped"];

export default async function AdminDashboardPage() {
  const supabase = await createPrivilegedClient();

  const [{ data: orderRows }, { count: productCount }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const orders = (orderRows ?? []) as Order[];
  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));

  const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const orderCount = orders.length;
  const averageOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

  // Revenue by day for the last 30 days.
  const days: RevenuePoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = revenueOrders.filter((o) => o.created_at.slice(0, 10) === key);
    days.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(dayOrders.reduce((s, o) => s + Number(o.total_amount), 0) * 100) / 100,
      orders: dayOrders.length,
    });
  }

  const statusData: StatusPoint[] = (["pending", "paid", "shipped", "cancelled"] as const).map(
    (status) => ({
      status: status[0].toUpperCase() + status.slice(1),
      count: orders.filter((o) => o.status === status).length,
    })
  );

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
    { label: "Orders", value: String(orderCount), icon: ShoppingBag },
    { label: "Avg. Order Value", value: formatPrice(averageOrderValue), icon: TrendingUp },
    { label: "Products", value: String(productCount ?? 0), icon: Package },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue and order analytics for Sandryne Boutique.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-normal">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueOverTimeChart data={days} />
        <OrdersByStatusChart data={statusData} />
      </div>
    </div>
  );
}
