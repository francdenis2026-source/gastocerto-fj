import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Search, Trash2, Edit2, Loader2, Shield, Calendar, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export function TemporaryAccountsPanel({ globalSearch = "" }: { globalSearch?: string }) {
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["admin", "temporary-accounts"],
    queryFn: async () => {
      // Temporary accounts are those created via code activation
      // We'll look for profiles that have specific metadata or are linked to licenses but haven't been promoted to full paid yet
      // For now, let's filter by a flag or specific status if available, 
      // or simply profiles that were created via admin/codes
      const { data, error } = await supabase
        .from("profiles")
        .select("*, plans(name, slug)")
        .eq("status", "active")
        .not("trial_ends_at", "is", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const term = (globalSearch || search).trim().toLowerCase();
    if (!term) return accounts || [];
    return (accounts || []).filter(
      (a) =>
        (a.full_name ?? "").toLowerCase().includes(term) ||
        (a.contact_email ?? "").toLowerCase().includes(term) ||
        (a.cpf ?? "").includes(term)
    );
  }, [accounts, search, globalSearch]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="size-5 text-amber-500" />
              Contas Temporárias
            </CardTitle>
            <CardDescription>
              Gestão de usuários que acessam via código ou período de teste.
            </CardDescription>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF"
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Usuário</TableHead>
                <TableHead>Plano/Teste</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma conta temporária ativa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.full_name || "Usuário Temporário"}</span>
                        <span className="text-xs text-muted-foreground">{account.contact_email || account.cpf || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        {account.plans?.name || "Trial"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
                        <Clock className="size-3" />
                        {account.trial_ends_at ? formatDateTime(account.trial_ends_at) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(account.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Edit2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <ConfirmDialog />
    </Card>
  );
}
