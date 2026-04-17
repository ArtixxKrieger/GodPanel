import { useGetAiUsage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Search, Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function AiUsage() {
  const { data: usage, isLoading } = useGetAiUsage();
  const [search, setSearch] = useState("");

  const totalMemories = useMemo(() => usage?.reduce((sum, u) => sum + u.memoryCount, 0) ?? 0, [usage]);
  const activeStores = useMemo(() => usage?.filter(u => u.memoryCount > 0).length ?? 0, [usage]);
  const maxCount = useMemo(() => Math.max(...(usage?.map(u => u.memoryCount) ?? [1])), [usage]);

  const filtered = useMemo(() =>
    usage?.filter(u =>
      u.storeName.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenantId?.toLowerCase().includes(search.toLowerCase()))
    ) ?? [],
    [usage, search]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Usage</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Monitor AI memory consumption across all merchants.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total AI Memories", value: totalMemories.toLocaleString(), icon: BrainCircuit, color: "text-primary", bg: "bg-primary/10" },
          { label: "Stores Using AI", value: activeStores.toString(), icon: Sparkles, color: "text-violet-400", bg: "bg-violet-400/10" },
          { label: "Avg per Store", value: activeStores > 0 ? Math.round(totalMemories / activeStores).toLocaleString() : "0", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="bg-card/50 border-border/60 col-span-1 last:col-span-2 sm:last:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                </div>
                {isLoading ? <Skeleton className="h-7 w-16" /> : (
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" /> Usage per Store
              </CardTitle>
              <CardDescription>AI memory embeddings stored per merchant</CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stores…"
                className="pl-9 h-9 bg-background/50 border-border/60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No AI usage data found.</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {filtered.map((entry) => {
                const pct = maxCount > 0 ? (entry.memoryCount / maxCount) * 100 : 0;
                return (
                  <li key={entry.userId} className="px-4 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <BrainCircuit className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{entry.storeName}</p>
                          <span className="text-sm font-bold text-primary shrink-0">{entry.memoryCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-xs text-muted-foreground font-mono truncate">{entry.tenantId || "—"}</p>
                          {entry.lastActivity && (
                            <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                              · {format(new Date(entry.lastActivity), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
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
