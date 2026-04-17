import { useState, useMemo } from "react";
import { useGetUsers, useBanUser, useUnbanUser, getGetUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Ban, ShieldCheck, Users, UserX, Crown, UserCheck, Download, ChevronRight } from "lucide-react";
import { format } from "date-fns";

function exportCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = ["Name", "Email", "Store", "Plan", "Revenue", "Joined", "Status"];
  const lines = rows.map(u => [
    u.name || "",
    u.email || "",
    u.storeName || "",
    u.plan || "free",
    u.revenueTotal ?? 0,
    u.createdAt ? format(new Date(u.createdAt), "yyyy-MM-dd") : "",
    u.isBanned ? "Banned" : "Active",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-primary/15 text-primary border-0",
  free: "bg-muted text-muted-foreground border-0",
  enterprise: "bg-amber-500/15 text-amber-500 border-0",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [bannedFilter, setBannedFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const queryParams = {
    ...(search ? { search } : {}),
    ...(bannedFilter !== "all" ? { banned: bannedFilter === "banned" } : {}),
  };

  const { data: users, isLoading } = useGetUsers(queryParams);
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const handleBanToggle = (userId: string, isBanned: boolean) => {
    const opts = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey(queryParams) });
      },
    };
    if (isBanned) {
      unbanMutation.mutate({ userId }, opts);
    } else {
      banMutation.mutate({ userId }, opts);
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  const stats = useMemo(() => ({
    total: users?.length ?? 0,
    banned: users?.filter(u => u.isBanned).length ?? 0,
    active: users?.filter(u => !u.isBanned).length ?? 0,
  }), [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage platform users and merchant accounts.</p>
      </div>

      {/* Quick stats */}
      {!isLoading && users && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-purple-400" },
            { label: "Active", value: stats.active, icon: UserCheck, color: "text-emerald-500" },
            { label: "Banned", value: stats.banned, icon: UserX, color: "text-destructive" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="bg-card/50 border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-lg leading-tight">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
        <Select value={bannedFilter} onValueChange={setBannedFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/60 h-10">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="banned">Banned Only</SelectItem>
          </SelectContent>
        </Select>
        {users && users.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/60 shrink-0"
            onClick={() => exportCSV(users, `users-${format(new Date(), "yyyy-MM-dd")}.csv`)}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}
      </div>

      {/* User List */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Accounts
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : `${users?.length ?? 0} user${users?.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              ))}
            </div>
          ) : users?.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {search || bannedFilter !== "all" ? "No users match your filters." : "No users found."}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <ul className="md:hidden divide-y divide-border/40">
                {users?.map((user) => (
                  <li key={user.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/users/${user.id}`} className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary uppercase">
                            {(user.name || user.email || "?").charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm">{user.name || "—"}</p>
                            {user.role === "admin" && <Crown className="w-3 h-3 text-amber-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge className={user.isBanned ? "bg-destructive/15 text-destructive border-0 text-xs" : "bg-emerald-500/15 text-emerald-500 border-0 text-xs"}>
                              {user.isBanned ? "Banned" : "Active"}
                            </Badge>
                            {user.storeName && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.storeName}</span>}
                            <span className="text-xs font-semibold text-emerald-500">{fmt(user.revenueTotal)}</span>
                          </div>
                        </div>
                      </Link>
                      {user.role !== "admin" && (
                        <Button
                          variant={user.isBanned ? "outline" : "ghost"}
                          size="sm"
                          className={`h-8 text-xs shrink-0 ${!user.isBanned ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
                          onClick={() => handleBanToggle(user.id, !!user.isBanned)}
                          disabled={banMutation.isPending || unbanMutation.isPending}
                        >
                          {user.isBanned ? <><ShieldCheck className="w-3 h-3 mr-1" />Unban</> : <><Ban className="w-3 h-3 mr-1" />Ban</>}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Store</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {users?.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary uppercase">
                                {(user.name || user.email || "?").charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium leading-tight">{user.name || "—"}</p>
                                {user.role === "admin" && <Crown className="w-3 h-3 text-amber-400" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium leading-tight">{user.storeName || "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.businessType || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-500 tabular-nums">{fmt(user.revenueTotal)}</td>
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={user.isBanned ? "bg-destructive/15 text-destructive border-0" : "bg-emerald-500/15 text-emerald-500 border-0"}>
                            {user.isBanned ? "Banned" : "Active"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.role !== "admin" && (
                              <Button
                                variant={user.isBanned ? "outline" : "ghost"}
                                size="sm"
                                className={`h-8 text-xs ${!user.isBanned ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
                                onClick={() => handleBanToggle(user.id, !!user.isBanned)}
                                disabled={banMutation.isPending || unbanMutation.isPending}
                              >
                                {user.isBanned ? <><ShieldCheck className="w-3 h-3 mr-1" />Unban</> : <><Ban className="w-3 h-3 mr-1" />Ban</>}
                              </Button>
                            )}
                            <Link href={`/users/${user.id}`}>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-primary">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
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
