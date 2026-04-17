import { useGetStores } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, ChevronRight, Search, Package, CreditCard, TrendingUp, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

function exportStoresCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = ["Store Name", "Owner", "Email", "Type", "Products", "Sales", "Revenue", "Status"];
  const lines = rows.map(s => [
    s.storeName || "",
    s.ownerName || "",
    s.ownerEmail || "",
    s.businessType || "",
    s.productCount ?? 0,
    s.salesCount ?? 0,
    s.revenue ?? 0,
    s.isBanned ? "Banned" : "Active",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

export default function Stores() {
  const { data: stores, isLoading } = useGetStores();
  const [search, setSearch] = useState("");

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  const filtered = useMemo(() =>
    stores?.filter(s =>
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerEmail.toLowerCase().includes(search.toLowerCase())
    ) ?? [],
    [stores, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground text-sm mt-0.5">View and monitor all merchant storefronts.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stores…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border/60 h-10"
            />
          </div>
          {filtered.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-border/60 shrink-0"
              onClick={() => exportStoresCSV(filtered, `stores-${format(new Date(), "yyyy-MM-dd")}.csv`)}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {!isLoading && stores && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Stores", value: stores.length, icon: Store, color: "text-primary" },
            { label: "With Sales", value: stores.filter(s => s.salesCount > 0).length, icon: CreditCard, color: "text-emerald-500" },
            { label: "Total Products", value: stores.reduce((a, s) => a + s.productCount, 0), icon: Package, color: "text-blue-400" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="bg-card/50 border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-lg leading-tight">{item.value.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Store List — Cards on mobile, Table on desktop */}
      <Card className="bg-card/50 border-border/60">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> Directory
          </CardTitle>
          <CardDescription>{filtered.length} store{filtered.length !== 1 ? "s" : ""} found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {search ? "No stores match your search." : "No stores found."}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <ul className="sm:hidden divide-y divide-border/40">
                {filtered.map((store) => (
                  <li key={store.userId}>
                    <Link href={`/stores/${store.userId}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors active:bg-muted/50">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm truncate">{store.storeName}</p>
                          {store.isBanned && <Badge variant="destructive" className="text-[9px] h-3.5 px-1 border-0">BANNED</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{store.ownerEmail}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Package className="w-3 h-3" />{store.productCount}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />{store.salesCount}
                          </span>
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />{fmt(store.revenue)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Store</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Products</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sales</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((store) => (
                      <tr key={store.userId} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Store className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium leading-tight">{store.storeName}</p>
                              {store.isBanned && <Badge variant="destructive" className="text-[9px] h-3.5 px-1 border-0 mt-0.5">BANNED</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium leading-tight">{store.ownerName}</p>
                          <p className="text-xs text-muted-foreground">{store.ownerEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{store.businessType || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{store.productCount}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{store.salesCount}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-500 tabular-nums">{fmt(store.revenue)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/stores/${store.userId}`}>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-primary">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </Link>
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
