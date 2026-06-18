import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/hooks/useHealthMonitor";

interface Props {
  status: HealthStatus;
  large?: boolean;
}

const config: Record<HealthStatus, { label: string; dot: string; text: string; ring: string }> = {
  ok: {
    label: "Operational",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    ring: "ring-emerald-400/20 bg-emerald-400/10",
  },
  down: {
    label: "Down",
    dot: "bg-red-400",
    text: "text-red-400",
    ring: "ring-red-400/20 bg-red-400/10",
  },
  checking: {
    label: "Checking…",
    dot: "bg-amber-400",
    text: "text-amber-400",
    ring: "ring-amber-400/20 bg-amber-400/10",
  },
  unknown: {
    label: "Unknown",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
    ring: "ring-zinc-500/20 bg-zinc-500/10",
  },
};

export function StatusBadge({ status, large }: Props) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full ring-1 font-medium",
        c.ring,
        c.text,
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      )}
    >
      <span
        className={cn(
          "rounded-full pulse-dot",
          c.dot,
          large ? "w-2.5 h-2.5" : "w-1.5 h-1.5"
        )}
      />
      {c.label}
    </span>
  );
}
