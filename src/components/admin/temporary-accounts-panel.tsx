import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Search, Trash2, Edit2, Loader2, Shield, Calendar, Clock, Lock, Save, X, FileDown, FileText, RefreshCw, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { adminCleanupExpiredAccounts } from "@/lib/admin-maintenance.functions";
import { adminSendExpirationReminders } from "@/lib/admin-notifications.functions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format-utils";
import { supabase } from "@/integrations/supabase/client";
import { adminUpdateUser } from "@/lib/admin-users.functions";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";

export function TemporaryAccountsPanel({ globalSearch = "" }: { globalSearch?: string }) {
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const updateUser = useServerFn(adminUpdateUser);
  const cleanup = useServerFn(adminCleanupExpiredAccounts);
  const sendReminders = useServerFn(adminSendExpirationReminders);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["admin", "temporary-accounts"],
    queryFn: async () => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      await updateUser({
        data: {
          targetUserId: editingAccount.user_id,
          fullName: editingAccount.full_name,
          contactEmail: editingAccount.contact_email,
        }
      });
      toast.success("Dados da conta temporária atualizados");
      setEditingAccount(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "temporary-accounts"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar conta");
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!filtered.length) return;
    
    if (format === 'csv') {
      const headers = ["Nome Fictício", "Email/CPF", "Plano", "Expiração", "Dias Restantes", "Status"];
      const rows = filtered.map(a => {
        const endsAt = new Date(a.trial_ends_at);
        const now = new Date();
        const diffDays = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return [
          a.full_name || "Usuário Temporário",
          a.contact_email || a.cpf || "-",
          a.plans?.name || "Trial",
          formatDateTime(a.trial_ends_at),
          diffDays > 0 ? diffDays : "Expirado",
          "Restrito"
        ];
      });
      
      toast.info(`Exportando ${(accounts ?? []).length} contas temporárias...`);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `contas-temporarias-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exportação CSV concluída");
    } else {
      toast.info("A exportação PDF está sendo gerada...");
      window.print(); // Fallback simples para visualização de impressão/PDF
    }
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const result = await cleanup();
      toast.success(`Limpeza concluída: ${result.count} contas expiradas removidas.`);
      queryClient.invalidateQueries({ queryKey: ["admin", "temporary-accounts"] });
    } catch (err: any) {
      toast.error("Falha ao executar limpeza");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSendReminders = async () => {
    setIsSending(true);
    try {
      const result = await sendReminders();
      toast.success(`Lembretes enviados: ${result.sent3} (3 dias) e ${result.sent1} (1 dia).`);
    } catch (err: any) {
      toast.error("Falha ao enviar lembretes");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-muted/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <UserPlus className="size-5 text-amber-500" />
              Gestão de Contas Temporárias
            </CardTitle>
            <CardDescription>
              Controle de trials e acessos por código. Lembretes e limpeza automática de expirações.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl"
              onClick={() => handleExport('csv')}
            >
              <FileText className="size-4" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl"
              onClick={handleSendReminders}
              disabled={isSending}
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Lembretes
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2 rounded-xl"
              onClick={handleCleanup}
              disabled={isCleaning}
            >
              {isCleaning ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Limpar Expirados
            </Button>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome fictício, e-mail ou CPF"
            className="pl-9 bg-background/50 border-border/40 focus:border-amber-500/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Usuário / Nome Fictício</TableHead>
                <TableHead className="font-bold">Plano</TableHead>
                <TableHead className="font-bold">Tempo Restante</TableHead>
                <TableHead className="font-bold">Status de Acesso</TableHead>
                <TableHead className="text-right font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-amber-500" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <X className="size-8 opacity-20" />
                      <p>Nenhuma conta temporária ativa encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((account) => {
                  const endsAt = new Date(account.trial_ends_at);
                  const now = new Date();
                  const diffMs = endsAt.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  const isExpired = diffMs < 0;

                  return (
                    <TableRow key={account.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm">{account.full_name || "Usuário Temporário"}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            {account.contact_email || account.cpf || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 text-[10px] font-bold uppercase tracking-tighter">
                          {account.plans?.name || "Trial"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-bold",
                          isExpired ? "text-destructive" : diffDays <= 3 ? "text-orange-600" : "text-emerald-600"
                        )}>
                          <Clock className="size-3" />
                          {isExpired ? "Expirado" : `${diffDays} dia(s)`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-black">
                          <Lock className="mr-1 size-3" />
                          RESTRITO
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 hover:bg-amber-500/10 hover:text-amber-600"
                          onClick={() => setEditingAccount({ ...account })}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="size-5 text-amber-500" />
              Editar Conta Temporária
            </DialogTitle>
            <DialogDescription>
              Ajuste as informações da conta. O usuário não poderá editar estes dados por conta própria.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Fictício / Exibição</Label>
              <Input 
                id="full_name" 
                value={editingAccount?.full_name || ""} 
                onChange={(e) => setEditingAccount({ ...editingAccount, full_name: e.target.value })}
                placeholder="Ex: João Teste"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">E-mail de Contato</Label>
              <Input 
                id="contact_email" 
                type="email"
                value={editingAccount?.contact_email || ""} 
                onChange={(e) => setEditingAccount({ ...editingAccount, contact_email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </form>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditingAccount(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2">
              <Save className="size-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </Card>
  );
}

