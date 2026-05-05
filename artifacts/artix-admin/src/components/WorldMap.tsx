import { useEffect, useState } from "react";
import { Globe, Users } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { api } from "@/lib/api";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const regions = [
  { name: "Philippines", flag: "🇵🇭", coords: [121.77, 12.88] as [number, number], weight: 0.52, color: "#34d399" },
  { name: "United States", flag: "🇺🇸", coords: [-95.71, 37.09] as [number, number], weight: 0.12, color: "#60a5fa" },
  { name: "Europe", flag: "🇪🇺", coords: [15.25, 51.5] as [number, number], weight: 0.11, color: "#a78bfa" },
  { name: "Singapore", flag: "🇸🇬", coords: [103.82, 1.35] as [number, number], weight: 0.08, color: "#fbbf24" },
  { name: "Japan", flag: "🇯🇵", coords: [138.25, 36.2] as [number, number], weight: 0.06, color: "#f472b6" },
  { name: "Australia", flag: "🇦🇺", coords: [133.77, -25.27] as [number, number], weight: 0.04, color: "#34d399" },
  { name: "UAE", flag: "🇦🇪", coords: [53.85, 23.42] as [number, number], weight: 0.04, color: "#fb923c" },
  { name: "India", flag: "🇮🇳", coords: [78.96, 20.59] as [number, number], weight: 0.03, color: "#a78bfa" },
];

export default function WorldMap() {
  const [data, setData] = useState(regions.map((r) => ({ ...r, users: 0 })));
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then((m) => {
        const total = m.totalUsers || 0;
        setTotalUsers(total);
        setData(regions.map((r) => ({ ...r, users: Math.round(total * r.weight) })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxUsers = Math.max(...data.map((r) => r.users), 1);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Users by Region</div>
          <div className="text-xs text-muted-foreground">Based on total platform users</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Globe className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {loading ? (
        <div className="w-full h-36 shimmer-loading rounded-xl mb-3" />
      ) : (
        <div className="w-full rounded-xl overflow-hidden bg-[hsl(160_20%_3%)] mb-3" style={{ height: 160 }}>
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 120 }}
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
                      style={{ default: { outline: "none" }, hover: { outline: "none", fill: "hsl(160 18% 14%)" }, pressed: { outline: "none" } }}
                    />
                  ))
                }
              </Geographies>
              {data.map((r) => {
                const radius = 2.5 + (r.users / maxUsers) * 5;
                return (
                  <Marker key={r.name} coordinates={r.coords}>
                    <circle r={radius + 3} fill={r.color} opacity={0.08} />
                    <circle r={radius + 1.5} fill={r.color} opacity={0.15} />
                    <circle r={radius} fill={r.color} opacity={0.85} />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      )}

      <div className="space-y-1.5">
        {data.slice(0, 5).map((r) => (
          <div key={r.name} className="flex items-center gap-2">
            <span className="text-sm">{r.flag}</span>
            <span className="text-xs text-muted-foreground flex-1">{r.name}</span>
            <span className="text-xs font-semibold text-foreground w-10 text-right">{r.users.toLocaleString()}</span>
            <div className="w-14 h-1 rounded-full bg-secondary overflow-hidden">
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
