import { RefreshCw, ExternalLink } from "lucide-react";
import type { EndpointConfig, MonitorState } from "@/hooks/useHealthMonitor";
import { StatusBadge } from "./StatusBadge";
import { UptimeBar } from "./UptimeBar";
import { ResponseChart } from "./ResponseChart";
import { LogFeed } from "./LogFeed";
import { StatCard } from "./StatCard";
import { Activity, Timer, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  endpoint: EndpointConfig;
  state: MonitorState;
  onCheck: () => void;
}

export function EndpointCard({ endpoint, state, onCheck }: Props) {
  const avgResponseTime =
    state.history.length > 0
      ? Math.round(
          state.history
            .filter((h) => h.responseTime != null)
            .reduce((acc, h) => acc + (h.responseTime ?? 0), 0) /
            Math.max(
              1,
              state.history.filter((h) => h.responseTime != null).length
            )
        )
      : null;

  const isGlowing = state.status === "ok";

  return (
    <div
      className={cn(
        "gradient-border rounded-2xl glass overflow-hidden transition-all duration-500",
        isGlowing && "glow-green",
        state.status === "down" && "glow-red"
      )}
    >
      <div className="px-6 py-5 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">{endpoint.label}</h2>
              <StatusBadge status={state.isChecking ? "checking" : state.status} />
            </div>
            <a
              href={endpoint.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {endpoint.url}
              <ExternalLink size={10} />
            </a>
          </div>
          <button
            onClick={onCheck}
            disabled={state.isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={cn(state.isChecking && "animate-spin")}
            />
            Check now
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Status"
            value={state.status === "ok" ? "Healthy" : state.status === "down" ? "Down" : "—"}
            icon={<Activity size={14} />}
            accent={state.status === "ok" ? "green" : state.status === "down" ? "red" : "default"}
          />
          <StatCard
            label="Uptime"
            value={state.totalChecks > 0 ? `${state.uptime}%` : "—"}
            sub={`${state.successChecks}/${state.totalChecks} checks`}
            icon={<TrendingUp size={14} />}
            accent={state.uptime >= 99 ? "green" : state.uptime >= 95 ? "amber" : "red"}
          />
          <StatCard
            label="Response"
            value={state.responseTime != null ? `${state.responseTime}ms` : "—"}
            sub="latest"
            icon={<Timer size={14} />}
            accent={
              state.responseTime == null
                ? "default"
                : state.responseTime < 200
                ? "green"
                : state.responseTime < 600
                ? "amber"
                : "red"
            }
          />
          <StatCard
            label="Avg Response"
            value={avgResponseTime != null ? `${avgResponseTime}ms` : "—"}
            sub={`last ${state.history.length} checks`}
            icon={<CheckCircle2 size={14} />}
            accent={
              avgResponseTime == null
                ? "default"
                : avgResponseTime < 200
                ? "green"
                : avgResponseTime < 600
                ? "amber"
                : "red"
            }
          />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Response Time (last 30)
            </h3>
          </div>
          {state.history.length === 0 ? (
            <div className="h-40 shimmer rounded-lg" />
          ) : (
            <ResponseChart history={state.history} />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Uptime Bars (last {Math.min(40, state.history.length)} checks)
            </h3>
          </div>
          <div className="h-8 mt-5">
            <UptimeBar history={state.history} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Older</span>
            <span>Latest</span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Check Log
          </h3>
          <LogFeed history={state.history} />
        </div>
      </div>

      {state.lastChecked && (
        <div className="px-6 py-3 border-t border-border/50 text-xs text-muted-foreground">
          Last checked: {state.lastChecked.toLocaleString()} · Auto-refresh every{" "}
          {endpoint.intervalMs / 1000}s
        </div>
      )}
    </div>
  );
}
