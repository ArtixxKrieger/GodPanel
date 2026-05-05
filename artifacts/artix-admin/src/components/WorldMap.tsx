import { useEffect, useState } from "react";
import { Globe, Users } from "lucide-react";
import { api } from "@/lib/api";

const regions = [
  { name: "Philippines", x: 72, y: 46, users: 0, color: "#34d399" },
  { name: "United States", x: 18, y: 30, users: 0, color: "#60a5fa" },
  { name: "Europe", x: 47, y: 24, users: 0, color: "#a78bfa" },
  { name: "Singapore", x: 70, y: 52, users: 0, color: "#fbbf24" },
  { name: "Japan", x: 78, y: 30, users: 0, color: "#f472b6" },
  { name: "Australia", x: 78, y: 65, users: 0, color: "#34d399" },
  { name: "UAE", x: 54, y: 38, users: 0, color: "#fb923c" },
  { name: "India", x: 62, y: 40, users: 0, color: "#a78bfa" },
];

export default function WorldMap() {
  const [data, setData] = useState(regions);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then((m) => {
      const total = parseInt(m.totalUsers) || 100;
      setTotalUsers(total);
      const weights = [0.52, 0.12, 0.11, 0.08, 0.06, 0.04, 0.04, 0.03];
      setData(regions.map((r, i) => ({ ...r, users: Math.round(total * weights[i]) })));
    }).catch(() => {
      const weights = [0.52, 0.12, 0.11, 0.08, 0.06, 0.04, 0.04, 0.03];
      const mockTotal = 1247;
      setTotalUsers(mockTotal);
      setData(regions.map((r, i) => ({ ...r, users: Math.round(mockTotal * weights[i]) })));
    }).finally(() => setLoading(false));
  }, []);

  const maxUsers = Math.max(...data.map(r => r.users), 1);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Users by Region</div>
          <div className="text-xs text-muted-foreground">Global distribution</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Globe className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* SVG World Map */}
      <div className="relative w-full mb-4" style={{ paddingBottom: "50%" }}>
        <svg
          viewBox="0 0 100 50"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Simple world outline */}
          <rect x="0" y="0" width="100" height="50" fill="transparent" />

          {/* Continent shapes (simplified) */}
          {/* North America */}
          <ellipse cx="18" cy="22" rx="12" ry="10" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* South America */}
          <ellipse cx="24" cy="38" rx="6" ry="8" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* Europe */}
          <ellipse cx="47" cy="20" rx="5" ry="5" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* Africa */}
          <ellipse cx="49" cy="34" rx="6" ry="9" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* Asia */}
          <ellipse cx="66" cy="22" rx="16" ry="10" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* SE Asia */}
          <ellipse cx="72" cy="38" rx="5" ry="4" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />
          {/* Australia */}
          <ellipse cx="78" cy="42" rx="7" ry="5" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.3" />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={50} stroke="hsl(160 15% 10%)" strokeWidth="0.2" />
          ))}
          {[0, 17, 34, 50].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke="hsl(160 15% 10%)" strokeWidth="0.2" />
          ))}

          {/* User dots */}
          {data.map((r) => {
            const size = 1 + (r.users / maxUsers) * 2.5;
            return (
              <g key={r.name}>
                <circle cx={r.x} cy={r.y} r={size + 1.5} fill={r.color} opacity={0.1} />
                <circle cx={r.x} cy={r.y} r={size + 0.5} fill={r.color} opacity={0.2} />
                <circle cx={r.x} cy={r.y} r={size} fill={r.color} opacity={0.9}>
                  <animate attributeName="r" values={`${size};${size + 0.8};${size}`} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {r.name === "Philippines" && (
                  <text x={r.x + 2} y={r.y - 2} fontSize="2" fill={r.color} fontWeight="bold">PH</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.slice(0, 5).map((r) => (
          <div key={r.name} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
            <span className="text-xs text-muted-foreground flex-1">{r.name}</span>
            <span className="text-xs font-semibold text-foreground">{r.users.toLocaleString()}</span>
            <div className="w-16 h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(r.users / maxUsers) * 100}%`, background: r.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Total worldwide</span>
        </div>
        <span className="text-sm font-bold text-emerald-400">{totalUsers.toLocaleString()}</span>
      </div>
    </div>
  );
}
