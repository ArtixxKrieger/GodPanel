import { useEffect, useState } from "react";
import { Brain, Search, Zap, TrendingUp, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { formatRelative, getInitials, avatarColor } from "@/lib/utils";
import TopBar from "@/components/TopBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AIUsage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.aiUsage().then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((d) =>
    !search || d.storeName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => parseInt(b.memoryCount) - parseInt(a.memoryCount));
  const totalMemories = data.reduce((sum, d) => sum + (parseInt(d.memoryCount) || 0), 0);
  const maxMem = Math.max(...data.map((d) => parseInt(d.memoryCount) || 0), 1);

  const chartData = sorted.slice(0, 10).map((d) => ({
    name: d.storeName.length > 12 ? d.storeName.slice(0, 12) + "…" : d.storeName,
    memories: parseInt(d.memoryCount) || 0,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="AI Usage" subtitle="Memory usage per store" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Stores Using AI", value: data.length, color: "text-violet-400" },
            { label: "Total Memory Entries", value: totalMemories.toLocaleString(), color: "text-emerald-400" },
            { label: "Avg Per Store", value: data.length ? Math.round(totalMemories / data.length) : 0, color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="text-sm font-semibold text-foreground mb-4">Top 10 AI Memory Usage</div>
          {loading ? (
            <div className="h-48 shimmer-loading rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No AI usage data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(160 8% 55%)", fontSize: 9 }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(160 8% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [v, "Memories"]}
                />
                <Bar dataKey="memories" fill="hsl(262 52% 55%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text" placeholder="Search stores..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* List */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Store</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Memory Usage</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Usage Bar</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {[...Array(4)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 shimmer-loading rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No data</td></tr>
              ) : sorted.map((item) => (
                <tr key={item.userId} className="data-table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(item.userId)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {getInitials(item.storeName)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{item.storeName}</div>
                        <div className="text-muted-foreground text-[10px]">{item.tenantId || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-violet-400" />
                      <span className="font-bold text-violet-400">{item.memoryCount}</span>
                      <span className="text-muted-foreground">entries</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 w-40">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                        style={{ width: `${((parseInt(item.memoryCount) || 0) / maxMem) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatRelative(item.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
