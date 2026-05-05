import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, BarChart2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import TopBar from "@/components/TopBar";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

type Period = "7d" | "30d" | "90d" | "1y";

export default function Revenue() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<any>(null);
  const [topStores, setTopStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.revenue(period), api.topStores()])
      .then(([r, s]) => { setData(r); setTopStores(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const chartData = data?.data ?? [];
  const maxRev = Math.max(...topStores.map((s) => s.revenue), 1);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Revenue Analytics" subtitle="Financial performance across the platform" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Period selector */}
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "1y"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "1 Year"}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: data ? formatCurrency(data.totalRevenue) : "—", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/15" },
            { label: "Total Sales", value: data?.totalSales ?? "—", icon: ShoppingCart, color: "text-blue-400 bg-blue-500/15" },
            { label: "Avg Order Value", value: data ? formatCurrency(data.averageOrderValue) : "—", icon: BarChart2, color: "text-violet-400 bg-violet-500/15" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color.split(" ")[1]} `}>
                <Icon className={`w-4.5 h-4.5 ${color.split(" ")[0]}`} />
              </div>
              {loading ? (
                <div className="w-24 h-6 shimmer-loading rounded mb-1" />
              ) : (
                <div className="text-xl font-bold text-foreground">{value}</div>
              )}
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-semibold text-foreground">Revenue Over Time</div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-muted-foreground">Revenue</span></div>
            </div>
          </div>
          {loading ? (
            <div className="h-56 shimmer-loading rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revG2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158 64% 45%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(158 64% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${formatNumber(v)}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(158 64% 45%)" strokeWidth={2.5} fill="url(#revG2)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales bar chart */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="text-sm font-semibold text-foreground mb-5">Daily Sales Volume</div>
          {loading ? (
            <div className="h-44 shimmer-loading rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.slice(-14)} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="sales" fill="hsl(262 52% 55%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top stores */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="text-sm font-semibold text-foreground mb-4">Top Stores by Revenue</div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer-loading rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {topStores.slice(0, 8).map((s, i) => (
                <div key={s.userId} className="flex items-center gap-4">
                  <span className="w-5 text-xs text-muted-foreground text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground truncate">{s.storeName}</span>
                      <span className="text-xs text-emerald-400 font-semibold ml-4 flex-shrink-0">{formatCurrency(s.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${(s.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{s.businessType || "Retail"}</span>
                      <span>{s.salesCount} sales</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
