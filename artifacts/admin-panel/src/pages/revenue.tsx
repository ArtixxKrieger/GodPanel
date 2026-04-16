import { useState } from "react";
import { useGetRevenue, useGetTopStores } from "@workspace/api-client-react";
import type { GetRevenuePeriod } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts";
import { Loader2, TrendingUp, CreditCard, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Revenue() {
  const [period, setPeriod] = useState<GetRevenuePeriod>("30d");
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenue({ period });
  const { data: topStores, isLoading: isLoadingStores } = useGetTopStores();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide financial performance.</p>
        </div>
        <Select value={period} onValueChange={(val) => setPeriod(val as GetRevenuePeriod)}>
          <SelectTrigger className="w-[150px] bg-background/50">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-3xl font-bold text-emerald-500">
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold text-blue-500">
                {new Intl.NumberFormat('en-US').format(revenueData?.totalSales || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(revenueData?.averageOrderValue || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Platform revenue over {period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {isLoadingRevenue ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Top Stores</CardTitle>
            <CardDescription>By all-time revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {isLoadingStores ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStores || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="storeName" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      width={100}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--emerald-500))" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}