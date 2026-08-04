import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/finance/page-header";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftRight, FileText, Download, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions"; // Hypothetical hook or use query directly
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/extratos")({
  component: ExtratosPage,
});

function ExtratosPage() {
  // In a real scenario, we would use useTransactions or similar
  const transactions: any[] = []; 

  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Extratos Bancários"
          description="Visualize e exporte o histórico detalhado de suas movimentações."
          icon={FileText}
        />

        <div className="grid gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Movimentações Recentes</CardTitle>
                <CardDescription>
                  Listagem cronológica de entradas e saídas.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Download className="size-4" />
                  Exportar PDF
                </Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Download className="size-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma movimentação encontrada para o período selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(t.date)}
                          </TableCell>
                          <TableCell className="font-medium">{t.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {t.category}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            t.type === 'income' ? "text-success" : "text-destructive"
                          )}>
                            {t.type === 'income' ? "+" : "-"} {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.confirmed ? "default" : "outline"} className="capitalize">
                              {t.confirmed ? "Confirmado" : "Pendente"}
                            </Badge>
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
      </div>
    </AppShell>
  );
}
