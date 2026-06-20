import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Trash2, CheckCircle2, Clock, XCircle, CreditCard, ChevronDown } from "lucide-react";
import { api, SubscriptionPayment } from "@/lib/api";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import TopBar from "@/components/TopBar";

const STATUS_CONFIG = {
  paid:    { label: "Paid",    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-amber-500/15  text-amber-400  border-amber-500/25",   icon: Clock },
  failed:  { label: "Failed",  color: "bg-red-500/15    text-red-400    border-red-500/25",      icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    enterprise: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    pro:        "bg-blue-500/15   text-blue-400   border-blue-500/25",
    free:       "bg-secondary     text-muted-foreground border-border",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[plan] ?? colors.free}`}>
      {plan}
    </span>
  );
}

export default function Subscriptions({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [data, setData] = useState<{ payments: SubscriptionPayment[]; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.subscriptions({ status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined });
      setData(result);
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (payment: SubscriptionPayment, newStatus: string) => {
    if (newStatus === payment.status) return;
    setActionLoading(payment.id);
    try {
      await api.updatePaymentStatus(payment.id, newStatus);
      showToast(`Payment marked as ${newStatus}`, "ok");
      await load();
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await api.deletePayment(id);
      showToast("Payment record deleted", "ok");
      setDeleteConfirm(null);
      await load();
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
    }
  };

  const payments = data?.payments ?? [];
  const summary = data?.summary;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Subscriptions" subtitle="Manage subscription payments and plans" onMenuOpen={onMenuOpen} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === "ok"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Paid",      value: summary?.paidCount    ?? "—", color: "text-emerald-400" },
            { label: "Pending",   value: summary?.pendingCount  ?? "—", color: "text-amber-400" },
            { label: "Failed",    value: summary?.failedCount   ?? "—", color: "text-red-400" },
            { label: "Collected", value: summary ? formatCurrency(summary.totalCollected) : "—", color: "text-foreground" },
            { label: "Pending ₱", value: summary ? formatCurrency(summary.totalPending)   : "—", color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user or store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => load()} className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40">
                  {["Store / User", "Plan", "Amount", "Status", "Created", "Paid At", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 shimmer-loading rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No payments found</td>
                  </tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.storeName || p.userName || "—"}</div>
                      <div className="text-muted-foreground text-[10px]">{p.userEmail || p.tenantId || "—"}</div>
                    </td>
                    <td className="px-4 py-3"><PlanBadge plan={p.plan || "free"} /></td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Status dropdown */}
                        <div className="relative group">
                          <button
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground text-[10px]"
                          >
                            {actionLoading === p.id ? (
                              <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <>Set Status <ChevronDown className="w-2.5 h-2.5" /></>
                            )}
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-border bg-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {["paid", "pending", "failed"].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(p, s)}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-[11px] hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg capitalize",
                                  p.status === s ? "text-primary font-semibold" : "text-muted-foreground"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Delete */}
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={actionLoading === p.id}
                              className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-semibold hover:bg-red-500/30 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground text-[10px] hover:bg-secondary/80 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {payments.length} record{payments.length !== 1 ? "s" : ""} shown
        </p>
      </div>
    </div>
  );
}
