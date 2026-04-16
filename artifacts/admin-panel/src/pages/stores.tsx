import { useGetStores } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Store, ChevronRight } from "lucide-react";

export default function Stores() {
  const { data: stores, isLoading } = useGetStores();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
        <p className="text-muted-foreground mt-1">View and monitor all merchant storefronts.</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Directory
          </CardTitle>
          <CardDescription>All active and inactive storefronts on the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Loading stores...
                    </TableCell>
                  </TableRow>
                ) : stores?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No stores found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores?.map((store) => (
                    <TableRow key={store.userId} className="hover:bg-muted/30 group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {store.storeName}
                          {store.isBanned && <Badge variant="destructive" className="text-[10px] h-4 px-1 border-0">BANNED</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{store.ownerName}</span>
                          <span className="text-xs text-muted-foreground">{store.ownerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{store.businessType || "—"}</TableCell>
                      <TableCell className="text-right">{store.productCount}</TableCell>
                      <TableCell className="text-right">{store.salesCount}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-500">
                        {formatCurrency(store.revenue)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/stores/${store.userId}`} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 hover:bg-primary/10 rounded-md text-primary">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
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