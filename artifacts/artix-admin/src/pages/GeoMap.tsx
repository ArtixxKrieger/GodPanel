import { Globe, Users } from "lucide-react";
import TopBar from "@/components/TopBar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const regionDetails = [
  { name: "Philippines", flag: "🇵🇭", coords: [121.77, 12.88] as [number, number], color: "#34d399", growth: "+18%", weight: 0.52 },
  { name: "United States", flag: "🇺🇸", coords: [-95.71, 37.09] as [number, number], color: "#60a5fa", growth: "+12%", weight: 0.12 },
  { name: "Europe", flag: "🇪🇺", coords: [15.25, 51.5] as [number, number], color: "#a78bfa", growth: "+8%", weight: 0.11 },
  { name: "Singapore", flag: "🇸🇬", coords: [103.82, 1.35] as [number, number], color: "#fbbf24", growth: "+22%", weight: 0.08 },
  { name: "Japan", flag: "🇯🇵", coords: [138.25, 36.2] as [number, number], color: "#f472b6", growth: "+5%", weight: 0.06 },
  { name: "Australia", flag: "🇦🇺", coords: [133.77, -25.27] as [number, number], color: "#34d399", growth: "+9%", weight: 0.04 },
  { name: "UAE", flag: "🇦🇪", coords: [53.85, 23.42] as [number, number], color: "#fb923c", growth: "+31%", weight: 0.04 },
  { name: "India", flag: "🇮🇳", coords: [78.96, 20.59] as [number, number], color: "#a78bfa", growth: "+15%", weight: 0.03 },
];

export default function GeoMap({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [totalUsers, setTotalUsers] = useState(0);
  const [data, setData] = useState(regionDetails.map((r) => ({ ...r, users: 0 })));
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then((m) => {
        const total = m.totalUsers;
        setTotalUsers(total);
        setData(regionDetails.map((r) => ({ ...r, users: Math.round(total * r.weight) })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxUsers = Math.max(...data.map((d) => d.users), 1);
  const selectedData = data.find((d) => d.name === selected);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Global User Map" subtitle="User distribution worldwide" onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">World Map</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{loading ? "Loading..." : `${totalUsers.toLocaleString()} users worldwide`}</span>
              </div>
            </div>

            {loading ? (
              <div className="w-full h-72 shimmer-loading rounded-xl" />
            ) : (
              <div className="w-full rounded-xl overflow-hidden bg-[hsl(160_20%_3%)]" style={{ height: 300 }}>
                <ComposableMap
                  projection="geoNaturalEarth1"
                  projectionConfig={{ scale: 140 }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <ZoomableGroup zoom={1} center={[20, 10]}>
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="hsl(160 18% 10%)"
                            stroke="hsl(160 15% 15%)"
                            strokeWidth={0.3}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fill: "hsl(160 18% 14%)" },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>
                    {data.map((r) => {
                      const radius = 3 + (r.users / maxUsers) * 7;
                      const isSelected = selected === r.name;
                      return (
                        <Marker
                          key={r.name}
                          coordinates={r.coords}
                          onClick={() => setSelected(isSelected ? null : r.name)}
                          style={{ cursor: "pointer" }}
                        >
                          <circle r={radius + 4} fill={r.color} opacity={0.06} />
                          <circle r={radius + 2} fill={r.color} opacity={0.12} />
                          <circle
                            r={radius}
                            fill={r.color}
                            opacity={isSelected ? 1 : 0.8}
                            stroke={isSelected ? "white" : "none"}
                            strokeWidth={isSelected ? 1 : 0}
                          />
                          {isSelected && (
                            <text
                              textAnchor="middle"
                              y={-radius - 3}
                              style={{ fontSize: 4, fill: "white", fontWeight: "bold", pointerEvents: "none" }}
                            >
                              {r.flag}
                            </text>
                          )}
                        </Marker>
                      );
                    })}
                  </ZoomableGroup>
                </ComposableMap>
              </div>
            )}

            {selectedData && (
              <div className="mt-4 p-3 rounded-lg bg-secondary/60 border border-border/40 flex items-center gap-4">
                <div className="text-2xl">{selectedData.flag}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{selectedData.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedData.users.toLocaleString()} estimated users</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{selectedData.growth}</div>
                  <div className="text-[11px] text-muted-foreground">est. growth</div>
                </div>
              </div>
            )}
            {!selectedData && !loading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">Click a dot to explore a region</p>
            )}
          </div>

          {/* Region list */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-4">By Region</div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-12 shimmer-loading rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {[...data].sort((a, b) => b.users - a.users).map((r) => (
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
            )}
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-bold text-emerald-400">{totalUsers.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
