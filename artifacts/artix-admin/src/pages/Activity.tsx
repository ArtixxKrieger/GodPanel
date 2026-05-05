import { useState } from "react";
import { ActivitySquare, UserPlus, Store, DollarSign, AlertTriangle, Brain, ShoppingCart, Filter } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import TopBar from "@/components/TopBar";

type EventType = "all" | "signup" | "store" | "payment" | "ban" | "ai" | "sale";

const typeConfig = {
  signup: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Signup" },
  store: { icon: Store, color: "text-blue-400", bg: "bg-blue-500/15", label: "Store" },
  payment: { icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15", label: "Payment" },
  ban: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15", label: "Ban" },
  ai: { icon: Brain, color: "text-violet-400", bg: "bg-violet-500/15", label: "AI" },
  sale: { icon: ShoppingCart, color: "text-teal-400", bg: "bg-teal-500/15", label: "Sale" },
};

const activities = [
  { id: "1", type: "signup" as const, message: "New user registered", detail: "juan.dela.cruz@example.com", ts: new Date(Date.now() - 2 * 60000), ip: "112.201.45.6" },
  { id: "2", type: "payment" as const, message: "Payment received", detail: "₱2,990.00 from Acme Store", ts: new Date(Date.now() - 7 * 60000), ip: "180.232.11.9" },
  { id: "3", type: "store" as const, message: "New subscription", detail: "Business Plan activated - Maria's Bakery", ts: new Date(Date.now() - 18 * 60000), ip: "119.92.88.3" },
  { id: "4", type: "ai" as const, message: "AI memory created", detail: "Maria's Bakery • 15 new entries added", ts: new Date(Date.now() - 35 * 60000), ip: "119.92.88.3" },
  { id: "5", type: "sale" as const, message: "Large transaction detected", detail: "₱45,000 sale processed at TechHub PH", ts: new Date(Date.now() - 52 * 60000), ip: "112.200.34.77" },
  { id: "6", type: "signup" as const, message: "User upgraded plan", detail: "Growth Plan → Business Plan", ts: new Date(Date.now() - 70 * 60000), ip: "49.149.12.8" },
  { id: "7", type: "ban" as const, message: "Account flagged", detail: "Suspicious activity detected on user #1049", ts: new Date(Date.now() - 90 * 60000), ip: "192.168.1.1" },
  { id: "8", type: "signup" as const, message: "New user registered", detail: "maria.santos@gmail.com", ts: new Date(Date.now() - 120 * 60000), ip: "112.201.99.2" },
  { id: "9", type: "payment" as const, message: "Refund processed", detail: "₱990.00 refund to user #987", ts: new Date(Date.now() - 145 * 60000), ip: "180.232.45.1" },
  { id: "10", type: "store" as const, message: "Store created", detail: "Kape Tayo — Food & Beverage", ts: new Date(Date.now() - 180 * 60000), ip: "49.149.67.4" },
  { id: "11", type: "ai" as const, message: "AI query processed", detail: "Customer asked for product recommendation", ts: new Date(Date.now() - 210 * 60000), ip: "112.201.45.6" },
  { id: "12", type: "sale" as const, message: "High-value sale", detail: "₱78,500 from SM Mini Store", ts: new Date(Date.now() - 240 * 60000), ip: "119.92.11.3" },
];

export default function Activity({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [filter, setFilter] = useState<EventType>("all");

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Activity Log" subtitle="Real-time platform events" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}
          >
            All Events
          </button>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key as EventType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key
                  ? `${cfg.bg} ${cfg.color} border border-current/30`
                  : "bg-card border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = activities.filter((a) => a.type === key).length;
            const Icon = cfg.icon;
            return (
              <div key={key} className="rounded-xl border border-border/60 bg-card p-3 text-center">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className={`text-lg font-bold ${cfg.color}`}>{count}</div>
                <div className="text-[10px] text-muted-foreground">{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {filtered.map((item, i) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            return (
              <div key={item.id} className={`flex items-start gap-4 p-4 ${i < filtered.length - 1 ? "border-b border-border/40" : ""} hover:bg-secondary/30 transition-colors`}>
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.message}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-muted-foreground">{formatRelative(item.ts.toISOString())}</div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{item.ip}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
