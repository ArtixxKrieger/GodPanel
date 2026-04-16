import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Store, Activity, ArrowUpRight, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: metrics, isLoading } = useGetDashboard();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Key metrics and platform health.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(val);

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "Revenue This Month",
      value: formatCurrency(metrics.revenueThisMonth),
      icon: TrendingUp,
      color: "text-emerald-500"
    },
    {
      title: "Total Sales",
      value: formatNumber(metrics.totalSales),
      icon: CreditCard,
      color: "text-blue-500"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(metrics.totalExpenses),
      icon: Activity,
      color: "text-orange-500"
    },
    {
      title: "Total Users",
      value: formatNumber(metrics.totalUsers),
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "New Signups (7d)",
      value: formatNumber(metrics.newSignupsThisWeek),
      icon: ArrowUpRight,
      color: "text-emerald-500"
    },
    {
      title: "Active Stores",
      value: formatNumber(metrics.activeStores),
      icon: Store,
      color: "text-indigo-500"
    },
    {
      title: "Banned Users",
      value: formatNumber(metrics.bannedUsers),
      icon: AlertTriangle,
      color: "text-destructive"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform health and key performance indicators.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}