"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusPoint {
  status: string;
  count: number;
}

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const ordersConfig = {
  count: {
    label: "Orders",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function RevenueOverTimeChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-normal tracking-wide">
          Revenue — last 30 days
        </CardTitle>
        <CardDescription>Daily paid + shipped order revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig} className="h-64 w-full">
          <AreaChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => `$${v}`}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="var(--color-revenue)"
              fillOpacity={0.18}
              stroke="var(--color-revenue)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function OrdersByStatusChart({ data }: { data: StatusPoint[] }) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-normal tracking-wide">
          Orders by status
        </CardTitle>
        <CardDescription>All time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={ordersConfig} className="h-64 w-full">
          <BarChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={0} maxBarSize={48} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
