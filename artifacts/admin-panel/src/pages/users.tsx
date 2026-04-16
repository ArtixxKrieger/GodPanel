import { useState } from "react";
import { useGetUsers, useBanUser, useUnbanUser, getGetUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Ban, ShieldCheck, UserCog } from "lucide-react";
import { format } from "date-fns";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [bannedFilter, setBannedFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const queryParams = {
    ...(search ? { search } : {}),
    ...(bannedFilter !== "all" ? { banned: bannedFilter === "banned" } : {})
  };

  const { data: users, isLoading } = useGetUsers(queryParams);
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const handleBanToggle = (userId: number, isBanned: boolean) => {
    if (isBanned) {
      unbanMutation.mutate({ userId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey(queryParams) });
        }
      });
    } else {
      banMutation.mutate({ userId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey(queryParams) });
        }
      });
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform users and merchant accounts.</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-9 bg-background/50 border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={bannedFilter} onValueChange={setBannedFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-border">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="banned">Banned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Store & Business</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-1.5">
                            {user.name}
                            {user.role === "admin" && <UserCog className="w-3.5 h-3.5 text-primary" />}
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.storeName || "—"}</span>
                          <span className="text-xs text-muted-foreground">{user.businessType || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-emerald-500">
                          {formatCurrency(user.revenueTotal)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0">Banned</Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-500/20 text-emerald-500 border-0">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== "admin" && (
                          <Button
                            variant={user.isBanned ? "outline" : "destructive"}
                            size="sm"
                            className="h-8"
                            onClick={() => handleBanToggle(user.id, !!user.isBanned)}
                            disabled={banMutation.isPending || unbanMutation.isPending}
                          >
                            {user.isBanned ? (
                              <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Unban</>
                            ) : (
                              <><Ban className="w-3.5 h-3.5 mr-1.5" /> Ban</>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}