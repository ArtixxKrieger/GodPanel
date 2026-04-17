import { useState } from "react";
import { useGetRevenue, useGetTopStores } from "@workspace/api-client-react";
import type { GetRevenuePeriod } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, CreditCard, Activity, Store } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const PERIOD_LABELS: Record<string, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  "1y": "Last Year",
};

export default function Revenue() {
  const [period, setPeriod] = useState<GetRevenuePeriod>("30d");
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenue({ period });
  const { data: topStores, isLoading: isLoadingStores } = useGetTopStores();

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(val);

  const summaryCards = [
    {
      label: "Total Revenue",
      value: fmt(revenueData?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Transactions",
      value: new Intl.NumberFormat("en-US").format(revenueData?.totalSales ?? 0),
      icon: CreditCard,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Avg. Order Value",
      value: fmt(revenueData?.averageOrderValue ?? 0),
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">POS transaction performance across all stores.</p>
        </div>
        <Select value={period} onValueChange={(val) => setPeriod(val as GetRevenuePeriod)}>
          <SelectTrigger className="w-40 bg-card border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="bg-card/50 border-border/60">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{c.label}</p>
                    {isLoadingRevenue ? (
                      <Skeleton className="h-7 w-28" />
                    ) : (
                      <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue Trend</CardTitle>
          <CardDescription>{PERIOD_LABELS[period]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 w-full">
            {isLoadingRevenue ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-full w-full" style={{ height: 200 }} />
                </div>
              </div>
            ) : !revenueData?.data?.length ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No revenue data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    dy={8}
                    tickFormatter={(val) => {
                      try { return format(new Date(val), "MMM d"); } catch { return val; }
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                    dx={-4}
                    width={48}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [fmt(value), "Revenue"]}
                    labelFormatter={(label) => {
                      try { return format(new Date(label), "MMMM d, yyyy"); } catch { return label; }
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Stores */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Stores by Revenue</CardTitle>
              <CardDescription>All-time POS transaction totals</CardDescription>
            </div>
            <Link href="/stores">
              <span className="text-xs text-primary hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingStores ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !topStores?.length ? (
            <p className="text-muted-foreground text-sm p-6 text-center">No store data available.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {topStores.map((store, idx) => {
                const maxRevenue = topStores[0]?.revenue ?? 1;
                const pct = maxRevenue > 0 ? (store.revenue / maxRevenue) * 100 : 0;
                return (
                  <li key={store.userId} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                        <Link href={`/stores/${store.userId}`} className="flex items-center gap-1.5 min-w-0 group">
                          <Store className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{store.storeName}</span>
                        </Link>
                        {store.businessType && (
                          <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{store.businessType}</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-emerald-500 shrink-0">{fmt(store.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden ml-7">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
