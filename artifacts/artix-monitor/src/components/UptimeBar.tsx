import type { CheckResult } from "@/hooks/useHealthMonitor";
import { cn } from "@/lib/utils";

interface Props {
  history: CheckResult[];
  maxBars?: number;
}

export function UptimeBar({ history, maxBars = 40 }: Props) {
  const bars = history.slice(0, maxBars).reverse();
  const placeholders = Math.max(0, maxBars - bars.length);

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={`p-${i}`}
          className="flex-1 h-8 rounded-sm bg-muted/30"
        />
      ))}
      {bars.map((check, i) => (
        <div
          key={i}
          title={`${check.timestamp.toLocaleTimeString()} — ${check.message}${check.responseTime != null ? ` (${check.responseTime}ms)` : ""}`}
          className={cn(
            "flex-1 rounded-sm transition-all",
            check.status === "ok"
              ? "bg-emerald-500 hover:bg-emerald-400"
              : "bg-red-500 hover:bg-red-400",
          )}
          style={{
            height: check.responseTime
              ? `${Math.min(100, Math.max(20, (check.responseTime / 500) * 100))}%`
              : "40%",
            minHeight: "8px",
            maxHeight: "32px",
          }}
        />
      ))}
    </div>
  );
}
