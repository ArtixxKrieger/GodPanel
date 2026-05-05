import { Shield, Lock, AlertTriangle, CheckCircle2, Eye, Globe, RefreshCw } from "lucide-react";
import TopBar from "@/components/TopBar";
import { useState } from "react";

const securityChecks = [
  { label: "SSL/TLS Certificate", status: "ok", detail: "Valid until Dec 2026" },
  { label: "JWT Token Validation", status: "ok", detail: "Bearer auth active" },
  { label: "Rate Limiting", status: "ok", detail: "100 req/min per IP" },
  { label: "CORS Policy", status: "ok", detail: "Origin whitelist enforced" },
  { label: "SQL Injection Prevention", status: "ok", detail: "Parameterized queries" },
  { label: "XSS Protection", status: "warn", detail: "Review content policy" },
  { label: "2FA Admin Access", status: "warn", detail: "Recommended — not enabled" },
  { label: "IP Allowlist", status: "warn", detail: "No allowlist configured" },
];

const threatLog = [
  { id: "1", level: "medium", desc: "Multiple failed login attempts", ip: "45.154.12.33", time: "2m ago" },
  { id: "2", level: "low", desc: "Unusual API access pattern", ip: "192.0.2.44", time: "18m ago" },
  { id: "3", level: "high", desc: "Possible credential stuffing", ip: "198.51.100.7", time: "1h ago" },
  { id: "4", level: "low", desc: "Rate limit triggered", ip: "203.0.113.99", time: "2h ago" },
];

export default function Security({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [scanLoading, setScanLoading] = useState(false);
  const [lastScan, setLastScan] = useState("3 minutes ago");

  const runScan = () => {
    setScanLoading(true);
    setTimeout(() => {
      setScanLoading(false);
      setLastScan("just now");
    }, 2000);
  };

  const okCount = securityChecks.filter((c) => c.status === "ok").length;
  const warnCount = securityChecks.filter((c) => c.status === "warn").length;
  const score = Math.round((okCount / securityChecks.length) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Security Center" subtitle="Platform security overview & threat monitoring" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border/60 bg-card p-6 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(160 15% 12%)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171"}
                  strokeWidth="10"
                  strokeDasharray={`${(score / 100) * 251.3} 251.3`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{score}</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground">Security Score</div>
            <div className="text-xs text-muted-foreground mt-1">
              {score >= 80 ? "Good — keep it up" : "Improvements needed"}
            </div>
            <button
              onClick={runScan}
              disabled={scanLoading}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanLoading ? "animate-spin" : ""}`} />
              {scanLoading ? "Scanning..." : "Run Scan"}
            </button>
            <div className="text-[11px] text-muted-foreground mt-2">Last scan: {lastScan}</div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">Security Checks</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {securityChecks.map((check) => (
                <div key={check.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40">
                  {check.status === "ok" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-foreground">{check.label}</div>
                    <div className="text-[11px] text-muted-foreground">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat log */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-foreground">Threat Log</div>
            <span className="text-xs text-muted-foreground">{threatLog.length} events today</span>
          </div>
          <div className="space-y-2">
            {threatLog.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  t.level === "high" ? "bg-red-400" : t.level === "medium" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{t.desc}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{t.ip}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    t.level === "high" ? "bg-red-500/15 text-red-400 border-red-500/25" :
                    t.level === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                    "bg-blue-500/15 text-blue-400 border-blue-500/25"
                  }`}>{t.level}</span>
                  <span className="text-[11px] text-muted-foreground">{t.time}</span>
                  <button className="p-1.5 rounded hover:bg-secondary transition-colors">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
