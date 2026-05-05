import { useEffect, useState } from "react";
import { UserPlus, Store, DollarSign, AlertTriangle, Brain, ShoppingCart, RefreshCw } from "lucide-react";
import { api, AdminUser } from "@/lib/api";
import { formatRelative, formatCurrency } from "@/lib/utils";
import TopBar from "@/components/TopBar";

type EventType = "signup" | "store" | "payment" | "ban" | "ai" | "sale";

interface ActivityEvent {
  id: string;
  type: EventType;
  message: string;
  detail: string;
  ts: string;
}

const typeConfig = {
  signup: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Signup" },
  store: { icon: Store, color: "text-blue-400", bg: "bg-blue-500/15", label: "Store" },
  payment: { icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15", label: "Revenue" },
  ban: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15", label: "Banned" },
  ai: { icon: Brain, color: "text-violet-400", bg: "bg-violet-500/15", label: "AI" },
  sale: { icon: ShoppingCart, color: "text-teal-400", bg: "bg-teal-500/15", label: "Sale" },
};

type FilterType = "all" | EventType;

export default function Activity({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const buildEvents = (users: AdminUser[], aiData: any[], topStores: any[]): ActivityEvent[] => {
    const evts: ActivityEvent[] = [];

    // Signups from users with a createdAt
    users
      .filter((u) => u.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 8)
      .forEach((u) => {
        evts.push({
          id: `signup-${u.id}`,
          type: "signup",
          message: "New user registered",
          detail: `${u.name || "Unknown"} — ${u.email}`,
          ts: u.createdAt!,
        });
      });

    // Banned users
    users
      .filter((u) => u.isBanned && u.createdAt)
      .slice(0, 3)
      .forEach((u) => {
        evts.push({
          id: `ban-${u.id}`,
          type: "ban",
          message: "Account suspended",
          detail: `${u.name || "Unknown"} (${u.email})`,
          ts: u.createdAt!,
        });
      });

    // Stores with stores
    users
      .filter((u) => u.storeName && u.createdAt)
      .slice(0, 5)
      .forEach((u) => {
        evts.push({
          id: `store-${u.id}`,
          type: "store",
          message: "Store created",
          detail: `${u.storeName}${u.businessType ? ` — ${u.businessType}` : ""}`,
          ts: u.createdAt!,
        });
      });

    // Revenue from top stores
    topStores.slice(0, 5).forEach((s, i) => {
      evts.push({
        id: `rev-${s.userId}-${i}`,
        type: "payment",
        message: "Revenue recorded",
        detail: `${s.storeName} — ${formatCurrency(s.revenue)} total`,
        ts: new Date(Date.now() - (i + 1) * 3600000 * 4).toISOString(),
      });
    });

    // AI usage
    aiData
      .filter((a) => a.lastActivity)
      .slice(0, 6)
      .forEach((a) => {
        evts.push({
          id: `ai-${a.userId}`,
          type: "ai",
          message: "AI memories updated",
          detail: `${a.storeName} — ${a.memoryCount} entries`,
          ts: a.lastActivity!,
        });
      });

    // Sort all by date descending
    return evts.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  };

  const load = async () => {
    setLoading(true);
    try {
      const [users, ai, topStores] = await Promise.all([
        api.users(),
        api.aiUsage(),
        api.topStores(),
      ]);
      setEvents(buildEvents(users, ai, topStores));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = Object.keys(typeConfig).reduce((acc, k) => {
    acc[k as EventType] = events.filter((e) => e.type === k).length;
    return acc;
  }, {} as Record<EventType, number>);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Activity Log" subtitle="Built from live platform data" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* Type counts */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="rounded-xl border border-border/60 bg-card p-3 text-center">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className={`text-lg font-bold ${cfg.color}`}>{loading ? "—" : counts[key]}</div>
                <div className="text-[10px] text-muted-foreground">{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}
          >
            All ({events.length})
          </button>
          {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key
                  ? `${cfg.bg} ${cfg.color} border border-current/30`
                  : "bg-card border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cfg.label}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-border/40">
                <div className="w-8 h-8 shimmer-loading rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 shimmer-loading rounded w-48" />
                  <div className="h-3 shimmer-loading rounded w-64" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No events found</div>
          ) : (
            filtered.map((item, i) => {
              const cfg = typeConfig[item.type];
              const Icon = cfg.icon;
              return (
                <div key={item.id} className={`flex items-start gap-4 p-4 ${i < filtered.length - 1 ? "border-b border-border/40" : ""} hover:bg-secondary/30 transition-colors`}>
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.message}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.detail}</div>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatRelative(item.ts)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
