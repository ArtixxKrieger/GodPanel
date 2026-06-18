import { useState, useEffect, useCallback, useRef } from "react";

export type HealthStatus = "ok" | "down" | "checking" | "unknown";

export interface CheckResult {
  timestamp: Date;
  status: HealthStatus;
  responseTime: number | null;
  statusCode: number | null;
  message: string;
}

export interface EndpointConfig {
  id: string;
  label: string;
  url: string;
  intervalMs: number;
}

export interface MonitorState {
  status: HealthStatus;
  lastChecked: Date | null;
  responseTime: number | null;
  statusCode: number | null;
  message: string;
  history: CheckResult[];
  uptime: number;
  totalChecks: number;
  successChecks: number;
  isChecking: boolean;
}

const MAX_HISTORY = 50;

export function useHealthMonitor(endpoint: EndpointConfig) {
  const [state, setState] = useState<MonitorState>({
    status: "unknown",
    lastChecked: null,
    responseTime: null,
    statusCode: null,
    message: "Not yet checked",
    history: [],
    uptime: 0,
    totalChecks: 0,
    successChecks: 0,
    isChecking: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    setState((prev) => ({ ...prev, isChecking: true }));
    const start = performance.now();
    let result: CheckResult;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(endpoint.url, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      const elapsed = Math.round(performance.now() - start);
      const isOk = response.ok;
      result = {
        timestamp: new Date(),
        status: isOk ? "ok" : "down",
        responseTime: elapsed,
        statusCode: response.status,
        message: isOk ? "Healthy" : `HTTP ${response.status}`,
      };
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out"
          : err instanceof Error
          ? err.message
          : "Network error";
      result = {
        timestamp: new Date(),
        status: "down",
        responseTime: elapsed,
        statusCode: null,
        message,
      };
    }

    setState((prev) => {
      const newHistory = [result, ...prev.history].slice(0, MAX_HISTORY);
      const totalChecks = prev.totalChecks + 1;
      const successChecks =
        prev.successChecks + (result.status === "ok" ? 1 : 0);
      const uptime =
        totalChecks > 0 ? Math.round((successChecks / totalChecks) * 100 * 10) / 10 : 0;
      return {
        ...prev,
        status: result.status,
        lastChecked: result.timestamp,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        message: result.message,
        history: newHistory,
        uptime,
        totalChecks,
        successChecks,
        isChecking: false,
      };
    });
  }, [endpoint.url]);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, endpoint.intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check, endpoint.intervalMs]);

  return { state, checkNow: check };
}
