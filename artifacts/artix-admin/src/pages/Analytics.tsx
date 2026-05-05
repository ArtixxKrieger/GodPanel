import { useEffect, useState } from "react";
import { api, DashboardData, RevenueData, StoreSummary, AiUsageEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import TopBar from "@/components/TopBar";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#34d399", "#a78bfa", "#60a5fa", "#fbbf24", "#f472b6", "#fb923c"];

export default function Analytics({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard(),
      api.revenue("90d"),
      api.stores(),
      api.aiUsage(),
    ]).then(([d, r, s, ai]) => {
      setDashboard(d);
      setRevenue(r);
      setStores(s);
      setAiUsage(ai);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalUsers = dashboard?.totalUsers ?? 0;
  const activeStores = dashboard?.activeStores ?? 0;
  const bannedUsers = dashboard?.bannedUsers ?? 0;
  const totalPosRevenue = dashboard?.totalPosRevenue ?? 0;
  const platformRevenue = dashboard?.platformRevenue ?? 0;
  const totalRevenue = totalPosRevenue + platformRevenue;
  const totalPosSales = dashboard?.totalPosSales ?? 0;
  const freeUsers = dashboard?.freeUsers ?? 0;
  const activeSubscriptions = dashboard?.activeSubscriptions ?? 0;
  const ltv = totalUsers > 0 ? totalRevenue / totalUsers : 0;
  const bannedRate = totalUsers > 0 ? ((bannedUsers / totalUsers) * 100).toFixed(1) : "0";
  const totalAiMemories = aiUsage.reduce((s, a) => s + (a.memoryCount || 0), 0);
  const signupGrowth = dashboard && dashboard.newSignupsPrevWeek > 0
    ? Math.round(((dashboard.newSignupsThisWeek - dashboard.newSignupsPrevWeek) / dashboard.newSignupsPrevWeek) * 100)
    : 0;

  // Business type breakdown from real stores data
  const typeMap: Record<string, number> = {};
  stores.forEach((s) => {
    const t = s.businessType || "Other";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const businessTypeData = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, value: count }));
  const totalStores = businessTypeData.reduce((s, d) => s + d.value, 0);

  // Subscription breakdown pie
  const subBreakdown = dashboard?.subscriptionBreakdown ?? [];

  // Revenue chart from API
  const chartData = (revenue?.data ?? []).slice(-30);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Analytics" subtitle="Platform insights from live data" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        {/* Key KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Revenue / User", value: loading ? "—" : formatCurrency(ltv), sub: "lifetime value", color: "text-emerald-400" },
            { label: "Active Stores", value: loading ? "—" : activeStores.toLocaleString(), sub: `of ${totalUsers} users`, color: "text-blue-400" },
            { label: "Banned Users", value: loading ? "—" : `${bannedRate}%`, sub: `${bannedUsers} accounts`, color: "text-red-400" },
            { label: "Signup Growth", value: loading ? "—" : `${signupGrowth > 0 ? "+" : ""}${signupGrowth}%`, sub: "week over week", color: signupGrowth >= 0 ? "text-emerald-400" : "text-red-400" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-foreground font-medium mt-0.5">{label}</div>
              <div className="text-[11px] text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue over 90 days + Business type breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-1">Revenue — Last 90 Days</div>
            <div className="text-xs text-muted-foreground mb-4">
              {revenue ? `${revenue.totalSales} sales · avg ${formatCurrency(revenue.averageOrderValue)}` : ""}
            </div>
            {loading ? (
              <div className="h-56 shimmer-loading rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No revenue data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2.5} fill="url(#aGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Business Types</div>
            {loading ? (
              <div className="h-40 shimmer-loading rounded-xl" />
            ) : businessTypeData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No store data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={businessTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {businessTypeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v: number, _: string, entry: any) => [`${v} stores (${totalStores ? Math.round((v / totalStores) * 100) : 0}%)`, entry.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {businessTypeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className="text-[10px] text-muted-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-[10px] text-foreground font-medium">{d.value} stores</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Platform summary + AI usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Platform Summary</div>
            <div className="space-y-3">
              {loading ? (
                [...Array(6)].map((_, i) => <div key={i} className="h-8 shimmer-loading rounded-lg" />)
              ) : [
                { label: "Total Users", value: totalUsers.toLocaleString(), pct: 100, color: "bg-emerald-500" },
                { label: "Active Stores", value: activeStores.toLocaleString(), pct: totalUsers ? Math.round((activeStores / totalUsers) * 100) : 0, color: "bg-blue-500" },
                { label: "Pro Subscribers", value: activeSubscriptions.toLocaleString(), pct: totalUsers ? Math.round((activeSubscriptions / totalUsers) * 100) : 0, color: "bg-violet-500" },
                { label: "Free Users", value: freeUsers.toLocaleString(), pct: totalUsers ? Math.round((freeUsers / totalUsers) * 100) : 0, color: "bg-secondary border border-border" },
                { label: "POS Revenue", value: formatCurrency(totalPosRevenue), pct: 100, color: "bg-teal-500" },
                { label: "Subscription Rev", value: formatCurrency(platformRevenue), pct: totalPosRevenue ? Math.round((platformRevenue / totalPosRevenue) * 100) : 0, color: "bg-amber-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-foreground font-semibold">{row.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">AI Usage Overview</div>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-10 shimmer-loading rounded-lg mb-2" />)
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <div className="text-xl font-bold text-violet-400">{aiUsage.filter(a => a.memoryCount > 0).length}</div>
                    <div className="text-[10px] text-muted-foreground">Stores using AI</div>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <div className="text-xl font-bold text-emerald-400">{totalAiMemories.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Total memories</div>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <div className="text-xl font-bold text-blue-400">
                      {aiUsage.length ? Math.round(totalAiMemories / aiUsage.length) : 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Avg per store</div>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <div className="text-xl font-bold text-amber-400">
                      {stores.length > 0 ? Math.round((aiUsage.filter(a => a.memoryCount > 0).length / stores.length) * 100) : 0}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">AI adoption</div>
                  </div>
                </div>

                {/* Subscription breakdown */}
                {subBreakdown.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-foreground">Subscription Plans</div>
                    <div className="space-y-1.5">
                      {subBreakdown.map((p) => (
                        <div key={p.plan} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                          <span className="text-foreground font-medium capitalize">{p.plan}</span>
                          <span className="text-emerald-400 font-bold">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {aiUsage.filter(a => a.memoryCount > 0).slice(0, 3).map((a) => (
                  <div key={a.userId} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                    <span className="text-foreground font-medium truncate flex-1">{a.storeName}</span>
                    <span className="text-violet-400 font-bold ml-3">{a.memoryCount} entries</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
