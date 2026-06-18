import { useState } from "react";
import { Plus, X, RefreshCw, ExternalLink, HeartPulse, Activity, Timer, TrendingUp, CheckCircle2 } from "lucide-react";
import { useHealthMonitor, type EndpointConfig, type CheckResult, type HealthStatus } from "@/hooks/useHealthMonitor";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_ENDPOINTS: EndpointConfig[] = [
  {
    id: "healthz",
    label: "ArtixPOS API — /api/healthz",
    url: `${window.location.origin}${BASE}/api/healthz`,
    intervalMs: 30000,
  },
];

/* ── status badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: HealthStatus }) {
  const map: Record<HealthStatus, { label: string; dot: string; cls: string }> = {
    ok:       { label: "Operational", dot: "bg-emerald-400", cls: "text-emerald-400 ring-emerald-400/20 bg-emerald-400/10" },
    down:     { label: "Down",        dot: "bg-red-400",     cls: "text-red-400 ring-red-400/20 bg-red-400/10" },
    checking: { label: "Checking…",  dot: "bg-amber-400",   cls: "text-amber-400 ring-amber-400/20 bg-amber-400/10" },
    unknown:  { label: "Unknown",     dot: "bg-zinc-500",    cls: "text-zinc-400 ring-zinc-500/20 bg-zinc-500/10" },
  };
  const { label, dot, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full ring-1 px-2.5 py-0.5 text-xs font-medium", cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dot)} />
      {label}
    </span>
  );
}

/* ── mini stat card ───────────────────────────────────────────────── */
function MiniStat({
  label, value, sub, icon, accent = "muted",
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  accent?: "green" | "red" | "amber" | "muted";
}) {
  const color = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", muted: "text-muted-foreground" }[accent];
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn("w-7 h-7 flex items-center justify-center rounded-lg bg-secondary", color)}>{icon}</span>
      </div>
      <div className={cn("text-xl font-bold tabular-nums", color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ── uptime bars ──────────────────────────────────────────────────── */
function UptimeBars({ history }: { history: CheckResult[] }) {
  const bars = [...history].reverse().slice(-40);
  const placeholders = Math.max(0, 40 - bars.length);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: placeholders }).map((_, i) => (
        <div key={`p${i}`} className="flex-1 rounded-sm bg-secondary h-2" />
      ))}
      {bars.map((c, i) => (
        <div
          key={i}
          title={`${c.timestamp.toLocaleTimeString()} — ${c.message}${c.responseTime != null ? ` (${c.responseTime}ms)` : ""}`}
          className={cn(
            "flex-1 rounded-sm transition-all",
            c.status === "ok" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400",
          )}
          style={{
            height: c.responseTime
              ? `${Math.min(100, Math.max(25, (c.responseTime / 400) * 100))}%`
              : "40%",
          }}
        />
      ))}
    </div>
  );
}

/* ── response chart ───────────────────────────────────────────────── */
function ResponseChart({ history }: { history: CheckResult[] }) {
  const data = [...history].reverse().slice(-30).map((c) => ({
    time: c.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    ms: c.responseTime ?? null,
  }));
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="hm-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 12%)" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "hsl(160 10% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: "hsl(160 10% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} unit="ms" width={44} />
        <Tooltip
          contentStyle={{ background: "hsl(160 18% 6%)", border: "1px solid hsl(160 15% 12%)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "hsl(160 10% 55%)" }}
          formatter={(v: number) => [`${v}ms`, "Response"]}
        />
        <Area type="monotone" dataKey="ms" stroke="#34d399" strokeWidth={2} fill="url(#hm-grad)" dot={false} activeDot={{ r: 3, fill: "#34d399", strokeWidth: 0 }} connectNulls={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── check log ────────────────────────────────────────────────────── */
function CheckLog({ history }: { history: CheckResult[] }) {
  if (!history.length) return <div className="py-8 text-center text-xs text-muted-foreground">No checks yet…</div>;
  return (
    <div className="flex flex-col gap-0.5 font-mono text-xs max-h-52 overflow-y-auto">
      {history.slice(0, 15).map((c, i) => (
        <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg", i === 0 && "bg-secondary/60")}>
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.status === "ok" ? "bg-emerald-400" : "bg-red-400")} />
          <span className="text-muted-foreground flex-shrink-0">{c.timestamp.toLocaleTimeString()}</span>
          <span className={cn("font-semibold flex-shrink-0 w-8", c.status === "ok" ? "text-emerald-400" : "text-red-400")}>
            {c.status === "ok" ? "OK" : "FAIL"}
          </span>
          {c.statusCode && <span className="text-muted-foreground flex-shrink-0">HTTP {c.statusCode}</span>}
          <span className="text-foreground/80 truncate flex-1">{c.message}</span>
          {c.responseTime != null && <span className="ml-auto flex-shrink-0 text-muted-foreground">{c.responseTime}ms</span>}
        </div>
      ))}
    </div>
  );
}

/* ── single endpoint card ─────────────────────────────────────────── */
function EndpointCard({ endpoint, onRemove }: { endpoint: EndpointConfig; onRemove?: () => void }) {
  const { state, checkNow } = useHealthMonitor(endpoint);

  const avg =
    state.history.length > 0
      ? Math.round(
          state.history.filter((h) => h.responseTime != null).reduce((a, h) => a + (h.responseTime ?? 0), 0) /
          Math.max(1, state.history.filter((h) => h.responseTime != null).length),
        )
      : null;

  const rtAccent = (ms: number | null) =>
    ms == null ? "muted" : ms < 200 ? "green" : ms < 600 ? "amber" : "red";

  return (
    <div className={cn(
      "rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-500",
      state.status === "ok" && "border-emerald-500/20 shadow-[0_0_24px_hsl(158_64%_45%/0.08)]",
      state.status === "down" && "border-red-500/20 shadow-[0_0_24px_hsl(0_72%_51%/0.08)]",
    )}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-semibold text-foreground">{endpoint.label}</h3>
            <StatusBadge status={state.isChecking ? "checking" : state.status} />
          </div>
          <a href={endpoint.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            {endpoint.url}<ExternalLink size={9} />
          </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={checkNow} disabled={state.isChecking}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors disabled:opacity-50">
            <RefreshCw size={11} className={cn(state.isChecking && "animate-spin")} />
            Check now
          </button>
          {onRemove && (
            <button onClick={onRemove}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Status" value={state.status === "ok" ? "Healthy" : state.status === "down" ? "Down" : "—"}
          icon={<Activity size={13} />}
          accent={state.status === "ok" ? "green" : state.status === "down" ? "red" : "muted"} />
        <MiniStat label="Uptime" value={state.totalChecks > 0 ? `${state.uptime}%` : "—"}
          sub={`${state.successChecks}/${state.totalChecks} checks`}
          icon={<TrendingUp size={13} />}
          accent={state.uptime >= 99 ? "green" : state.uptime >= 95 ? "amber" : state.totalChecks === 0 ? "muted" : "red"} />
        <MiniStat label="Response" value={state.responseTime != null ? `${state.responseTime}ms` : "—"}
          sub="latest" icon={<Timer size={13} />} accent={rtAccent(state.responseTime)} />
        <MiniStat label="Avg Response" value={avg != null ? `${avg}ms` : "—"}
          sub={`last ${state.history.length} checks`} icon={<CheckCircle2 size={13} />} accent={rtAccent(avg)} />
      </div>

      {/* Charts */}
      <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Response Time (last 30)</p>
          {state.history.length === 0
            ? <div className="h-36 rounded-lg bg-secondary/50 animate-pulse" />
            : <ResponseChart history={state.history} />}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Uptime Bars (last {Math.min(40, state.history.length)} checks)
          </p>
          <div className="mt-5"><UptimeBars history={state.history} /></div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>Older</span><span>Latest</span>
          </div>
        </div>
        <div className="lg:col-span-2">
          <p className="text-xs text-muted-foreground mb-2">Check Log</p>
          <CheckLog history={state.history} />
        </div>
      </div>

      {state.lastChecked && (
        <div className="px-5 py-2.5 border-t border-border/50 text-[10px] text-muted-foreground">
          Last checked: {state.lastChecked.toLocaleString()} · Auto-refresh every {endpoint.intervalMs / 1000}s
        </div>
      )}
    </div>
  );
}

/* ── add endpoint form ────────────────────────────────────────────── */
function AddForm({ onAdd, onCancel }: { onAdd: (e: EndpointConfig) => void; onCancel: () => void }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [interval, setInterval] = useState("30");

  function submit() {
    const u = url.trim();
    if (!u) return;
    onAdd({ id: String(Date.now()), label: label.trim() || u, url: u, intervalMs: Math.max(5, parseInt(interval) || 30) * 1000 });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Add Endpoint</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className="sm:col-span-3 bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          placeholder="https://example.com/api/health"
          value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <input className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3">
          <input type="number" min={5} value={interval} onChange={(e) => setInterval(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent focus:outline-none" placeholder="30" />
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
        <div className="flex gap-2">
          <button onClick={submit} disabled={!url.trim()}
            className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity">
            Add
          </button>
          <button onClick={onCancel}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:bg-secondary/70 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────── */
export default function HealthMonitor({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(DEFAULT_ENDPOINTS);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Health Monitor"
        subtitle="Real-time API endpoint monitoring"
        onMenuOpen={onMenuOpen}
        actions={
          <button onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus size={12} />
            Add Endpoint
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Summary row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/60 text-xs">
            <HeartPulse size={13} className="text-emerald-400" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{endpoints.length}</span> endpoint{endpoints.length !== 1 ? "s" : ""} monitored
            </span>
          </div>
        </div>

        {showAdd && (
          <AddForm
            onAdd={(ep) => { setEndpoints((prev) => [...prev, ep]); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        )}

        {endpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <HeartPulse size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No endpoints monitored yet.</p>
            <button onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Add your first endpoint
            </button>
          </div>
        ) : (
          endpoints.map((ep) => (
            <EndpointCard
              key={ep.id}
              endpoint={ep}
              onRemove={endpoints.length > 1 ? () => setEndpoints((prev) => prev.filter((e) => e.id !== ep.id)) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
