import { Globe, Users } from "lucide-react";
import TopBar from "@/components/TopBar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const regionDetails = [
  { name: "Philippines", flag: "🇵🇭", code: "PH", x: 72, y: 46, color: "#34d399", growth: "+18%" },
  { name: "United States", flag: "🇺🇸", code: "US", x: 18, y: 30, color: "#60a5fa", growth: "+12%" },
  { name: "Europe", flag: "🇪🇺", code: "EU", x: 47, y: 24, color: "#a78bfa", growth: "+8%" },
  { name: "Singapore", flag: "🇸🇬", code: "SG", x: 70, y: 52, color: "#fbbf24", growth: "+22%" },
  { name: "Japan", flag: "🇯🇵", code: "JP", x: 78, y: 30, color: "#f472b6", growth: "+5%" },
  { name: "Australia", flag: "🇦🇺", code: "AU", x: 78, y: 65, color: "#34d399", growth: "+9%" },
  { name: "UAE", flag: "🇦🇪", code: "AE", x: 54, y: 38, color: "#fb923c", growth: "+31%" },
  { name: "India", flag: "🇮🇳", code: "IN", x: 62, y: 40, color: "#a78bfa", growth: "+15%" },
];

const weights = [0.52, 0.12, 0.11, 0.08, 0.06, 0.04, 0.04, 0.03];

export default function GeoMap() {
  const [users, setUsers] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState(regionDetails.map((r, i) => ({ ...r, users: 0 })));

  useEffect(() => {
    api.dashboard().then((m) => {
      const total = parseInt(m.totalUsers) || 1247;
      setUsers(total);
      setData(regionDetails.map((r, i) => ({ ...r, users: Math.round(total * weights[i]) })));
    }).catch(() => {
      const total = 1247;
      setUsers(total);
      setData(regionDetails.map((r, i) => ({ ...r, users: Math.round(total * weights[i]) })));
    });
  }, []);

  const maxUsers = Math.max(...data.map((d) => d.users), 1);
  const selectedData = data.find((d) => d.name === selected);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Global User Map" subtitle="User distribution worldwide" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Map + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Big Map */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">Interactive World Map</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{users.toLocaleString()} users worldwide</span>
              </div>
            </div>

            <div className="relative w-full bg-[hsl(160_20%_3%)] rounded-xl overflow-hidden" style={{ paddingBottom: "56%" }}>
              <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
                {/* Grid */}
                {[0, 50, 100, 150, 200].map((x) => (
                  <line key={`v${x}`} x1={x} y1={0} x2={x} y2={100} stroke="hsl(160 15% 8%)" strokeWidth="0.3" />
                ))}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={`h${y}`} x1={0} y1={y} x2={200} y2={y} stroke="hsl(160 15% 8%)" strokeWidth="0.3" />
                ))}

                {/* Continents */}
                <ellipse cx="36" cy="44" rx="24" ry="20" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="48" cy="76" rx="12" ry="16" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="94" cy="40" rx="10" ry="10" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="98" cy="68" rx="12" ry="18" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="132" cy="44" rx="32" ry="20" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="144" cy="76" rx="10" ry="8" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />
                <ellipse cx="156" cy="84" rx="14" ry="10" fill="hsl(160 18% 10%)" stroke="hsl(160 15% 14%)" strokeWidth="0.4" />

                {/* User dots */}
                {data.map((r) => {
                  const mappedX = (r.x / 100) * 200;
                  const mappedY = (r.y / 100) * 100;
                  const size = 1.5 + (r.users / maxUsers) * 4;
                  const isSelected = selected === r.name;
                  return (
                    <g key={r.name} className="cursor-pointer" onClick={() => setSelected(isSelected ? null : r.name)}>
                      <circle cx={mappedX} cy={mappedY} r={size + 3} fill={r.color} opacity={0.06} />
                      <circle cx={mappedX} cy={mappedY} r={size + 1.5} fill={r.color} opacity={0.12} />
                      <circle cx={mappedX} cy={mappedY} r={size} fill={r.color} opacity={isSelected ? 1 : 0.85} stroke={isSelected ? "white" : "none"} strokeWidth={isSelected ? "0.5" : "0"}>
                        <animate attributeName="r" values={`${size};${size + 1};${size}`} dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                      </circle>
                      {isSelected && (
                        <text x={mappedX + size + 1} y={mappedY - size} fontSize="3.5" fill="white" fontWeight="bold">{r.code}</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected region detail */}
            {selectedData && (
              <div className="mt-4 p-3 rounded-lg bg-secondary/60 border border-border/40 flex items-center gap-4">
                <div className="text-2xl">{selectedData.flag}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{selectedData.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedData.users.toLocaleString()} users</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{selectedData.growth}</div>
                  <div className="text-[11px] text-muted-foreground">growth</div>
                </div>
              </div>
            )}
          </div>

          {/* Region list */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">By Region</div>
            <div className="space-y-3">
              {data.sort((a, b) => b.users - a.users).map((r) => (
                <div
                  key={r.name}
                  onClick={() => setSelected(selected === r.name ? null : r.name)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                    selected === r.name ? "bg-secondary border border-border/80" : "hover:bg-secondary/40"
                  }`}
                >
                  <span className="text-lg">{r.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate">{r.name}</span>
                      <span className="text-[11px] text-emerald-400 font-medium">{r.growth}</span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(r.users / maxUsers) * 100}%`, background: r.color }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.users.toLocaleString()} users</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="text-xs text-muted-foreground text-center">Click a region or dot to explore</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
