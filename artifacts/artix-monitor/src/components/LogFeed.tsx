import type { CheckResult } from "@/hooks/useHealthMonitor";
import { cn } from "@/lib/utils";

interface Props {
  history: CheckResult[];
}

export function LogFeed({ history }: Props) {
  const entries = history.slice(0, 12);

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No checks yet…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 font-mono text-xs">
      {entries.map((c, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            i === 0 && "bg-accent/40"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              c.status === "ok" ? "bg-emerald-400" : "bg-red-400"
            )}
          />
          <span className="text-muted-foreground flex-shrink-0">
            {c.timestamp.toLocaleTimeString()}
          </span>
          <span
            className={cn(
              "font-semibold flex-shrink-0",
              c.status === "ok" ? "text-emerald-400" : "text-red-400"
            )}
          >
            {c.status === "ok" ? "OK" : "FAIL"}
          </span>
          {c.statusCode && (
            <span className="text-muted-foreground flex-shrink-0">
              HTTP {c.statusCode}
            </span>
          )}
          <span className="text-foreground/80 truncate">{c.message}</span>
          {c.responseTime != null && (
            <span className="ml-auto flex-shrink-0 text-muted-foreground">
              {c.responseTime}ms
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
