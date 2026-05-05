import { useEffect, useState } from "react";
import { Activity, UserPlus, Store, DollarSign, AlertTriangle, Brain, ShoppingCart } from "lucide-react";
import { formatRelative } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "signup" | "store" | "payment" | "ban" | "ai" | "sale";
  message: string;
  detail: string;
  timestamp: Date;
}

const typeConfig = {
  signup: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  store: { icon: Store, color: "text-blue-400", bg: "bg-blue-500/15" },
  payment: { icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15" },
  ban: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15" },
  ai: { icon: Brain, color: "text-violet-400", bg: "bg-violet-500/15" },
  sale: { icon: ShoppingCart, color: "text-teal-400", bg: "bg-teal-500/15" },
};

const mockActivity: ActivityItem[] = [
  { id: "1", type: "signup", message: "New user registered", detail: "juan.dela.cruz@example.com", timestamp: new Date(Date.now() - 2 * 60000) },
  { id: "2", type: "payment", message: "Payment received", detail: "₱2,990.00 from Acme Store", timestamp: new Date(Date.now() - 7 * 60000) },
  { id: "3", type: "store", message: "New subscription", detail: "Business Plan activated", timestamp: new Date(Date.now() - 18 * 60000) },
  { id: "4", type: "ai", message: "AI memory created", detail: "Maria's Bakery • 15 entries", timestamp: new Date(Date.now() - 35 * 60000) },
  { id: "5", type: "sale", message: "Large transaction", detail: "₱45,000 sale processed", timestamp: new Date(Date.now() - 52 * 60000) },
  { id: "6", type: "signup", message: "User upgraded plan", detail: "Growth → Business Plan", timestamp: new Date(Date.now() - 70 * 60000) },
  { id: "7", type: "ban", message: "Account flagged", detail: "Suspicious activity detected", timestamp: new Date(Date.now() - 90 * 60000) },
];

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>(mockActivity);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: ActivityItem = {
        id: Date.now().toString(),
        type: ["signup", "payment", "sale", "ai"][Math.floor(Math.random() * 4)] as any,
        message: ["New user registered", "Payment received", "Sale completed", "AI query processed"][Math.floor(Math.random() * 4)],
        detail: "Live update",
        timestamp: new Date(),
      };
      setItems((prev) => [newItem, ...prev].slice(0, 10));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Recent Activity</div>
          <div className="text-xs text-muted-foreground">Live platform events</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{item.message}</div>
                <div className="text-[11px] text-muted-foreground truncate">{item.detail}</div>
              </div>
              <div className="text-[11px] text-muted-foreground/60 flex-shrink-0">
                {formatRelative(item.timestamp.toISOString())}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40">
        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
}
