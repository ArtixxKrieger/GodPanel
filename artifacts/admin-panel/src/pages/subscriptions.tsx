import { useState, useMemo } from "react";
import { useGetSubscriptions } from "@workspace/api-client-react";
import type { GetSubscriptionsParams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  CreditCard, Search, CheckCircle, Clock, XCircle,
  TrendingUp, ChevronRight, DollarSign,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: "Paid", color: "bg-emerald-500/15 text-emerald-500 border-0", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-orange-400/15 text-orange-400 border-0", icon: Clock },
  failed: { label: "Failed", color: "bg-destructive/15 text-destructive border-0", icon: XCircle },
};

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-primary/15 text-primary border-0",
  free: "bg-muted text-muted-foreground border-0",
  enterprise: "bg-amber-500/15 text-amber-500 border-0",
};

export default function Subscriptions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const params: GetSubscriptionsParams = useMemo(() => ({
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  }), [statusFilter, search]);

  const { data, isLoading } = useGetSubscriptions(params);

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  const summary = data?.summary;
  const payments = data?.payments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-0.5">All subscription payments across the platform.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Collected", value: fmt(summary?.totalCollected ?? 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", span: true },
          { label: "Pending Value", value: fmt(summary?.totalPending ?? 0), icon: DollarSign, color: "text-orange-400", bg: "bg-orange-400/10", span: true },
          { label: "Paid", value: String(summary?.paidCount ?? 0), icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending", value: String(summary?.pendingCount ?? 0), icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Failed", value: String(summary?.failedCount ?? 0), icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className={`bg-card/50 border-border/60 ${item.span ? "col-span-1" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email…"
            className="pl-9 bg-card border-border/60 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/60 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment History
            <span className="ml-auto text-xs font-normal text-muted-foreground">{payments.length} records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No payment records found.</div>
          ) : (
            <>
              {/* Mobile view */}
              <ul className="sm:hidden divide-y divide-border/40">
                {payments.map((p) => {
                  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <li key={p.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm">{p.storeName || p.userName || "Unknown"}</p>
                            <Badge className={PLAN_COLORS[p.plan] || PLAN_COLORS.free}>{p.plan}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{p.userEmail || "—"}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge className={sc.color}><StatusIcon className="w-3 h-3 mr-1" />{sc.label}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy") : "—"}
                            </span>
                          </div>
                        </div>
                        <p className="font-bold text-emerald-500 shrink-0">{fmt(p.amount)}</p>
                      </div>
                      {p.userId && (
                        <div className="mt-2">
                          <Link href={`/users/${p.userId}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                            View user <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User / Store</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paid At</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {payments.map((p) => {
                      const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3">
                            <p className="font-medium leading-tight">{p.storeName || p.userName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{p.userEmail || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={PLAN_COLORS[p.plan] || PLAN_COLORS.free}>{p.plan}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={sc.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />{sc.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-500 tabular-nums">{fmt(p.amount)}</td>
                          <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">
                            {p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">
                            {p.paidAt ? format(new Date(p.paidAt), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {p.userId && (
                              <Link href={`/users/${p.userId}`}>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-primary">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
