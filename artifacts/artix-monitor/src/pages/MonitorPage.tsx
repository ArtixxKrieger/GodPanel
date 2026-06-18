import { useState } from "react";
import { Plus, X, Activity, Shield } from "lucide-react";
import { useHealthMonitor, type EndpointConfig } from "@/hooks/useHealthMonitor";
import { EndpointCard } from "@/components/EndpointCard";
import { StatusBadge } from "@/components/StatusBadge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_ENDPOINTS: EndpointConfig[] = [
  {
    id: "healthz",
    label: "ArtixPOS API Health",
    url: `${window.location.origin}${BASE}/api/healthz`,
    intervalMs: 30000,
  },
];

function SingleMonitor({
  endpoint,
  onRemove,
}: {
  endpoint: EndpointConfig;
  onRemove?: () => void;
}) {
  const { state, checkNow } = useHealthMonitor(endpoint);
  return (
    <div className="relative">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-destructive/20 hover:bg-destructive/40 text-destructive flex items-center justify-center transition-colors"
          title="Remove endpoint"
        >
          <X size={12} />
        </button>
      )}
      <EndpointCard endpoint={endpoint} state={state} onCheck={checkNow} />
    </div>
  );
}

let nextId = 2;

export function MonitorPage() {
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(DEFAULT_ENDPOINTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newInterval, setNewInterval] = useState("30");

  function addEndpoint() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const label = newLabel.trim() || trimmed;
    setEndpoints((prev) => [
      ...prev,
      {
        id: String(nextId++),
        label,
        url: trimmed,
        intervalMs: Math.max(5, parseInt(newInterval) || 30) * 1000,
      },
    ]);
    setNewUrl("");
    setNewLabel("");
    setNewInterval("30");
    setShowAdd(false);
  }

  function removeEndpoint(id: string) {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 glass border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-green-sm">
              <Activity size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">ArtixPOS Monitor</h1>
              <p className="text-xs text-muted-foreground">API Health Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield size={12} className="text-primary" />
              <span>{endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""} monitored</span>
            </div>
            <button
              onClick={() => setShowAdd((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={12} />
              Add Endpoint
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {showAdd && (
          <div className="gradient-border rounded-xl glass p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Add Endpoint</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                className="col-span-1 sm:col-span-3 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/api/health"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEndpoint()}
              />
              <input
                className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Label (optional)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3">
                <input
                  type="number"
                  min={5}
                  className="flex-1 py-2 text-sm text-foreground bg-transparent focus:outline-none"
                  placeholder="30"
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">sec interval</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addEndpoint}
                  disabled={!newUrl.trim()}
                  className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {endpoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center">
              <Activity size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No endpoints monitored yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Add your first endpoint
            </button>
          </div>
        ) : (
          endpoints.map((ep) => (
            <SingleMonitor
              key={ep.id}
              endpoint={ep}
              onRemove={endpoints.length > 1 ? () => removeEndpoint(ep.id) : undefined}
            />
          ))
        )}
      </main>

      <footer className="border-t border-border/50 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>ArtixPOS Monitor</span>
          <StatusBadge status="ok" />
        </div>
      </footer>
    </div>
  );
}
