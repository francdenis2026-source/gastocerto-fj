import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, KeyRound, Loader2, Search, UserCog, Shield, Baby, Info, ShieldCheck, TrendingUp } from "lucide-react";
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
import { UserAuditTimeline } from "./user-audit-timeline";
import { usePlanAccess } from "@/lib/plan-features";
import { syncUserLicense } from "@/lib/license-sync.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  adminResetUserPin,
  adminSaveSupportNotes,
  adminSetUserRole,
  adminSetUserStatus,
} from "@/lib/admin.functions";
import {
  adminCancelSubscription,
  adminDeleteUser,
  adminSetUserPassword,
  adminUpdateUser,
} from "@/lib/admin-users.functions";
import { maskCpf, onlyDigits } from "@/lib/cpf";
import { formatDateTime } from "@/lib/format";
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

  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    staleTime: 60_000,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, plan:plans(slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p) => ({ ...p, plan_slug: (p as any).plan?.slug })) as any;
    },
  });

  // Quantidade de filhos (Espaço Kids) por responsável, contada separadamente
  // porque não existe relação direta entre profiles e dependents.
  const kidsCount = useQuery({
    queryKey: ["admin", "profiles", "kids-count"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("dependents").select("user_id");
      if (error) throw error;
      const map = new Map<string, number>();
      for (const row of data ?? []) {
        map.set(row.user_id, (map.get(row.user_id) ?? 0) + 1);
      }
      return map;
    },
  });


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
      if (statusFilter !== "all" && profile.status !== statusFilter) return false;
      if (!term) return true;
      const name = (profile.full_name ?? "").toLowerCase();
      const email = (profile.contact_email ?? "").toLowerCase();
      const cpf = onlyDigits(profile.cpf ?? "");
      return (
        name.includes(term) || email.includes(term) || (digits.length > 0 && cpf.includes(digits))
      );
    });
  }, [profiles.data, search, statusFilter]);

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
    doc.text("GastoCerto — Relatório de Usuários", 14, 15);
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

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, CPF ou e-mail"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="suspended">Suspensos</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0} className="h-10">
            <Download className="size-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={filtered.length === 0} className="h-10">
            <FileText className="size-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Kids</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {profile.full_name ?? "—"}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={(profile as any).kid_user_id ? "outline" : "default"}
                              className={cn(
                                "h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider",
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
                    </div>
                  </TableCell>
                  <TableCell>{profile.cpf ? maskCpf(profile.cpf) : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.contact_email ?? "—"}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <Badge variant={profile.status === "active" ? "secondary" : "destructive"}>
                      {STATUS_LABELS[profile.status] ?? profile.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(kidsCount.data?.get(profile.user_id) ?? 0) > 0 ? (
                      <Badge variant="outline" className="gap-1 border-brand/30 bg-brand/5 text-brand">
                        <Baby className="size-3" />
                        {kidsCount.data?.get(profile.user_id)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDateTime(profile.created_at)}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8" 
                          title="Permissões"
                          disabled={!isAdmin}
                        >
                          <Shield className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Permissões: {profile.full_name || profile.contact_email}</DialogTitle>
                        </DialogHeader>
                        <PermissionsPanel targetUserId={profile.user_id} />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelected(profile)}
                      disabled={!isAdmin && profile.user_id !== user?.id}
                    >
                      <UserCog className="mr-2 size-4" />
                      Gerenciar
                    </Button>
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
  const [pending, setPending] = useState<string | null>(null);


  async function run(key: string, action: () => Promise<unknown>, successMessage: string) {
    setPending(key);
    try {
      await action();
      await onChanged();
      toast.success(successMessage);
    } catch (error) {
      console.error("[admin] falha na ação", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação");
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
                    if (!window.confirm("Cancelar a assinatura e voltar este usuário ao plano gratuito?")) return;
                    void run(
                      "cancel",
                      () => adminCancelSubscription({ data: { targetUserId: profile.user_id } }),
                      "Assinatura cancelada",
                    );
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
                    const confirmText = prompt(`Excluir a conta de "${profile.full_name || profile.contact_email}"? Digite EXCLUIR para confirmar:`);
                    if (confirmText !== "EXCLUIR") return;
                    void run(
                      "delete",
                      () =>
                        adminDeleteUser({
                          data: { targetUserId: profile.user_id, confirmation: "EXCLUIR" },
                        }),
                      "Conta excluída",
                    ).then(onClose);
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
                    const days = prompt("Limitar acesso por quantos dias a partir de hoje? (0 para remover limite)");
                    if (days === null) return;
                    const numDays = parseInt(days);
                    if (isNaN(numDays)) return;

                    void run(
                      "limit-time",
                      async () => {
                         const endsAt = new Date();
                         endsAt.setDate(endsAt.getDate() + numDays);
                         
                         const { error } = await supabase.from("profiles").update({
                            trial_ends_at: numDays > 0 ? endsAt.toISOString() : null,
                            trial_plan_slug: numDays > 0 ? (profile.plan_id || 'premium_ia') : null
                         } as any).eq("user_id", profile.user_id);
                         if (error) throw error;
                      },
                      numDays > 0 ? `Acesso limitado por ${numDays} dias` : "Limites de tempo removidos"
                    );
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
                    const ok = window.confirm("Promover este usuário para a versão PAGA (Premium IA) agora?");
                    if (!ok) return;
                    void run(
                      "promote",
                      async () => {
                         const { data: plans } = await supabase.from("plans").select("id").eq("slug", "premium_ia").maybeSingle();
                         const { error } = await supabase.from("profiles").update({
                            plan_id: plans?.id,
                            status: 'active'
                         } as any).eq("user_id", profile.user_id);
                         if (error) throw error;
                      },
                      "Usuário promovido para Premium IA"
                    );
                  }}
                >
                  <TrendingUp className="size-4" />
                  Promover para Pago
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-rose-500/30 text-rose-600 hover:bg-rose-50"
                  disabled={pending !== null}
                  onClick={() => {
                    const ok = window.confirm("Bloquear este usuário imediatamente?");
                    if (!ok) return;
                    void run(
                      "block",
                      () => adminSetUserStatus({ data: { targetUserId: profile.user_id, status: 'suspended' } }),
                      "Usuário bloqueado"
                    );
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
