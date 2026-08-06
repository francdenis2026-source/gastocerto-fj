import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format-utils";
import {
  generateMasterCode,
  getMasterCodeStatus,
  resetMasterCode,
  revealMasterCode,
} from "@/lib/master-code.functions";
import { useConfirm } from "@/components/ui/confirm-dialog";

/** Redefinição segura do código mestre usado nas ações críticas do painel. */
export function MasterCodePanel() {
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ["admin", "master-code-status"],
    queryFn: () => getMasterCodeStatus(),
  });
  const reset = useServerFn(resetMasterCode);
  const reveal = useServerFn(revealMasterCode);
  const generate = useServerFn(generateMasterCode);

  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visibleCode, setVisibleCode] = useState<string | null>(null);

  const revealMutation = useMutation({
    mutationFn: () => reveal(),
    onSuccess: (result) => {
      if (result.code) setVisibleCode(result.code);
      else toast.info("Este código foi salvo apenas como hash. Gere um novo para poder visualizá-lo.");
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível exibir o código."),
  });

  const generateMutation = useMutation({
    mutationFn: () => generate(),
    onSuccess: (result) => {
      setVisibleCode(result.code);
      toast.success("Novo código mestre gerado e salvo.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-code-status"] });
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível gerar o código."),
  });

  const mutation = useMutation({
    mutationFn: () =>
      reset({
        data: { currentCode, newCode, confirmCode, password, confirmation },
      }),
    onSuccess: () => {
      toast.success("Código mestre redefinido com segurança.");
      setCurrentCode("");
      setNewCode("");
      setConfirmCode("");
      setPassword("");
      setConfirmation("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-code-status"] });
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível redefinir o código."),
  });


  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light/10">
          <KeyRound className="size-4 text-brand-light" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Código mestre administrativo</h2>
          <p className="text-xs text-muted-foreground">
            Exigido para bloquear, promover ou excluir contas. Guardado apenas como hash seguro.
          </p>
        </div>
      </header>

      <div className="mt-3 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        {status.isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-3.5 animate-spin" /> Verificando…
          </span>
        ) : status.data?.isCustom ? (
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Código personalizado ativo
            {status.data.updatedAt ? ` · atualizado em ${formatDateTime(status.data.updatedAt)}` : ""}
          </span>
        ) : (
          <span>
            Ainda usando o código padrão do ambiente (segredo <strong>ADMIN_MASTER_CODE</strong>).
            Redefina abaixo para criar um código exclusivo seu.
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-background p-3">
        <code className="min-w-[9rem] rounded-md bg-muted px-3 py-1.5 font-mono text-sm tracking-widest">
          {visibleCode ?? "••••-••••-••••"}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9"
          disabled={revealMutation.isPending}
          onClick={() => (visibleCode ? setVisibleCode(null) : revealMutation.mutate())}
        >
          {revealMutation.isPending ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : visibleCode ? (
            <EyeOff className="size-4 mr-2" />
          ) : (
            <Eye className="size-4 mr-2" />
          )}
          {visibleCode ? "Ocultar" : "Mostrar código"}
        </Button>
        {visibleCode ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => {
              void navigator.clipboard.writeText(visibleCode);
              toast.success("Código copiado.");
            }}
          >
            <Copy className="size-4 mr-2" />
            Copiar
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="h-9"
          disabled={generateMutation.isPending}
          onClick={() => {
            confirm({
              title: "Gerar novo código mestre",
              description: "O código atual deixará de funcionar imediatamente. Guarde o novo código em local seguro.",
              type: "warning",
              confirmLabel: "Gerar novo código",
              onConfirm: () => generateMutation.mutate(),
            });
          }}
        >
          {generateMutation.isPending ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="size-4 mr-2" />
          )}
          Gerar novo código
        </Button>
      </div>



      <form
        className="mt-3 grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="mc-current" className="text-xs">Código mestre atual</Label>
          <Input
            id="mc-current"
            type="password"
            autoComplete="off"
            value={currentCode}
            onChange={(event) => setCurrentCode(event.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mc-password" className="text-xs">Senha da sua conta de admin</Label>
          <Input
            id="mc-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mc-new" className="text-xs">Novo código (mín. 8 caracteres)</Label>
          <Input
            id="mc-new"
            type="password"
            autoComplete="new-password"
            value={newCode}
            onChange={(event) => setNewCode(event.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mc-confirm" className="text-xs">Confirmar novo código</Label>
          <Input
            id="mc-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmCode}
            onChange={(event) => setConfirmCode(event.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="mc-phrase" className="text-xs">
            Digite <strong>REDEFINIR</strong> para confirmar
          </Label>
          <Input
            id="mc-phrase"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="h-9"
            placeholder="REDEFINIR"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" size="sm" disabled={mutation.isPending} className="h-9">
            {mutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Redefinir código mestre
          </Button>
        </div>
      </form>
      <ConfirmDialog />
    </section>
  );
}
