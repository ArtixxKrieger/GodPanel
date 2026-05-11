import { useParams, Link } from "wouter";
import {
  useGetUserDetail, getGetUserDetailQueryKey,
  useBanUser, useUnbanUser, useSetUserPlan,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Store, CreditCard, Package, BrainCircuit,
  DollarSign, TrendingDown, Crown, Ban, ShieldCheck,
  Mail, Calendar, AlertTriangle, CheckCircle, Clock, XCircle,
  BarChart3, ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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

const PLANS = [
  { value: "free", label: "Free", description: "Basic access, no subscription" },
  { value: "pro", label: "Pro", description: "Full features, monthly billing" },
  { value: "enterprise", label: "Enterprise", description: "Custom limits & priority support" },
] as const;

function ChangePlanDialog({
  currentPlan,
  userId,
  onClose,
  onSuccess,
}: {
  currentPlan: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState(currentPlan);
  const setPlanMutation = useSetUserPlan();

  const handleSave = () => {
    if (selected === currentPlan) { onClose(); return; }
    setPlanMutation.mutate(
      { userId, data: { plan: selected } },
      { onSuccess: () => { onSuccess(); onClose(); } },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Change Subscription Plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Select a new plan for this user.</p>
        </div>
        <div className="p-5 space-y-2">
          {PLANS.map((plan) => (
            <button
              key={plan.value}
              onClick={() => setSelected(plan.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                selected === plan.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:bg-secondary/40"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selected === plan.value ? "border-primary" : "border-muted-foreground/40"
              }`}>
                {selected === plan.value && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                  {plan.value === currentPlan && (
                    <span className="text-[10px] text-muted-foreground border border-border/50 rounded px-1 py-0.5">current</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">{plan.description}</div>
              </div>
            </button>
          ))}
        </div>
        {setPlanMutation.isError && (
          <div className="mx-5 mb-3 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            Failed to update plan. Please try again.
          </div>
        )}
        <div className="flex gap-2 px-5 pb-5">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={setPlanMutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={handleSave} disabled={setPlanMutation.isPending || selected === currentPlan}>
            {setPlanMutation.isPending ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UserDetail() {
  const params = useParams();
  const userId = params.id || "";
  const queryClient = useQueryClient();
  const [showChangePlan, setShowChangePlan] = useState(false);

  const { data, isLoading } = useGetUserDetail(userId, {
    query: { enabled: !!userId, queryKey: getGetUserDetailQueryKey(userId) },
  });

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetUserDetailQueryKey(userId) });

  const handleBanToggle = () => {
    if (!data) return;
    if (data.user.isBanned) {
      unbanMutation.mutate({ userId }, { onSuccess: invalidate });
    } else {
      banMutation.mutate({ userId }, { onSuccess: invalidate });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <AlertTriangle className="w-10 h-10" />
        <p className="font-medium">User not found</p>
        <Link href="/users" className="text-primary text-sm hover:underline">Back to users</Link>
      </div>
    );
  }

  const { user, subscriptionHistory, monthlySales } = data;

  const statCards = [
    { label: "POS Revenue", value: fmt(user.revenueTotal), icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Sales", value: user.salesCount.toLocaleString(), icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Products", value: user.productCount.toLocaleString(), icon: Package, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Expenses", value: fmt(user.totalExpenses), icon: DollarSign, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "AI Memories", value: user.aiMemoryCount.toLocaleString(), icon: BrainCircuit, color: "text-primary", bg: "bg-primary/10" },
    { label: "Store", value: user.storeName || "—", icon: Store, color: "text-violet-400", bg: "bg-violet-400/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/users">
            <div className="w-9 h-9 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-colors mt-0.5 shrink-0 cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary uppercase">
                  {(user.name || user.email || "?").charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name || "—"}</h1>
                  {user.role === "admin" && <Crown className="w-4 h-4 text-amber-400" />}
                  {user.isBanned && <Badge variant="destructive" className="border-0">Banned</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />{user.email}
                  </span>
                  {user.createdAt && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <div className="hidden sm:flex items-center gap-2">
            <Badge className={PLAN_COLORS[user.plan] || PLAN_COLORS.free}>{user.plan}</Badge>
            {user.subscriptionStatus && (
              <Badge className="bg-muted text-muted-foreground border-0">{user.subscriptionStatus}</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1"
            onClick={() => setShowChangePlan(true)}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Change Plan
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
          {user.role !== "admin" && (
            <Button
              variant={user.isBanned ? "outline" : "ghost"}
              size="sm"
              className={`h-9 text-xs ${!user.isBanned ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
              onClick={handleBanToggle}
              disabled={banMutation.isPending || unbanMutation.isPending}
            >
              {user.isBanned
                ? <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Unban</>
                : <><Ban className="w-3.5 h-3.5 mr-1.5" />Ban User</>
              }
            </Button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="bg-card/50 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                  </div>
                </div>
                <p className={`text-base font-bold truncate ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Subscription History */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Subscription History
              <span className="ml-auto text-xs font-normal text-muted-foreground">{subscriptionHistory.length} payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-72 overflow-y-auto">
            {subscriptionHistory.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No subscription history.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {subscriptionHistory.map((sub) => {
                  const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <li key={sub.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge className={PLAN_COLORS[sub.plan] || PLAN_COLORS.free}>{sub.plan}</Badge>
                          <Badge className={sc.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />{sc.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sub.createdAt ? format(new Date(sub.createdAt), "MMM d, yyyy") : "—"}
                          {sub.paidAt ? ` · Paid ${format(new Date(sub.paidAt), "MMM d")}` : ""}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-500 ml-3 shrink-0">{fmt(sub.amount)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Monthly Sales */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Monthly Sales Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-72 overflow-y-auto">
            {monthlySales.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No sales data yet.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {monthlySales.map((ms) => {
                  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue), 1);
                  const pct = (ms.revenue / maxRevenue) * 100;
                  return (
                    <li key={ms.month} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{ms.month}</span>
                          <span className="text-xs text-muted-foreground">{ms.sales} sale{ms.sales !== 1 ? "s" : ""}</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">{fmt(ms.revenue)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Store link */}
      {user.storeName && (
        <Link href={`/stores/${userId}`}>
          <Card className="bg-card/50 border-border/60 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{user.storeName}</p>
                <p className="text-sm text-muted-foreground">{user.businessType || "—"} · {user.currency || "PHP"}</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                View store <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {showChangePlan && (
        <ChangePlanDialog
          currentPlan={user.plan}
          userId={userId}
          onClose={() => setShowChangePlan(false)}
          onSuccess={invalidate}
        />
      )}
    </div>
  );
}
