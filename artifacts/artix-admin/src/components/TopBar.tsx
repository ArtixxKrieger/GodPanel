import { useState, useEffect } from "react";
import { Bell, Search, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [health, setHealth] = useState<{ status: string; latency?: number } | null>(null);
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const check = async () => {
      const t0 = Date.now();
      try {
        const h = await api.health();
        setHealth({ status: h.status, latency: Date.now() - t0 });
      } catch {
        setHealth({ status: "error" });
      }
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-border/60 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 pl-9 pr-4 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono border border-border/60 rounded px-1">⌘K</span>
      </div>

      {/* Time */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs font-mono text-foreground">
          {time.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {time.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* API Status */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs">
        {health?.status === "ok" ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium hidden sm:block">{health.latency}ms</span>
          </>
        ) : health ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 hidden sm:block">Down</span>
          </>
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </button>

      {/* Admin avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        A
      </div>
    </header>
  );
}
