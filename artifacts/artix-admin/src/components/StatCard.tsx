import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconColor?: string;
  glowColor?: string;
  chart?: ReactNode;
}

export default function StatCard({
  title, value, change, changeLabel, icon, iconColor = "bg-emerald-500/20 text-emerald-400", glowColor = "bg-emerald-400", chart
}: StatCardProps) {
  const positive = !change || change >= 0;
  return (
    <div className="stat-card group">
      <div className={cn("absolute top-3 right-3 w-16 h-16 rounded-full filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity", glowColor)} />
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", iconColor)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      {changeLabel && <div className="text-[11px] text-muted-foreground/70 mt-1">{changeLabel}</div>}
      {chart && <div className="mt-3">{chart}</div>}
    </div>
  );
}
