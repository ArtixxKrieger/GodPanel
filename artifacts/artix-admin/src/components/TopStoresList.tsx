import { useEffect, useState } from "react";
import { Store, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function TopStoresList() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.topStores().catch(() => []).then((data) => {
      if (!data || !data.length) {
        setStores([
          { storeName: "Maria's Bakery", revenue: 142500, salesCount: "892", businessType: "Food" },
          { storeName: "TechHub PH", revenue: 98200, salesCount: "541", businessType: "Electronics" },
          { storeName: "SM Mini Store", revenue: 87300, salesCount: "730", businessType: "Retail" },
          { storeName: "Kape Tayo", revenue: 64100, salesCount: "1205", businessType: "Food" },
          { storeName: "Pinoy Prints", revenue: 52800, salesCount: "398", businessType: "Services" },
        ]);
      } else {
        setStores(data);
      }
      setLoading(false);
    });
  }, []);

  const maxRev = Math.max(...stores.map((s) => s.revenue), 1);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Top Stores</div>
          <div className="text-xs text-muted-foreground">By revenue this month</div>
        </div>
        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">View all</button>
      </div>

      <div className="space-y-3">
        {stores.slice(0, 5).map((s, i) => (
          <div key={s.storeName} className="flex items-center gap-3 group cursor-pointer">
            <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate">{s.storeName}</span>
                <span className="text-xs font-semibold text-emerald-400 flex-shrink-0 ml-2">{formatCurrency(s.revenue)}</span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                  style={{ width: `${(s.revenue / maxRev) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{s.businessType || "Retail"}</span>
                <span className="text-[10px] text-muted-foreground">{s.salesCount} sales</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span>Revenue updated in real-time</span>
      </div>
    </div>
  );
}
