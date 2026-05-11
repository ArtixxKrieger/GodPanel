import { Shield, Lock, AlertTriangle, CheckCircle2, Eye, RefreshCw, X, Globe, Clock, Zap, Terminal, MapPin, User } from "lucide-react";
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

type ThreatEvent = {
  id: string;
  level: "high" | "medium" | "low";
  type: string;
  desc: string;
  ip: string;
  country: string;
  countryCode: string;
  time: string;
  timestamp: string;
  endpoint: string;
  method: string;
  userAgent: string;
  attempts?: number;
  actionTaken: string;
  requestId: string;
  asn: string;
};

const threatLog: ThreatEvent[] = [
  {
    id: "1",
    level: "medium",
    type: "Brute Force",
    desc: "Multiple failed login attempts",
    ip: "45.154.12.33",
    country: "Russia",
    countryCode: "RU",
    time: "2m ago",
    timestamp: "2026-05-11 08:10:14 UTC",
    endpoint: "POST /api/auth/login",
    method: "POST",
    userAgent: "python-requests/2.28.0",
    attempts: 47,
    actionTaken: "IP temporarily rate-limited (15 min block)",
    requestId: "req_9xKm2pQvT8",
    asn: "AS20473 Choopa LLC",
  },
  {
    id: "2",
    level: "low",
    type: "Anomalous Access",
    desc: "Unusual API access pattern",
    ip: "192.0.2.44",
    country: "Netherlands",
    countryCode: "NL",
    time: "18m ago",
    timestamp: "2026-05-11 07:54:22 UTC",
    endpoint: "GET /api/admin/users?limit=1000",
    method: "GET",
    userAgent: "curl/7.88.1",
    attempts: undefined,
    actionTaken: "Flagged for review — access logged",
    requestId: "req_3nRq7wXcL1",
    asn: "AS60781 LeaseWeb Netherlands B.V.",
  },
  {
    id: "3",
    level: "high",
    type: "Credential Stuffing",
    desc: "Possible credential stuffing attack",
    ip: "198.51.100.7",
    country: "United States",
    countryCode: "US",
    time: "1h ago",
    timestamp: "2026-05-11 07:12:05 UTC",
    endpoint: "POST /api/auth/login",
    method: "POST",
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)",
    attempts: 312,
    actionTaken: "IP permanently blocked — abuse report filed",
    requestId: "req_7hGd4sBmF5",
    asn: "AS7018 AT&T Services Inc.",
  },
  {
    id: "4",
    level: "low",
    type: "Rate Limit",
    desc: "Rate limit triggered",
    ip: "203.0.113.99",
    country: "Singapore",
    countryCode: "SG",
    time: "2h ago",
    timestamp: "2026-05-11 06:08:47 UTC",
    endpoint: "POST /api/sales",
    method: "POST",
    userAgent: "axios/1.4.0",
    attempts: 8,
    actionTaken: "429 returned — client backoff enforced",
    requestId: "req_2pLm9cVnY6",
    asn: "AS9506 Singtel Fibre Broadband",
  },
];

const LEVEL_STYLES = {
  high: {
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
    header: "border-red-500/30 bg-red-500/5",
    icon: "text-red-400",
  },
  medium: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    header: "border-amber-500/30 bg-amber-500/5",
    icon: "text-amber-400",
  },
  low: {
    dot: "bg-blue-400",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    header: "border-blue-500/30 bg-blue-500/5",
    icon: "text-blue-400",
  },
};

function ThreatDetailModal({ event, onClose }: { event: ThreatEvent; onClose: () => void }) {
  const s = LEVEL_STYLES[event.level];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className={`flex items-center justify-between px-5 py-4 border-b ${s.header}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <span className="font-semibold text-foreground">{event.type}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${s.badge}`}>
              {event.level}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-foreground font-medium">{event.desc}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                <Globe className="w-3 h-3" /> IP Address
              </div>
              <div className="font-mono text-sm text-foreground">{event.ip}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />{event.country} ({event.countryCode})
              </div>
              <div className="text-[10px] text-muted-foreground">{event.asn}</div>
            </div>

            <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                <Clock className="w-3 h-3" /> Timestamp
              </div>
              <div className="text-sm text-foreground">{event.time}</div>
              <div className="text-[11px] text-muted-foreground">{event.timestamp}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{event.requestId}</div>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Terminal className="w-3 h-3" /> Request Details
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono font-semibold">{event.method}</span>
              <span className="font-mono text-xs text-foreground truncate">{event.endpoint}</span>
            </div>
            {event.attempts !== undefined && (
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{event.attempts}</span> attempts detected
              </div>
            )}
          </div>

          <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <User className="w-3 h-3" /> User Agent
            </div>
            <div className="font-mono text-[11px] text-muted-foreground break-all">{event.userAgent}</div>
          </div>

          <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Zap className="w-3 h-3" /> Action Taken
            </div>
            <div className="text-sm text-foreground">{event.actionTaken}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Security({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [scanLoading, setScanLoading] = useState(false);
  const [lastScan, setLastScan] = useState("3 minutes ago");
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);

  const runScan = () => {
    setScanLoading(true);
    setTimeout(() => {
      setScanLoading(false);
      setLastScan("just now");
    }, 2000);
  };

  const okCount = securityChecks.filter((c) => c.status === "ok").length;
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
            {threatLog.map((t) => {
              const s = LEVEL_STYLES[t.level];
              return (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{t.type}</span>
                      <span className="text-[11px] text-muted-foreground">—</span>
                      <span className="text-[11px] text-muted-foreground">{t.desc}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground font-mono">{t.ip}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{t.country}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[180px]">{t.endpoint}</span>
                    </div>
                    {t.attempts !== undefined && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-semibold">{t.attempts}</span> attempts
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.badge}`}>{t.level}</span>
                    <span className="text-[11px] text-muted-foreground hidden sm:block">{t.time}</span>
                    <button
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      onClick={() => setSelectedEvent(t)}
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <ThreatDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
