import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CheckResult } from "@/hooks/useHealthMonitor";

interface Props {
  history: CheckResult[];
}

export function ResponseChart({ history }: Props) {
  const data = [...history]
    .reverse()
    .slice(-30)
    .map((c) => ({
      time: c.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      ms: c.responseTime ?? null,
      status: c.status,
    }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(158 64% 45%)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(158 64% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(158 15% 14%)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fill: "hsl(158 20% 55%)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "hsl(158 20% 55%)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          unit="ms"
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(160 18% 7%)",
            border: "1px solid hsl(158 15% 14%)",
            borderRadius: "8px",
            fontSize: 12,
            color: "hsl(158 30% 92%)",
          }}
          labelStyle={{ color: "hsl(158 20% 55%)" }}
          formatter={(value: number) => [`${value}ms`, "Response Time"]}
        />
        <Area
          type="monotone"
          dataKey="ms"
          stroke="hsl(158 64% 45%)"
          strokeWidth={2}
          fill="url(#respGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(158 64% 45%)", strokeWidth: 0 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
