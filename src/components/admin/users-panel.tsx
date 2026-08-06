import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, KeyRound, Loader2, Search, UserCog, Shield, Baby, Info, ShieldCheck, TrendingUp, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PermissionsPanel } from "./permissions-panel";
import { CreateUserDialog } from "./create-user-dialog";
import { UserAuditTimeline } from "./user-audit-timeline";

import { usePlanAccess } from "@/lib/plan-features";
import { syncUserLicense } from "@/functions/license-sync.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  adminResetUserPin,
  adminSaveSupportNotes,
  adminSetUserRole,
  adminSetUserStatus,
} from "@/functions/admin.functions";
import {
  adminCancelSubscription,
  adminDeleteUser,
  adminPromoteToPaid,
  adminSetAccessLimit,
  adminSetUserPassword,
  adminUpdateUser,
} from "@/functions/admin-users.functions";
import { moveToTrash } from "@/functions/admin-trash.functions";
import { useServerFn } from "@tanstack/react-start";
import { maskCpf, onlyDigits } from "@/lib/cpf";
import { formatDateTime } from "@/lib/format-utils";
import type { Profile } from "@/lib/queries";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  canceled: "Cancelado",
};

/** Gestão de contas: busca, situação, papéis, credenciais e suporte. */
export function UsersPanel({ isAdmin, globalSearch = "" }: { isAdmin: boolean; globalSearch?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Profile | null>(null);
  const moveToTrashFn = useServerFn(moveToTrash);

  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    staleTime: 60_000,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, plan:plans(slug)")
        .order("created_at", { ascending: false })
        .limit(1000); // Evita sobrecarga de memória no navegador
      if (error) {
        console.error("[admin] erro ao buscar perfis:", error);
        throw error;
      }
      
      const { data: kidsData } = await supabase.from("dependents").select("user_id");
      const kidsMap = new Map<string, number>();
      for (const row of kidsData ?? []) {
        kidsMap.set(row.user_id, (kidsMap.get(row.user_id) ?? 0) + 1);
      }

      return (data || []).map((p) => ({ 
        ...p, 
        plan_slug: (p as any).plan?.slug,
        kids_count: kidsMap.get(p.user_id) || 0
      })) as any;
    },
  });

  // Quantidade de filhos (Espaço Kids) por responsável, contada separadamente
  // porque não existe relação direta entre profiles e dependents.
  const rolesByUser = useQuery({
    queryKey: ["admin", "roles"],
    enabled: isAdmin,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      const map = new Map<string, string[]>();
      for (const row of data ?? []) {
        map.set(row.user_id, [...(map.get(row.user_id) ?? []), row.role]);
      }
      return map;
    },
  });

  const filtered = useMemo(() => {
    const term = (globalSearch || search).trim().toLowerCase();
    const digits = onlyDigits(search);
    return (profiles.data ?? []).filter((profile) => {
      // Regra: se for PRO (tem plano premium), nunca aparece no filtro de temporários/pendentes
      const isPro = (profile as any).plan_slug === "premium_ia" || (profile as any).plan_slug === "premium";
      
      if (statusFilter !== "all" && profile.status !== statusFilter) return false;
      
      // Filtro implícito de "Temporários" (usuários em trial ou sem plano definitivo)
      // Ajuste para garantir que PROs não vazem para listas de gestão de acesso temporário
      if (isPro && (statusFilter === "trial" || statusFilter === "pending")) return false;

      if (!term) return true;
      const name = (profile.full_name ?? "").toLowerCase();
      const email = (profile.contact_email ?? "").toLowerCase();
      const cpf = onlyDigits(profile.cpf ?? "");
      return (
        name.includes(term) || email.includes(email) || (digits.length > 0 && cpf.includes(digits))
      );
    });
  }, [profiles.data, search, statusFilter, globalSearch]);

  async function exportCsv() {
    confirm({
      title: "Confirmar Exportação",
      description: "Você deseja exportar a lista atual de usuários para um arquivo CSV? Este arquivo contém dados sensíveis.",
      onConfirm: () => {
        const headers = ["Nome", "CPF", "E-mail Contato", "Status", "Plano", "Cadastro", "Papéis"];
        const rows = filtered.map(p => [
          p.full_name || "—",
          p.cpf || "—",
          p.contact_email || "—",
          STATUS_LABELS[p.status] || p.status,
          (p as any).plan_slug || "free",
          formatDateTime(p.created_at),
          (rolesByUser.data?.get(p.user_id) ?? ["user"]).join(", ")
        ]);
        const csvContent = "\ufeff" + [headers, ...rows].map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `usuarios-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("CSV exportado com sucesso");
      }
    });
  }

  async function exportPdf() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Relatório de Usuários", 14, 15);
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} · Filtro: ${statusFilter === "all" ? "Todos" : STATUS_LABELS[statusFilter]}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["Nome", "CPF", "E-mail", "Status", "Cadastro", "Papéis"]],
      body: filtered.map(p => [
        p.full_name || "—",
        p.cpf ? maskCpf(p.cpf) : "—",
        p.contact_email || "—",
        STATUS_LABELS[p.status] || p.status,
        formatDateTime(p.created_at),
        (rolesByUser.data?.get(p.user_id) ?? ["user"]).join(", ")
      ]),
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`usuarios-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exportado com sucesso");
  }

  async function refreshAll() {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
  }

  const { confirm, ConfirmDialog } = useConfirm();
  return (
    <div className="space-y-3">

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, CPF ou e-mail"
            className="pl-9 h-11 sm:h-10 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-11 sm:h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
              <SelectItem value="canceled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex w-full sm:w-auto gap-2">
            {isAdmin ? <CreateUserDialog /> : null}
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0} className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl">
              <Download className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportPdf} disabled={filtered.length === 0} className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl">
              <FileText className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20">
              <TableHead className="font-black uppercase tracking-wider text-[10px]">Nome</TableHead>
              <TableHead className="hidden md:table-cell font-black uppercase tracking-wider text-[10px]">CPF</TableHead>
              <TableHead className="font-black uppercase tracking-wider text-[10px]">Contato</TableHead>
              <TableHead className="hidden lg:table-cell font-black uppercase tracking-wider text-[10px]">Papéis</TableHead>
              <TableHead className="hidden sm:table-cell font-black uppercase tracking-wider text-[10px]">Situação</TableHead>
              <TableHead className="hidden md:table-cell font-black uppercase tracking-wider text-[10px] text-center">Kids</TableHead>
              <TableHead className="hidden lg:table-cell font-black uppercase tracking-wider text-[10px]">Cadastro</TableHead>
              <TableHead className="text-right font-black uppercase tracking-wider text-[10px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((profile) => (
                <TableRow key={profile.id} className="group/row">
                  <TableCell className="font-medium">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{profile.full_name ?? "—"}</span>
                        {((profile as any).plan_slug === "premium_ia" || (profile as any).plan_slug === "premium") && (
                          <Badge 
                            variant="outline" 
                            className="h-4 px-1 text-[8px] sm:h-5 sm:px-1.5 sm:text-[9px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
                          >
                            <Sparkles className="mr-0.5 size-2 sm:mr-1 sm:size-2.5" />
                            PRO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={(profile as any).kid_user_id ? "outline" : "default"}
                                className={cn(
                                  "h-4 px-1 text-[8px] sm:h-5 sm:px-1.5 sm:text-[9px] font-bold uppercase tracking-wider shrink-0",
                                  (profile as any).kid_user_id 
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                                    : "bg-brand/10 text-brand border-brand/20 hover:bg-brand/20"
                                )}
                              >
                                {(profile as any).kid_user_id ? "Filho" : "Pai/Mãe"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              {(profile as any).kid_user_id 
                                ? "Conta dependente vinculada a um responsável principal." 
                                : "Conta principal com autonomia total e gestão de dependentes."}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Badge variant={profile.status === "active" ? "secondary" : "destructive"} className="h-4 px-1 text-[8px] sm:hidden">
                          {STATUS_LABELS[profile.status] ?? profile.status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{profile.cpf ? maskCpf(profile.cpf) : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm max-w-[120px] truncate sm:max-w-none">
                    {profile.contact_email ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(rolesByUser.data?.get(profile.user_id) ?? ["user"]).map((role) => (
                        <Badge
                          key={role}
                          variant={role === "user" ? "secondary" : "default"}
                          className="text-[10px]"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={profile.status === "active" ? "secondary" : "destructive"}>
                      {STATUS_LABELS[profile.status] ?? profile.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    {(profile as any).kids_count > 0 ? (
                      <Badge variant="outline" className="gap-1 border-brand/30 bg-brand/5 text-brand mx-auto">
                        <Baby className="size-3" />
                        {(profile as any).kids_count}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {formatDateTime(profile.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 opacity-70 hover:opacity-100" 
                            title="Permissões"
                            disabled={!isAdmin}
                          >
                            <Shield className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-3xl">
                          <DialogHeader>
                            <DialogTitle>Permissões: {profile.full_name || profile.contact_email}</DialogTitle>
                          </DialogHeader>
                          <PermissionsPanel targetUserId={profile.user_id} />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 rounded-lg px-2 sm:px-3 text-xs sm:text-sm"
                        onClick={() => setSelected(profile)}
                        disabled={!isAdmin && profile.user_id !== user?.id}
                      >
                        <UserCog className="sm:mr-2 size-4" />
                        <span className="hidden sm:inline">Gerenciar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ManageUserDialog
        profile={selected}
        canEdit={isAdmin}
        isSelf={selected?.user_id === user?.id}
        roles={selected ? (rolesByUser.data?.get(selected.user_id) ?? []) : []}
        onClose={() => setSelected(null)}
        onChanged={refreshAll}
      />
      <ConfirmDialog />
    </div>

  );
}

function ManageUserDialog({
  profile,
  canEdit,
  isSelf,
  roles,
  onClose,
  onChanged,
}: {
  profile: Profile | null;
  canEdit: boolean;
  isSelf: boolean;
  roles: string[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const { confirm, ConfirmDialog } = useConfirm();
  const moveToTrashFn = useServerFn(moveToTrash);
  const [pending, setPending] = useState<string | null>(null);


  async function run(key: string, action: () => Promise<unknown>, successMessage: string) {
    setPending(key);
    try {
      await action();
      await onChanged();
      
      confirm({
        title: "Ação Concluída",
        description: successMessage,
        type: "success",
        confirmLabel: "Entendido",
        onConfirm: () => {}
      });
    } catch (error) {
      console.error("[admin] falha na ação", error);
      
      confirm({
        title: "Falha na Operação",
        description: error instanceof Error ? error.message : "Não foi possível concluir a ação. Verifique a conexão e tente novamente.",
        type: "warning",
        confirmLabel: "Fechar",
        onConfirm: () => {}
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={Boolean(profile)} onOpenChange={(value) => (value ? null : onClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{profile?.full_name ?? "Usuário"}</DialogTitle>
          <DialogDescription>
            {profile?.cpf ? maskCpf(profile.cpf) : "Sem CPF"} ·{" "}
            {profile?.contact_email ?? "sem e-mail de contato"}
          </DialogDescription>
        </DialogHeader>

        {!profile ? null : !canEdit ? (
          <p className="text-sm text-muted-foreground">
            Perfil de suporte: consulta apenas. Ações administrativas exigem papel de admin.
          </p>
        ) : (
          <div className="space-y-5">
            <section>
              <Label className="text-xs uppercase text-muted-foreground">Situação da conta</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["active", "suspended", "canceled"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={profile.status === status ? "default" : "outline"}
                    disabled={pending !== null}
                    onClick={() => {
                      const label = STATUS_LABELS[status];
                      confirm({
                        title: "Alterar Situação",
                        description: `Tem certeza que deseja alterar o status de ${profile.full_name || 'este usuário'} para ${label.toUpperCase()}?`,
                        onConfirm: () => {
                          void run(
                            `status-${status}`,
                            () =>
                              adminSetUserStatus({
                                data: { targetUserId: profile.user_id, status },
                              }),
                            `Usuário agora está ${label}`,
                          );
                        }
                      });
                    }}
                  >
                    {pending === `status-${status}` ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    {STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <Label className="text-xs uppercase text-muted-foreground">Papéis</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["admin", "support"] as const).map((role) => {
                  const has = roles.includes(role);
                  return (
                    <Button
                      key={role}
                      size="sm"
                      variant={has ? "default" : "outline"}
                      disabled={pending !== null || (isSelf && role === "admin" && has)}
                      onClick={() =>
                        run(
                          `role-${role}`,
                          () =>
                            adminSetUserRole({
                              data: { targetUserId: profile.user_id, role, grant: !has },
                            }),
                          has ? "Papel removido" : "Papel concedido",
                        )
                      }
                    >
                      {pending === `role-${role}` ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      {has ? `Remover ${role}` : `Conceder ${role}`}
                    </Button>
                  );
                })}
              </div>
            </section>

            <section>
              <Label htmlFor="admin-pin" className="text-xs uppercase text-muted-foreground">
                Redefinir senha (6 dígitos)
              </Label>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = new FormData(event.currentTarget).get("pin");
                  const pin = onlyDigits(String(input ?? ""));
                  if (pin.length !== 6) {
                    toast.error("A senha precisa ter 6 dígitos");
                    return;
                  }
                  void run(
                    "pin",
                    () => adminResetUserPin({ data: { targetUserId: profile.user_id, pin } }),
                    "Senha redefinida",
                  );
                }}
              >
                <Input
                  id="admin-pin"
                  name="pin"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="tracking-[0.3em]"
                />
                <Button type="submit" disabled={pending !== null}>
                  {pending === "pin" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                </Button>
              </form>
            </section>

            <section>
              <Label className="text-xs uppercase text-muted-foreground">Dados cadastrais</Label>
              <form
                className="mt-2 grid gap-2 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  void run(
                    "profile",
                    () =>
                      adminUpdateUser({
                        data: {
                          targetUserId: profile.user_id,
                          fullName: String(form.get("full_name") ?? ""),
                          contactEmail: String(form.get("contact_email") ?? ""),
                          phone: String(form.get("phone") ?? ""),
                          cpf: String(form.get("cpf") ?? ""),
                          loginEmail: String(form.get("login_email") ?? ""),
                        },
                      }),
                    "Dados atualizados",
                  );
                }}
              >
                <Input name="full_name" defaultValue={profile.full_name ?? ""} placeholder="Nome completo" />
                <Input name="cpf" defaultValue={profile.cpf ?? ""} placeholder="CPF" />
                <Input
                  name="contact_email"
                  type="email"
                  defaultValue={profile.contact_email ?? ""}
                  placeholder="E-mail de contato"
                />
                <Input name="phone" defaultValue={profile.phone ?? ""} placeholder="Telefone" />
                <Input
                  name="login_email"
                  type="email"
                  placeholder="Novo e-mail de acesso (opcional)"
                  className="sm:col-span-2"
                />
                <Button type="submit" variant="outline" disabled={pending !== null} className="sm:col-span-2">
                  {pending === "profile" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Salvar dados cadastrais
                </Button>
              </form>
            </section>

            <section>
              <Label htmlFor="admin-password" className="text-xs uppercase text-muted-foreground">
                Definir senha livre (mín. 8 caracteres)
              </Label>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const password = String(new FormData(event.currentTarget).get("password") ?? "");
                  if (password.length < 8) {
                    toast.error("A senha precisa ter ao menos 8 caracteres");
                    return;
                  }
                  void run(
                    "password",
                    () =>
                      adminSetUserPassword({
                        data: { targetUserId: profile.user_id, password },
                      }),
                    "Senha atualizada",
                  );
                }}
              >
                <Input id="admin-password" name="password" type="text" placeholder="Nova senha" />
                <Button type="submit" variant="outline" disabled={pending !== null}>
                  {pending === "password" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                </Button>
              </form>
            </section>

            <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
              <Label className="text-xs uppercase text-destructive">Ações críticas</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending !== null}
                  onClick={() => {
                    confirm({
                      title: "Cancelar assinatura",
                      description:
                        "As licenças ativas serão revogadas e o usuário voltará ao plano gratuito.",
                      type: "warning",
                      confirmLabel: "Cancelar assinatura",
                      onConfirm: () => {
                        void run(
                          "cancel",
                          () => adminCancelSubscription({ data: { targetUserId: profile.user_id } }),
                          "Assinatura cancelada",
                        );
                      },
                    });
                  }}
                >
                  {pending === "cancel" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Cancelar assinatura
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending !== null || isSelf}
                  onClick={() => {
                    confirm({
                      title: "Mover para Quarentena",
                      description: `Os dados de ${profile.full_name || profile.contact_email || "este usuário"} serão movidos para a lixeira administrativa e o acesso será removido.`,
                      type: "warning",
                      confirmLabel: "Excluir (Quarentena)",
                      onConfirm: async () => {
                        try {
                          await moveToTrashFn({
                            data: {
                              itemId: profile.user_id,
                              itemType: "user",
                              originalData: profile,
                              reason: "Exclusão administrativa com quarentena"
                            }
                          });
                          
                          await run(
                            "delete",
                            () =>
                              adminDeleteUser({
                                data: { targetUserId: profile.user_id, confirmation: "EXCLUIR" },
                              }),
                            "Conta movida para quarentena",
                          );
                          onClose();
                        } catch (err: any) {
                          toast.error("Erro ao processar: " + err.message);
                        }
                      },
                    });
                  }}
                >
                  {pending === "delete" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Excluir conta
                </Button>
                <SyncLicenseButton profile={profile} onChanged={onChanged} />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-50"
                  disabled={pending !== null}
                  onClick={() => {
                    confirm({
                      title: "Limitar tempo de acesso",
                      description:
                        "Defina por quantos dias, a partir de hoje, esta conta continuará com acesso. Use 0 para remover o limite.",
                      confirmLabel: "Aplicar limite",
                      input: { label: "Dias de acesso", type: "number", defaultValue: "30" },
                      onConfirm: (value) => {
                        const numDays = Number.parseInt(value, 10);
                        if (Number.isNaN(numDays) || numDays < 0) {
                          toast.error("Informe um número de dias válido.");
                          return;
                        }
                        void run(
                          "limit-time",
                          () =>
                            adminSetAccessLimit({
                              data: { targetUserId: profile.user_id, days: numDays },
                            }),
                          numDays > 0
                            ? `Acesso limitado por ${numDays} dias`
                            : "Limites de tempo removidos",
                        );
                      },
                    });
                  }}
                >
                  <KeyRound className="size-4" />
                  Limitar Tempo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  disabled={pending !== null}
                  onClick={() => {
                    confirm({
                      title: "Promover para versão paga",
                      description:
                        "A conta passará para o plano Premium IA com status ativo e receberá um aviso na plataforma.",
                      type: "success",
                      confirmLabel: "Promover agora",
                      onConfirm: () => {
                        void run(
                          "promote",
                          () =>
                            adminPromoteToPaid({
                              data: { targetUserId: profile.user_id, planSlug: "premium_ia" },
                            }).then(() => {
                              // Se o usuário promovido for o próprio administrador (teste), recarrega
                              // Se o usuário promovido for o próprio administrador logado, recarrega para atualizar painel
                              supabase.auth.getUser().then(({ data }) => {
                                if (data.user?.id === profile.user_id) {
                                  window.location.href = "/painel";
                                }
                              });
                            }),
                          "Conta atualizada com sucesso! O usuário agora é PRO e tem acesso total aos recursos Premium IA.",
                        );
                      },
                    });
                  }}
                >
                  <TrendingUp className="size-4" />
                  Promover para Pago
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  disabled={pending !== null || isSelf}
                  onClick={() => {
                    confirm({
                      title: "Exclusão Permanente",
                      description: `Esta ação removerá DEFINITIVAMENTE todos os dados de ${profile.full_name || 'este usuário'}. Esta ação NÃO pode ser desfeita.`,
                      type: "warning",
                      confirmLabel: "EXCLUIR PERMANENTEMENTE",
                      input: { label: "Digite 'EXCLUIR' para confirmar", placeholder: "EXCLUIR" },
                      onConfirm: (value) => {
                        if (value !== "EXCLUIR") {
                          toast.error("Confirmação inválida.");
                          return;
                        }
                        void run(
                          "permanent-delete",
                          () => adminDeleteUser({
                            data: { targetUserId: profile.user_id, confirmation: "EXCLUIR" }
                          }),
                          "Usuário excluído permanentemente do sistema."
                        ).then(() => onClose());
                      },
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                  Excluir Permanente
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-rose-500/30 text-rose-600 hover:bg-rose-50"
                  disabled={pending !== null}
                  onClick={() => {
                    confirm({
                      title: "Bloquear acesso",
                      description:
                        "O usuário perderá o acesso imediatamente e receberá uma notificação crítica.",
                      type: "warning",
                      confirmLabel: "Bloquear",
                      onConfirm: () => {
                        void run(
                          "block",
                          () =>
                            adminSetUserStatus({
                              data: { targetUserId: profile.user_id, status: "suspended" },
                            }),
                          "Usuário bloqueado",
                        );
                      },
                    });
                  }}
                >
                  <Shield className="size-4" />
                  Bloquear
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                O cancelamento revoga licenças ativas. A exclusão é definitiva e fica registrada nos
                logs administrativos.
              </p>
            </section>

            <section>
              <Label htmlFor="admin-notes" className="text-xs uppercase text-muted-foreground">
                Anotações de suporte
              </Label>
              <form
                className="mt-2 space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const notes = String(new FormData(event.currentTarget).get("notes") ?? "");
                  void run(
                    "notes",
                    () =>
                      adminSaveSupportNotes({
                        data: { targetUserId: profile.user_id, notes },
                      }),
                    "Anotação salva",
                  );
                }}
              >
                <Textarea
                  id="admin-notes"
                  name="notes"
                  rows={3}
                  defaultValue={profile.support_notes ?? ""}
                  placeholder="Histórico de atendimento, acordos, pendências…"
                />
                <DialogFooter>
                  <Button type="submit" variant="outline" disabled={pending !== null}>
                    {pending === "notes" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Salvar anotação
                  </Button>
                </DialogFooter>
              </form>
            </section>
            <UserAuditTimeline targetUserId={profile.user_id} />
          </div>
        )}
        <ConfirmDialog />
      </DialogContent>

    </Dialog>
  );
}

function SyncLicenseButton({ profile, onChanged }: { profile: Profile; onChanged: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const result = await syncUserLicense({ data: { userId: profile.user_id } });
      if (result.success) {
        toast.success(`Licença sincronizada: ${result.licenseKey}`);
        await onChanged();
      } else {
        toast.error(result.message || "Nenhuma licença ativa para sincronizar.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao sincronizar licença");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={handleSync}
      className="gap-2"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
      Sincronizar Licença
    </Button>
  );
}
