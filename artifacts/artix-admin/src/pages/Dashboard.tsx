import { useEffect, useState } from "react";
import { Users, Store, TrendingUp, DollarSign, ShoppingCart, UserPlus, CreditCard, RefreshCw, Brain } from "lucide-react";
import { api, DashboardData, RevenueData } from "@/lib/api";
import { formatCurrency, formatRelative } from "@/lib/utils";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import WorldMap from "@/components/WorldMap";
import ActivityFeed from "@/components/ActivityFeed";
import TopStoresList from "@/components/TopStoresList";

export default function Dashboard({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [m, r] = await Promise.all([api.dashboard(), api.revenue("30d")]);
      setMetrics(m);
      setRevenue(r);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <DashboardSkeleton />;

  const signupGrowth = metrics && metrics.newSignupsPrevWeek > 0
    ? Math.round(((metrics.newSignupsThisWeek - metrics.newSignupsPrevWeek) / metrics.newSignupsPrevWeek) * 100)
    : 0;

  const subscriptionBreakdown = metrics?.subscriptionBreakdown ?? [];
  const proPlan = subscriptionBreakdown.find(s => s.plan === 'pro')?.count ?? 0;
  const totalSubs = subscriptionBreakdown.reduce((s, p) => s + p.count, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Overview"
        subtitle="Here's what's happening with ArtixPOS today."
        onMenuOpen={onMenuOpen}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Quick stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={metrics?.totalUsers.toLocaleString() ?? "—"}
            change={signupGrowth}
            changeLabel="vs last week"
            icon={<Users className="w-4 h-4" />}
            iconColor="bg-emerald-500/20 text-emerald-400"
            glowColor="bg-emerald-400"
          />
          <StatCard
            title="Active Stores"
            value={metrics?.activeStores.toLocaleString() ?? "—"}
            change={8.2}
            changeLabel="vs last month"
            icon={<Store className="w-4 h-4" />}
            iconColor="bg-blue-500/20 text-blue-400"
            glowColor="bg-blue-400"
          />
          <StatCard
            title="New Signups"
            value={metrics?.newSignupsThisWeek.toLocaleString() ?? "—"}
            change={signupGrowth}
            changeLabel="this week"
            icon={<UserPlus className="w-4 h-4" />}
            iconColor="bg-violet-500/20 text-violet-400"
            glowColor="bg-violet-400"
          />
          <StatCard
            title="Total POS Sales"
            value={metrics?.totalPosSales.toLocaleString() ?? "—"}
            change={5.4}
            changeLabel="vs last period"
            icon={<ShoppingCart className="w-4 h-4" />}
            iconColor="bg-amber-500/20 text-amber-400"
            glowColor="bg-amber-400"
          />
        </div>

        {/* Revenue + metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Revenue Overview (30 days)</div>
                <div className="text-2xl font-bold text-foreground mt-0.5">
                  {revenue ? formatCurrency(revenue.totalRevenue) : "—"}
                  <span className="text-sm font-normal text-violet-400 ml-2">
                    {revenue ? `${revenue.totalSales} sales` : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => loadData(true)}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue?.data ?? []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158 64% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(158 64% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "hsl(160 10% 80%)" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(158 64% 45%)" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform metrics */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Platform Metrics</div>
            <div className="space-y-4">
              {[
                { label: "POS Revenue", value: formatCurrency(metrics?.totalPosRevenue ?? 0), pct: 100, color: "bg-emerald-500" },
                { label: "Subscription Rev", value: formatCurrency(metrics?.platformRevenue ?? 0), pct: metrics ? Math.round((metrics.platformRevenue / Math.max(metrics.totalPosRevenue, 1)) * 100) : 0, color: "bg-teal-500" },
                { label: "This Month", value: formatCurrency(metrics?.revenueThisMonth ?? 0), pct: metrics ? Math.round((metrics.revenueThisMonth / Math.max(metrics.platformRevenue + metrics.totalPosRevenue, 1)) * 100) : 0, color: "bg-blue-500" },
                { label: "Banned Users", value: String(metrics?.bannedUsers ?? 0), pct: metrics ? Math.round((metrics.bannedUsers / Math.max(metrics.totalUsers, 1)) * 100) : 0, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${Math.min(item.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/60 p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">{metrics?.activeSubscriptions ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Pro Subs</div>
              </div>
              <div className="rounded-lg bg-secondary/60 p-3 text-center">
                <div className="text-lg font-bold text-violet-400">{metrics?.pendingPayments ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Pending Pay</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent signups */}
        {metrics?.recentSignups && metrics.recentSignups.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Recent Signups</div>
            <div className="space-y-2">
              {metrics.recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {(u.name || u.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{u.name || "Unknown"}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {u.storeName && <span className="text-[11px] text-muted-foreground hidden sm:block">{u.storeName}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      u.plan === 'pro'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}>{u.plan || 'free'}</span>
                    <span className="text-[11px] text-muted-foreground">{formatRelative(u.createdAt ?? undefined)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom row: Top Stores + Activity + World Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopStoresList />
          <ActivityFeed />
          <WorldMap />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border/60 bg-card/60">
        <div className="h-5 w-40 shimmer-loading rounded" />
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-5 h-28 shimmer-loading" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card h-72 shimmer-loading" />
          <div className="rounded-xl border border-border/60 bg-card h-72 shimmer-loading" />
        </div>
      </div>
    </div>
  );
}
