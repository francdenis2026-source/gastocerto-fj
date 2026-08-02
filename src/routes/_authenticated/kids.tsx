import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import QRCode from "qrcode";
import {
  Baby,
  CalendarClock,
  Copy,
  Eye,
  History,
  KeyRound,
  Loader2,
  LogIn,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDependents, type Dependent } from "@/lib/dependents";
import { useKidAccessAudit } from "@/lib/kids-access-audit";
import {
  isValidKidCode,
  isValidKidPin,
  normalizeKidCode,
  suggestKidCode,
} from "@/lib/kids-account";
import {
  revokeKidAccess,
  saveKidAccess,
  saveKidVisibility,
} from "@/lib/kids-account.functions";
import {
  DEFAULT_KID_VISIBILITY,
  KID_ACCESS_ACTION_LABELS,
  KID_VISIBILITY_FIELDS,
  describeKidCodeExpiry,
  parseKidVisibility,
  type KidVisibility,
} from "@/lib/kids-access";
import { KID_LOCK_MINUTES, KID_MAX_ATTEMPTS } from "@/lib/kids-login-guard";

export const Route = createFileRoute("/_authenticated/kids")({
  head: () => ({
    meta: [
      { title: "Espaço Kids — Acessos e permissões | GastoCerto" },
      {
        name: "description",
        content:
          "Crie o código e a senha de acesso das suas crianças, escolha o que elas podem ver e acompanhe o histórico de alterações.",
      },
      { property: "og:title", content: "Espaço Kids — Acessos e permissões" },
      {
        property: "og:description",
        content: "Painel do responsável para liberar, trocar e revogar o acesso do painel Kids.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KidsAccessPage,
});

function KidsAccessPage() {
  const dependents = useDependents();
  const audit = useKidAccessAudit(60);
  const kids = (dependents.data ?? []).filter((item) => item.active !== false);

  const summary = useMemo(() => {
    const withCode = kids.filter((kid) => Boolean(kid.kid_login_code));
    const active = withCode.filter((kid) => {
      const expires = kid.kid_code_expires_at ? new Date(kid.kid_code_expires_at).getTime() : null;
      return expires === null || expires > Date.now();
    });
    const nextExpiry = withCode
      .map((kid) => kid.kid_code_expires_at)
      .filter((value): value is string => Boolean(value))
      .sort()[0] ?? null;
    const lastLogin = withCode
      .map((kid) => (kid.kid_last_login_at ? { at: kid.kid_last_login_at, name: kid.name } : null))
      .filter((value): value is { at: string; name: string } => Boolean(value))
      .sort((a, b) => (a.at < b.at ? 1 : -1))[0] ?? null;
    return { total: withCode.length, active: active.length, nextExpiry, lastLogin };
  }, [kids]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-extrabold">
          <Baby className="size-5 text-primary" aria-hidden /> Espaço Kids — acessos
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Aqui você cria o código e a senha de cada criança, escolhe o que ela pode ver e acompanha o
          histórico. Todo acesso fica vinculado à sua conta: ninguém entra sem o código que você criou.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <KeyRound className="size-3.5 text-primary" aria-hidden /> Códigos ativos
          </p>
          <p className="mt-1 text-2xl font-extrabold">{summary.active}</p>
          <p className="text-[11px] text-muted-foreground">
            {summary.total === 0
              ? "Nenhum acesso liberado ainda."
              : `${summary.total} código(s) criado(s) no total.`}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="size-3.5 text-primary" aria-hidden /> Validade do código
          </p>
          <p className="mt-1 text-[13px] font-bold">
            {describeKidCodeExpiry(summary.nextExpiry).label}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {summary.nextExpiry ? "Primeiro código a vencer." : "Defina uma validade ao liberar o acesso."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <LogIn className="size-3.5 text-primary" aria-hidden /> Último login da criança
          </p>
          <p className="mt-1 text-[13px] font-bold">
            {summary.lastLogin
              ? new Date(summary.lastLogin.at).toLocaleString("pt-BR")
              : "Ainda sem acesso registrado"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {summary.lastLogin ? summary.lastLogin.name : "O registro aparece após a primeira entrada."}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-muted/30 p-4 text-[12px] text-muted-foreground">
        <p className="flex items-center gap-2 font-bold text-foreground">
          <ShieldCheck className="size-4 text-primary" aria-hidden /> Proteção do login infantil
        </p>
        <p className="mt-1">
          Após {KID_MAX_ATTEMPTS} tentativas erradas de código ou senha, o acesso fica bloqueado por{" "}
          {KID_LOCK_MINUTES} minutos automaticamente. Cada código pertence só a esta conta e pode ter
          validade definida por você.
        </p>
      </section>


      {dependents.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : kids.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Cadastre uma criança em “Meus Cadastros” para liberar o acesso dela.
        </p>
      ) : (
        <div className="space-y-5">
          {kids.map((kid) => (
            <KidAccessCard key={kid.id} dependent={kid} />
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <History className="size-4 text-primary" aria-hidden /> Histórico de acessos
        </h2>
        {(audit.data ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
            Nenhuma alteração registrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {(audit.data ?? []).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">
                    {KID_ACCESS_ACTION_LABELS[row.action] ?? row.action}
                    {row.dependent_name ? ` · ${row.dependent_name}` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("pt-BR")}
                    {row.code ? ` · código ${row.code}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {row.action === "revoked" ? "Revogado" : "Registrado"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KidAccessCard({ dependent }: { dependent: Dependent }) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveKidAccess);
  const revoke = useServerFn(revokeKidAccess);
  const saveVisibility = useServerFn(saveKidVisibility);

  const [code, setCode] = useState(dependent.kid_login_code ?? "");
  const [pin, setPin] = useState("");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<KidVisibility>(
    parseKidVisibility((dependent as { kid_visibility?: unknown }).kid_visibility) ??
      DEFAULT_KID_VISIBILITY,
  );

  const expiry = useMemo(
    () => describeKidCodeExpiry(dependent.kid_code_expires_at ?? null),
    [dependent.kid_code_expires_at],
  );

  const loginUrl = useMemo(() => {
    if (!dependent.kid_login_code || typeof window === "undefined") return null;
    return `${window.location.origin}/auth?kid=${encodeURIComponent(dependent.kid_login_code)}`;
  }, [dependent.kid_login_code]);

  useEffect(() => {
    if (!loginUrl) {
      setQr(null);
      return;
    }
    let active = true;
    QRCode.toDataURL(loginUrl, { width: 220, margin: 1 })
      .then((url) => {
        if (active) setQr(url);
      })
      .catch(() => setQr(null));
    return () => {
      active = false;
    };
  }, [loginUrl]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["dependents"] });
  const refreshAudit = () => queryClient.invalidateQueries({ queryKey: ["kid_access_audit"] });

  async function persist(nextCode: string, reason: "created" | "updated" | "rotated") {
    const clean = normalizeKidCode(nextCode);
    if (!isValidKidCode(clean)) {
      toast.error("Escolha um código com pelo menos 4 caracteres.");
      return;
    }
    if (!isValidKidPin(pin)) {
      toast.error("Digite a senha da criança (4 a 6 números) para confirmar.");
      return;
    }
    setBusy(true);
    try {
      const result = await save({ data: { dependentId: dependent.id, code: clean, pin, expiresDays: days, reason } });
      setCode(clean);
      setPin("");
      toast.success(reason === "rotated" ? "Novo código gerado!" : "Acesso salvo!", {
        description: `Código ${result.code} — validade de ${days} dia(s).`,
      });
      void refresh();
      void refreshAudit();
    } catch (error) {
      toast.error("Não foi possível salvar o acesso.", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    setBusy(true);
    try {
      await revoke({ data: { dependentId: dependent.id } });
      setCode("");
      setPin("");
      toast.success("Acesso removido.");
      void refresh();
      void refreshAudit();
    } catch (error) {
      toast.error("Não foi possível remover o acesso.", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility(key: keyof KidVisibility, value: boolean) {
    const next = { ...visibility, [key]: value };
    setVisibility(next);
    try {
      await saveVisibility({ data: { dependentId: dependent.id, visibility: next } });
      void refresh();
      void refreshAudit();
    } catch (error) {
      setVisibility(visibility);
      toast.error("Não foi possível salvar as permissões.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl text-sm font-black text-white"
            style={{ backgroundColor: dependent.color ?? "#f97316" }}
            aria-hidden
          >
            {dependent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold">{dependent.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {dependent.kid_login_code ? expiry.label : "Sem acesso liberado"}
            </p>
          </div>
        </div>
        {dependent.kid_login_code ? (
          <Badge variant={expiry.expired ? "destructive" : "secondary"} className="text-[10px]">
            {expiry.expired ? "Código expirado" : "Acesso ativo"}
          </Badge>
        ) : null}
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor={`code-${dependent.id}`} className="text-[12px]">
                Código de acesso
              </Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id={`code-${dependent.id}`}
                  value={code}
                  onChange={(event) => setCode(normalizeKidCode(event.target.value))}
                  placeholder="EX: JOAO-A1B"
                  className="font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCode(suggestKidCode(dependent.name))}
                >
                  Gerar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor={`pin-${dependent.id}`} className="text-[12px]">
                Senha (4 a 6 números)
              </Label>
              <Input
                id={`pin-${dependent.id}`}
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••"
                className="mt-1 tracking-[0.3em]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label htmlFor={`days-${dependent.id}`} className="text-[12px]">
                Validade (dias)
              </Label>
              <Input
                id={`days-${dependent.id}`}
                inputMode="numeric"
                value={String(days)}
                onChange={(event) =>
                  setDays(Math.min(3650, Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1)))
                }
                className="mt-1 w-24"
              />
            </div>
            <Button type="button" size="sm" disabled={busy} onClick={() => persist(code, "updated")}>
              <KeyRound className="mr-1.5 size-3.5" />
              {dependent.kid_login_code ? "Atualizar acesso" : "Liberar acesso"}
            </Button>
            {dependent.kid_login_code ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => persist(suggestKidCode(dependent.name), "rotated")}
                >
                  <RefreshCw className="mr-1.5 size-3.5" /> Rotacionar código
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={busy}
                  onClick={handleRevoke}
                >
                  <Trash2 className="mr-1.5 size-3.5" /> Revogar
                </Button>
              </>
            ) : null}
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="flex items-center gap-2 text-[12px] font-bold">
              <Eye className="size-3.5 text-primary" aria-hidden /> O que a criança pode ver
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {KID_VISIBILITY_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-2.5"
                >
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold">{field.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{field.hint}</span>
                  </span>
                  <Switch
                    checked={visibility[field.key]}
                    onCheckedChange={(value) => void toggleVisibility(field.key, value)}
                    aria-label={field.label}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[12px] font-bold">
            <QrCode className="size-3.5 text-primary" aria-hidden /> QR de entrada
          </p>
          {qr ? (
            <>
              <img
                src={qr}
                alt={`QR code de acesso do painel Kids de ${dependent.name}`}
                className="mx-auto mt-2 w-40 rounded-lg bg-white p-2"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">{expiry.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                A criança escaneia, o código já vem preenchido e ela digita só a senha.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full text-[11px]"
                disabled={busy}
                onClick={() => persist(suggestKidCode(dependent.name), "rotated")}
              >
                <RefreshCw className="mr-1.5 size-3.5" /> Atualizar QR
              </Button>
            </>
          ) : (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Libere o acesso para gerar o QR code de entrada.
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
