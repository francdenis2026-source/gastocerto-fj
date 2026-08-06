import { createFileRoute } from '@tanstack/react-router'
import { Baby, ArrowLeft, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useAuth } from "@/hooks/use-auth"
import { useTransactions } from "@/lib/transactions"
import { formatCurrency, formatDateTime } from "@/lib/format-utils"
import { usePeriodStore } from "@/lib/period-store"
import { monthRange } from "@/lib/finance"
import { useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/finance/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const Route = createFileRoute('/_authenticated/kids/extrato')({
  component: ExtratosKidsPage
})

function ExtratosKidsPage() {
  const { user } = useAuth();
  const { year, month } = usePeriodStore();
  const range = useMemo(() => monthRange(year, month), [year, month]);
  const { data: transactions = [], isLoading } = useTransactions(range);

  // Filtra apenas transações que possuem a tag da criança (vinculadas ao pai)
  const kidsTransactions = useMemo(() => {
    return transactions.filter(t => t.tags?.some(tag => tag.startsWith('dep:')));
  }, [transactions]);

  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/_authenticated/kids">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <PageHeader
            title="Extrato Espaço Kids"
            description="Histórico de mesadas e gastos das crianças."
            icon={Baby}
          />
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Movimentações</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="size-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Criança</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : kidsTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                        Nenhuma transação kids encontrada neste período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    kidsTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(t.transaction_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-[10px]">
                            {t.description.split(' — ')[0] || "Criança"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {t.description.includes(' — ') ? t.description.split(' — ')[1] : t.description}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-bold",
                          t.transaction_type === 'income' ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {t.transaction_type === 'income' ? "+" : "-"} {formatCurrency(t.amount)}
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
    </AppShell>
  );
}
