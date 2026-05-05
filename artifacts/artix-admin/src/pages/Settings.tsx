import { useState } from "react";
import { Settings, Bell, Shield, Globe, Key, Save, RefreshCw, Zap } from "lucide-react";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [apiHealth, setApiHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const h = await api.health();
      setApiHealth(h);
    } catch (e) {
      setApiHealth({ status: "error" });
    } finally {
      setChecking(false);
    }
  };

  const [notif, setNotif] = useState({ email: true, webhook: false, slack: false });
  const [limits, setLimits] = useState({ maxUsers: "10000", maxStores: "5000", rateLimit: "100" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Settings" subtitle="Admin panel configuration" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* API Health */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">API Health Check</span>
            </div>
            <button
              onClick={checkHealth}
              disabled={checking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors text-xs text-muted-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
              Check
            </button>
          </div>

          {apiHealth ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiHealth.status === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs font-medium text-foreground">Status: {apiHealth.status}</span>
              </div>
              {apiHealth.services && Object.entries(apiHealth.services).map(([name, svc]: any) => (
                <div key={name} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${svc.status === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-foreground capitalize">{name}</span>
                  </div>
                  <span className="text-muted-foreground">{svc.latencyMs}ms</span>
                </div>
              ))}
              {apiHealth.uptime !== undefined && (
                <div className="text-xs text-muted-foreground">Uptime: {apiHealth.uptime}s</div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Click "Check" to test the API connection</div>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Notifications</span>
          </div>
          <div className="space-y-3">
            {[
              { key: "email" as const, label: "Email Alerts", desc: "Receive critical alerts via email" },
              { key: "webhook" as const, label: "Webhook", desc: "POST events to a custom endpoint" },
              { key: "slack" as const, label: "Slack Integration", desc: "Send alerts to a Slack channel" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <button
                  onClick={() => setNotif((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${notif[key] ? "bg-emerald-500" : "bg-secondary border border-border"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notif[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform limits */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-foreground">Platform Limits</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "maxUsers" as const, label: "Max Users", placeholder: "10000" },
              { key: "maxStores" as const, label: "Max Stores", placeholder: "5000" },
              { key: "rateLimit" as const, label: "Rate Limit (req/min)", placeholder: "100" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
                <input
                  type="number"
                  value={limits[key]}
                  onChange={(e) => setLimits((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Admin password */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-foreground">Admin Credentials</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:opacity-90"
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
