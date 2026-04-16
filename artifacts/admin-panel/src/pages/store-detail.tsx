import { useGetStoreDetail, getGetStoreDetailQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CreditCard, Activity, BrainCircuit, Store as StoreIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function StoreDetail() {
  const params = useParams();
  const userId = parseInt(params.id || "0", 10);

  const { data: detail, isLoading } = useGetStoreDetail(userId, {
    query: {
      enabled: !!userId,
      queryKey: getGetStoreDetailQueryKey(userId)
    }
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (isLoading || !detail) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const { store, products, sales, expenses, aiMemoryCount } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/stores" className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{store.storeName}</h1>
            {store.isBanned && <Badge variant="destructive" className="border-0">Banned</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">
            Owned by {store.ownerName} ({store.ownerEmail})
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <StoreIcon className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(store.revenue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.salesCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.productCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Memories</CardTitle>
            <BrainCircuit className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{aiMemoryCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sales recorded</TableCell></TableRow>
                ) : (
                  sales.slice(0, 5).map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {sale.createdAt ? format(new Date(sale.createdAt), "MMM d, HH:mm") : "—"}
                      </TableCell>
                      <TableCell>{sale.itemCount}</TableCell>
                      <TableCell className="text-xs uppercase">{sale.paymentMethod || "unknown"}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-500">{formatCurrency(sale.total || 0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No products found</TableCell></TableRow>
                ) : (
                  products.slice(0, 5).map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{product.category || "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price || 0)}</TableCell>
                      <TableCell className="text-right">
                        {product.stock !== null && product.stock !== undefined ? (
                          <Badge variant="outline" className={product.stock <= 5 ? "text-destructive border-destructive/50" : ""}>
                            {product.stock}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}