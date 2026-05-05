import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Store } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import TopBar from "@/components/TopBar";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#34d399", "#a78bfa", "#60a5fa", "#fbbf24", "#f472b6", "#fb923c"];

const businessTypeData = [
  { name: "Food & Beverage", value: 38 },
  { name: "Retail", value: 27 },
  { name: "Electronics", value: 14 },
  { name: "Services", value: 12 },
  { name: "Healthcare", value: 5 },
  { name: "Other", value: 4 },
];

const growthData = [
  { month: "Dec", users: 82, stores: 61, revenue: 145000 },
  { month: "Jan", users: 95, stores: 71, revenue: 162000 },
  { month: "Feb", users: 108, stores: 83, revenue: 178000 },
  { month: "Mar", users: 124, stores: 94, revenue: 198000 },
  { month: "Apr", users: 143, stores: 109, revenue: 224000 },
  { month: "May", users: 167, stores: 127, revenue: 261000 },
];

const radarData = [
  { metric: "Revenue", A: 90 },
  { metric: "Signups", A: 75 },
  { metric: "Retention", A: 83 },
  { metric: "AI Usage", A: 60 },
  { metric: "Stores", A: 88 },
  { metric: "Engagement", A: 70 },
];

export default function Analytics({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.dashboard().then(setMetrics).catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Analytics" subtitle="Platform health and growth insights" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Key KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "MRR Growth", value: "↑ 18.4%", sub: "vs last month", color: "text-emerald-400" },
            { label: "Retention Rate", value: "91.2%", sub: "30-day cohort", color: "text-blue-400" },
            { label: "Churn Rate", value: "2.1%", sub: "monthly", color: "text-amber-400" },
            { label: "LTV", value: formatCurrency(metrics?.totalRevenue ? metrics.totalRevenue / Math.max(parseInt(metrics.totalUsers), 1) : 0), sub: "avg lifetime value", color: "text-violet-400" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-foreground font-medium mt-0.5">{label}</div>
              <div className="text-[11px] text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>

        {/* Growth chart + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Platform Growth</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "hsl(160 8% 55%)" }} />
                <Line yAxisId="left" type="monotone" dataKey="users" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 3 }} name="Users" />
                <Line yAxisId="left" type="monotone" dataKey="stores" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} name="Stores" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Business Types</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={businessTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {businessTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {businessTypeData.slice(0, 6).map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-[10px] text-muted-foreground truncate">{d.name}</span>
                  <span className="text-[10px] text-foreground font-medium ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar + Conversion funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Platform Health Score</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(160 15% 14%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(160 8% 40%)", fontSize: 9 }} />
                <Radar name="Score" dataKey="A" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Conversion Funnel</div>
            <div className="space-y-3">
              {[
                { label: "Visitors", count: 12400, pct: 100, color: "bg-emerald-500" },
                { label: "Signups", count: 2847, pct: 23, color: "bg-blue-500" },
                { label: "Active Users", count: 1632, pct: 13, color: "bg-violet-500" },
                { label: "Paid Stores", count: 891, pct: 7.2, color: "bg-amber-500" },
                { label: "Pro Users", count: 234, pct: 1.9, color: "bg-rose-500" },
              ].map((step) => (
                <div key={step.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{step.count.toLocaleString()}</span>
                      <span className="text-foreground font-bold w-10 text-right">{step.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${step.color} transition-all duration-700`} style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
