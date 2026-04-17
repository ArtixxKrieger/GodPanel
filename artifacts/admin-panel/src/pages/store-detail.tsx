import { useGetStoreDetail, getGetStoreDetailQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Package, CreditCard, DollarSign,
  BrainCircuit, Store as StoreIcon, Mail, Tag, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

export default function StoreDetail() {
  const params = useParams();
  const userId = params.id || "";

  const { data: detail, isLoading } = useGetStoreDetail(userId, {
    query: {
      enabled: !!userId,
      queryKey: getGetStoreDetailQueryKey(userId),
    },
  });

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <AlertTriangle className="w-10 h-10" />
        <p className="font-medium">Store not found</p>
        <Link href="/stores" className="text-primary text-sm hover:underline">Back to stores</Link>
      </div>
    );
  }

  const { store, products, sales, expenses, aiMemoryCount } = detail;

  const statCards = [
    { label: "Total Revenue", value: fmt(store.revenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Sales", value: store.salesCount.toLocaleString(), icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Products", value: store.productCount.toLocaleString(), icon: Package, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "AI Memories", value: aiMemoryCount.toLocaleString(), icon: BrainCircuit, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/stores">
          <div className="w-9 h-9 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-colors mt-0.5 shrink-0 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{store.storeName}</h1>
            {store.isBanned && <Badge variant="destructive" className="border-0">Banned</Badge>}
            {store.businessType && (
              <Badge className="bg-muted text-muted-foreground border-0 hidden sm:inline-flex">{store.businessType}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{store.ownerName} · {store.ownerEmail}</span>
            {store.currency && (
              <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono shrink-0">{store.currency}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" /> Recent Sales
              <span className="ml-auto text-xs font-normal text-muted-foreground">{sales.length} transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-72 overflow-y-auto">
            {sales.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No sales recorded.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {sales.map((sale) => (
                  <li key={sale.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{fmt(sale.total ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.itemCount} item{sale.itemCount !== 1 ? "s" : ""} · {sale.paymentMethod || "unknown"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sale.createdAt ? format(new Date(sale.createdAt), "MMM d, HH:mm") : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" /> Products
              <span className="ml-auto text-xs font-normal text-muted-foreground">{products.length} items</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-72 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No products found.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {products.map((product) => (
                  <li key={product.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {product.category && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />{product.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-semibold">{fmt(product.price ?? 0)}</p>
                      {product.stock !== null && product.stock !== undefined && (
                        <p className={`text-xs font-medium ${product.stock <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                          {product.stock} in stock
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="bg-card/50 border-border/60 lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-muted-foreground" /> Expenses
              <span className="ml-auto text-xs font-normal text-muted-foreground">{expenses.length} entries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-60 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No expenses recorded.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.createdAt ? format(new Date(expense.createdAt), "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-destructive ml-3 shrink-0">{fmt(expense.amount ?? 0)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
