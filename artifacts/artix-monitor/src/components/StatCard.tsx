import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: ReactNode;
  accent?: "green" | "red" | "amber" | "default";
}

const accentMap = {
  green: "text-emerald-400",
  red: "text-red-400",
  amber: "text-amber-400",
  default: "text-zinc-400",
};

export function StatCard({ label, value, sub, icon, accent = "default" }: Props) {
  return (
    <div className="gradient-border rounded-xl glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className={cn("w-8 h-8 flex items-center justify-center rounded-lg bg-accent/50", accentMap[accent])}>
          {icon}
        </span>
      </div>
      <div>
        <div className={cn("text-2xl font-bold tabular-nums", accentMap[accent])}>
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
