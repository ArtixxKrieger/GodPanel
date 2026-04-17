import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  Users, DollarSign, Store, ArrowUpRight, TrendingUp,
  AlertTriangle, CreditCard, Clock, Crown, UserCheck,
  ChevronRight, Zap, TrendingDown,
} from "lucide-react";

function TrendBadge({ current, prev }: { current: number; prev: number }) {
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">New</span>;
  const pct = Math.round(((current - prev) / prev) * 100);
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${up ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"}`}>
      <Icon className="w-2.5 h-2.5" />{up ? "+" : ""}{pct}%
    </span>
  );
}

function MetricCard({
  title, value, icon: Icon, color, href, sub, trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  sub?: string;
  trend?: React.ReactNode;
}) {
  const inner = (
    <Card className={`bg-card/50 border-border/50 transition-all duration-200 ${href ? "hover:bg-card hover:border-primary/30 hover:shadow-md cursor-pointer group" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Icon className={`w-4 h-4 ${color}`} />
          {href && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SkeletonCard() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-primary/20 text-primary border-0",
  free: "bg-muted text-muted-foreground border-0",
  enterprise: "bg-amber-500/20 text-amber-400 border-0",
};

export default function Dashboard() {
  const { data: metrics, isLoading } = useGetDashboard();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Platform health and key performance indicators.</p>
        </div>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Platform Revenue</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users & Stores</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
  const num = (val: number) => new Intl.NumberFormat("en-US").format(val);

  const revenueCards = [
    {
      title: "Platform Revenue",
      value: fmt(metrics.platformRevenue),
      icon: DollarSign,
      color: "text-emerald-500",
      href: "/subscriptions",
      sub: "Total paid subscriptions",
    },
    {
      title: "Revenue This Month",
      value: fmt(metrics.revenueThisMonth),
      icon: TrendingUp,
      color: "text-primary",
      href: "/subscriptions",
      sub: "vs last month",
      trend: <TrendBadge current={metrics.revenueThisMonth} prev={metrics.revenueLastMonth ?? 0} />,
    },
    {
      title: "Pending Payments",
      value: num(metrics.pendingPayments),
      icon: Clock,
      color: "text-orange-400",
      href: "/subscriptions",
      sub: "Awaiting confirmation",
    },
    {
      title: "POS Sales (All Stores)",
      value: fmt(metrics.totalPosRevenue),
      icon: CreditCard,
      color: "text-blue-400",
      href: "/stores",
      sub: `${num(metrics.totalPosSales)} transactions`,
    },
  ];

  const userCards = [
    {
      title: "Total Users",
      value: num(metrics.totalUsers),
      icon: Users,
      color: "text-purple-400",
      href: "/users",
      sub: "All registered accounts",
    },
    {
      title: "Paid Subscribers",
      value: num(metrics.activeSubscriptions),
      icon: Crown,
      color: "text-amber-400",
      href: "/users",
      sub: "Active paid plans",
    },
    {
      title: "Free Users",
      value: num(metrics.freeUsers),
      icon: UserCheck,
      color: "text-sky-400",
      href: "/users",
      sub: "On the free plan",
    },
    {
      title: "New Signups (7d)",
      value: num(metrics.newSignupsThisWeek),
      icon: ArrowUpRight,
      color: "text-emerald-400",
      href: "/users",
      sub: "vs prior 7 days",
      trend: <TrendBadge current={metrics.newSignupsThisWeek} prev={metrics.newSignupsPrevWeek ?? 0} />,
    },
  ];

  const storeCards = [
    {
      title: "Active Stores (30d)",
      value: num(metrics.activeStores),
      icon: Store,
      color: "text-indigo-400",
      href: "/stores",
      sub: "Made a sale in last 30 days",
    },
    {
      title: "Banned Users",
      value: num(metrics.bannedUsers),
      icon: AlertTriangle,
      color: "text-destructive",
      href: "/users?banned=true",
      sub: "Accounts currently banned",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform health and key performance indicators.</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Revenue</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {revenueCards.map((c) => <MetricCard key={c.title} {...c} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userCards.map((c) => <MetricCard key={c.title} {...c} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Stores & Activity</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {storeCards.map((c) => <MetricCard key={c.title} {...c} />)}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Recent Signups
              </CardTitle>
              <Link href="/users">
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {metrics.recentSignups.length === 0 ? (
              <p className="text-muted-foreground text-sm p-4 text-center">No signups yet.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {metrics.recentSignups.map((u) => (
                  <li key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge className={PLAN_COLORS[u.plan] || PLAN_COLORS.free}>
                        {u.plan}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), "MMM d") : "—"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Subscription Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {metrics.subscriptionBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No subscriptions yet.</p>
            ) : (
              metrics.subscriptionBreakdown.map((item) => {
                const total = metrics.subscriptionBreakdown.reduce((a, b) => a + b.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.plan}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge className={PLAN_COLORS[item.plan] || PLAN_COLORS.free}>
                          {item.plan}
                        </Badge>
                        <span className="text-sm font-medium">{num(item.count)} users</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${item.plan === "pro" ? "bg-primary" : item.plan === "enterprise" ? "bg-amber-400" : "bg-muted-foreground/40"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
