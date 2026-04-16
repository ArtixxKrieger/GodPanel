import { useGetAiUsage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BrainCircuit, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AiUsage() {
  const { data: usage, isLoading } = useGetAiUsage();
  const [search, setSearch] = useState("");

  const filteredUsage = usage?.filter(u => 
    u.storeName.toLowerCase().includes(search.toLowerCase()) || 
    (u.tenantId && u.tenantId.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const totalMemories = usage?.reduce((sum, u) => sum + u.memoryCount, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Usage</h1>
        <p className="text-muted-foreground mt-1">Monitor AI memory consumption across merchants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> Global AI Memories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('en-US').format(totalMemories)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Usage per Store</CardTitle>
            <CardDescription>Distribution of AI memory embeddings</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stores..."
              className="pl-9 h-9 bg-background/50 border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Tenant ID</TableHead>
                <TableHead className="text-right">Memory Count</TableHead>
                <TableHead className="text-right">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Loading AI usage data...
                  </TableCell>
                </TableRow>
              ) : filteredUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsage.map((entry) => (
                  <TableRow key={entry.userId} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{entry.storeName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{entry.tenantId || "—"}</TableCell>
                    <TableCell className="text-right font-medium text-primary">{entry.memoryCount}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {entry.lastActivity ? format(new Date(entry.lastActivity), "MMM d, yyyy HH:mm") : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}