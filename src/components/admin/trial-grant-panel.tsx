import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Gift, Loader2, FileDown, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { maskCpf } from "@/lib/cpf";
import { formatDateTime } from "@/lib/format-utils";
import { adminGrantTrial } from "@/lib/plan.functions";
import { verifyMasterCode } from "@/lib/master-code.functions";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { adminSetUserStatus } from "@/lib/admin.functions";
import {
  adminDeleteUser,
  adminPromoteToPaid,
} from "@/lib/admin-users.functions";

import { TRIAL_OPTIONS, type TrialSlug } from "@/lib/plan-features";

type Row = {
  user_id: string;
  full_name: string | null;
  cpf: string | null;
  trial_plan_slug: string | null;
  trial_ends_at: string | null;
};

export function TrialGrantPanel() {
  const grant = useServerFn(adminGrantTrial);
  const verifyCode = useServerFn(verifyMasterCode);
  const setStatus = useServerFn(adminSetUserStatus);
  const promote = useServerFn(adminPromoteToPaid);
  const removeUser = useServerFn(adminDeleteUser);
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [slug, setSlug] = useState<TrialSlug>("trial_14");
  const [customDays, setCustomDays] = useState(1);

  /** Valida o código mestre no servidor (hash seguro / segredo de ambiente). */
  async function checkMasterCode(code: string) {
    try {
      await verifyCode({ data: { code: code.trim() } });
      return true;
    } catch {
      toast.error("Código mestre incorreto.");
      return false;
    }
  }


  const users = useQuery({
    queryKey: ["admin", "trial-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, cpf, trial_plan_slug, trial_ends_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = users.data ?? [];
    if (!term) return rows.slice(0, 12);
    return rows
      .filter(
        (row) =>
          (row.full_name ?? "").toLowerCase().includes(term) ||
          (row.cpf ?? "").includes(term.replace(/\D/g, "")),
      )
      .slice(0, 12);
  }, [users.data, search]);

  const mutation = useMutation({
    mutationFn: (targetUserId: string) => grant({ data: { targetUserId, slug, customDays, restart: true } }),
    onSuccess: (result) => {
      toast.success(`Teste de ${result.days} dias liberado até ${formatDateTime(result.endsAt)}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "trial-users"] });
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível conceder o teste."),
  });

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text("GastoCerto — Relatório de Usuários em Teste", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Nome", "CPF", "Expira em"]],
      body: (users.data ?? []).filter(u => u.trial_ends_at).map(u => [u.full_name || "—", u.cpf ? maskCpf(u.cpf) : "—", formatDateTime(u.trial_ends_at!)]),
      theme: "striped"
    });
    doc.save("usuarios-teste.pdf");
    toast.success("PDF exportado.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.72_0.14_160/0.15)]">
          <Gift className="size-4 text-[oklch(0.62_0.14_160)]" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Conceder período de teste (Cortesia)</h2>
          <p className="text-xs text-muted-foreground">
            Libera acesso imediato a um usuário específico por um período determinado.
          </p>
        </div>
      </header>

      <div className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1">Como usar:</h3>
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
          <li>Busque o usuário pelo <strong>nome ou CPF</strong> abaixo.</li>
          <li>Escolha a <strong>duração</strong> desejada (7, 15 ou 30 dias).</li>
          <li>Clique em <strong>"Liberar teste"</strong> para ativar instantaneamente. A mensagem "nunca usou" indica que o usuário ainda não recebeu um período de cortesia administrativa.</li>
          <li>O usuário terá acesso a <strong>todos os recursos</strong>, inclusive a IA.</li>
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-end">
        <div className="min-w-56 flex-1 space-y-1">
          <Label htmlFor="trial-search" className="text-xs">
            Buscar usuário
          </Label>
          <Input
            id="trial-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome ou CPF"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Duração</Label>
          <Select value={slug} onValueChange={(value) => setSlug(value as TrialSlug)}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
               {TRIAL_OPTIONS.map((option) => (
                 <SelectItem key={option.slug} value={option.slug}>
                   {option.label}
                 </SelectItem>
               ))}
               <SelectItem value="trial_1h">1 Hora</SelectItem>
               <SelectItem value="trial_6h">6 Horas</SelectItem>
               <SelectItem value="trial_12h">12 Horas</SelectItem>
               <SelectItem value="trial_custom">Dias Específicos</SelectItem>
             </SelectContent>
           </Select>
         </div>
         {((slug as string) === "trial_custom") && (
           <div className="w-24 space-y-1">
             <Label className="text-xs">Dias</Label>
             <Input
               type="number"
               min={1}
               max={365}
               value={customDays}
               onChange={(e) => setCustomDays(Number(e.target.value))}
               className="h-9"
             />
           </div>
         )}
        <Button variant="outline" size="sm" onClick={exportPdf} className="h-9">
            <FileText className="size-4 mr-2" />
            PDF
        </Button>
      </div>

      {users.isLoading ? (
        <Loader2 className="mt-4 size-5 animate-spin text-muted-foreground" />
      ) : (
        <ul className="mt-3 divide-y divide-border/70">
          {filtered.map((row) => (
            <li key={row.user_id} className="flex flex-wrap items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {row.cpf ? maskCpf(row.cpf) : "sem CPF"}
                  {row.trial_ends_at
                    ? ` · teste ${row.trial_plan_slug ?? ""} até ${formatDateTime(row.trial_ends_at)}`
                    : " · nunca usou teste"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-brand-light/30 text-brand-light hover:bg-brand-light/5"
                  disabled={mutation.isPending}
                  onClick={() => {
                    confirm({
                      title: "Bloquear acesso",
                      description: `${row.full_name || "Este usuário"} perderá o acesso imediatamente. Confirme com o código mestre.`,
                      type: "warning",
                      confirmLabel: "Bloquear",
                      input: { label: "Código mestre", type: "password" },
                      onConfirm: async (code) => {
                        if (!(await checkMasterCode(code))) return;
                        try {
                          await setStatus({
                            data: { targetUserId: row.user_id, status: "suspended" },
                          });
                          toast.success("Usuário bloqueado com sucesso.");
                          void queryClient.invalidateQueries({ queryKey: ["admin", "trial-users"] });
                        } catch {
                          toast.error("Não foi possível bloquear o usuário.");
                        }
                      },
                    });
                  }}
                >
                  Bloquear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                  disabled={mutation.isPending}
                  onClick={() => {
                    confirm({
                      title: "Liberar período de teste",
                      description: `Conceder ${TRIAL_OPTIONS.find((o) => o.slug === slug)?.label ?? "o período selecionado"} de cortesia para ${row.full_name || "este usuário"}?`,
                      confirmLabel: "Liberar teste",
                      onConfirm: () => mutation.mutate(row.user_id),
                    });
                  }}
                >
                  Liberar teste
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary/5"
                  disabled={mutation.isPending}
                  onClick={() => {
                    confirm({
                      title: "Promover para versão paga",
                      description: `${row.full_name || "Este usuário"} passará para o plano Premium IA com status ativo.`,
                      type: "success",
                      confirmLabel: "Promover agora",
                      onConfirm: async () => {
                        try {
                          await promote({
                            data: { targetUserId: row.user_id, planSlug: "premium_ia" },
                          });
                          toast.success("Conta promovida para Premium IA.");
                          void queryClient.invalidateQueries({ queryKey: ["admin", "trial-users"] });
                        } catch {
                          toast.error("Não foi possível promover a conta.");
                        }
                      },
                    });
                  }}
                >
                  Promover para pago
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2"
                  onClick={() => {
                    confirm({
                      title: "Excluir conta definitivamente",
                      description: `Todos os dados de ${row.full_name || "este usuário"} serão apagados. Confirme com o código mestre.`,
                      type: "warning",
                      confirmLabel: "Excluir",
                      input: { label: "Código mestre", type: "password" },
                      onConfirm: async (code) => {
                        if (!(await checkMasterCode(code))) return;
                        try {
                          await removeUser({
                            data: { targetUserId: row.user_id, confirmation: "EXCLUIR" },
                          });
                          toast.success("Conta excluída definitivamente.");
                          void queryClient.invalidateQueries({ queryKey: ["admin", "trial-users"] });
                        } catch {
                          toast.error("Erro ao excluir conta.");
                        }
                      },
                    });
                  }}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="py-3 text-xs text-muted-foreground">Nenhum usuário encontrado.</li>
          ) : null}
        </ul>
      )}
      <ConfirmDialog />
    </section>
  );
}