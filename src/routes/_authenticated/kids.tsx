import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn, useHydrated } from "@tanstack/react-start";
import QRCode from "qrcode";
import {
  Baby,
  CalendarClock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileDown,
  History,
  Info,
  KeyRound,
  LayoutGrid,
  Loader2,
  LogIn,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Tv,
  AlertCircle,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  getKidSessions,
  blockKidSession,
  updateKidsSecuritySettings,
  updateKidUpgradeConfig,
} from "@/lib/kids-account.functions";
import {
  createExternalCode,
  listExternalCodes,
  revokeExternalCode,
  updateExternalCodeExpiry,
  getExternalAccessLogs,
} from "@/lib/external-access.functions";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DEFAULT_KID_VISIBILITY,
  KID_ACCESS_ACTION_LABELS,
  KID_VISIBILITY_FIELDS,
  describeKidCodeExpiry,
  parseKidVisibility,
  type KidVisibility,
  KID_UPGRADE_OPTIONS,
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
  const [search, setSearch] = useState("");
  const kids = (dependents.data ?? []).filter((item) => item.active !== false);
  const filteredKids = kids.filter((kid) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      kid.name.toLowerCase().includes(term) ||
      (kid.kid_login_code ?? "").toLowerCase().includes(term)
    );
  });

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
          <div className="flex items-center gap-2">
            <p className={cn("mt-1 text-[13px] font-bold", describeKidCodeExpiry(summary.nextExpiry).nearExpiry && "text-orange-500")}>
              {describeKidCodeExpiry(summary.nextExpiry).label}
            </p>
            {describeKidCodeExpiry(summary.nextExpiry).nearExpiry && (
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 animate-pulse text-[9px] py-0 h-4 flex items-center gap-1">
                <AlertCircle className="size-2" /> REEMITIR QR
              </Badge>
            )}
          </div>
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
          <ShieldCheck className="size-4 text-primary" aria-hidden /> Proteção e Futuro do Login Infantil
        </p>
        <p className="mt-1">
          Após {KID_MAX_ATTEMPTS} tentativas erradas de código ou senha, o acesso fica bloqueado por{" "}
          {KID_LOCK_MINUTES} minutos automaticamente. 
          <strong> Novidade:</strong> Ao atingir 14 anos, o sistema permitirá o upgrade automático 
          para uma conta independente. Você pode definir tempos personalizados de expiração do código
          até o limite de upgrade automático (30 dias a 1 ano ou mais).
        </p>
      </section>




      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Baby className="size-4" />
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-9 text-[11px]" 
          onClick={() => {
            const withCode = kids.filter(k => k.kid_login_code);
            const csv = [
              ['Criança', 'Código', 'Expiração', 'Último Login'],
              ...withCode.map(k => [
                k.name, 
                k.kid_login_code, 
                k.kid_code_expires_at ? new Date(k.kid_code_expires_at).toLocaleString('pt-BR') : 'Sem expiração',
                k.kid_last_login_at ? new Date(k.kid_last_login_at).toLocaleString('pt-BR') : 'Nunca'
              ])
            ].map(e => e.join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `acessos-kids-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }}
        >
          <FileDown className="size-4" />
          Exportar Acessos
        </Button>
      </div>

      {dependents.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : filteredKids.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {search ? "Nenhum acesso encontrado para esta busca." : "Cadastre uma criança em “Meus Cadastros” para liberar o acesso dela."}
        </p>
      ) : (
        <div className="space-y-5">
          {filteredKids.map((kid) => (
            <KidAccessCard key={kid.id} dependent={kid} />
          ))}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <History className="size-4 text-primary" aria-hidden /> Auditoria e Histórico Detalhado
          </h2>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => {
            const data = (audit.data ?? []).map(row => ({
              Data: new Date(row.created_at).toLocaleString('pt-BR'),
              Acao: KID_ACCESS_ACTION_LABELS[row.action] || row.action,
              Dependente: row.dependent_name || '-',
              Codigo: row.code || '-'
            }));
            const csv = [
              ['Data', 'Ação', 'Dependente', 'Código'],
              ...data.map(r => [r.Data, r.Acao, r.Dependente, r.Codigo])
            ].map(e => e.join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `auditoria-kids-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <FileDown className="size-3" />
            Exportar CSV
          </Button>
        </div>
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

      <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-[12px]">
        <p className="flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
          <Tv className="size-4" aria-hidden /> Controle de Fim de Semana
        </p>
        <p className="mt-1 text-muted-foreground">
          Novidade: Agora você pode acompanhar gastos com <strong>Carnes Assadas, Frango e Churrasco</strong> na categoria "Churrasco & Fim de Semana".
          Perfeito para monitorar aquele almoço especial de domingo!
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ExternalLink className="size-4 text-primary" aria-hidden /> Acessos Externos (Adultos)
          </h2>
          <ExternalCodeCreator />
        </div>
        <div className="rounded-2xl border border-border bg-muted/20 p-4 text-[12px] text-muted-foreground">
          <p className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <ShieldCheck className="size-3.5 text-primary" /> Como funciona o Acesso Externo
          </p>
          Crie links protegidos por senha para que outras pessoas (contadores, sócios ou cônjuges) visualizem
          suas finanças sem precisar criar conta. Você controla a expiração e o que eles podem ver.
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <ExternalCodesList />
          <NotificationPreferences userId={kids[0]?.user_id || ""} />
        </div>
      </section>

    </div>

  );
}



function NotificationPreferences({ userId }: { userId: string }) {
  const isHydrated = useHydrated();
  const updatePrefs = useServerFn(updateKidNotificationPrefs);
  const { data: profile } = useProfile();
  
  const initialPrefs = (profile as any)?.kid_notification_prefs || {
    channels: { email: true, push: true, whatsapp: false },
    frequency: "instant",
    expiryWarningDays: 7
  };

  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updatePrefs({ data: prefs });
      toast.success("Preferências de notificação atualizadas!");
    } catch (error) {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setSaving(false);
    }
  }

  if (!isHydrated) return null;

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <BellRing className="size-4 text-primary" /> Alertas de Expiração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Frequência</Label>
            <Select 
              value={prefs.frequency} 
              onValueChange={(v: any) => setPrefs({ ...prefs, frequency: v })}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Imediato</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Canais de envio</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(prefs.channels).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox 
                    id={`channel-${key}`} 
                    checked={val as boolean} 
                    onCheckedChange={(c) => setPrefs({ 
                      ...prefs, 
                      channels: { ...prefs.channels, [key]: !!c } 
                    })}
                  />
                  <Label htmlFor={`channel-${key}`} className="text-[10px] capitalize">{key}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-xs">Antecedência do aviso</Label>
              <span className="text-[10px] font-bold">{prefs.expiryWarningDays} dias</span>
            </div>
            <Input 
              type="range" 
              min={1} 
              max={30} 
              value={prefs.expiryWarningDays}
              onChange={(e) => setPrefs({ ...prefs, expiryWarningDays: Number(e.target.value) })}
              className="h-4 accent-primary"
            />
          </div>
        </div>
        <Button size="sm" className="w-full h-8" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="size-3 animate-spin mr-2" />}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}

function KidAccessCard({ dependent }: { dependent: Dependent }) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveKidAccess);
  const revoke = useServerFn(revokeKidAccess);
  const saveVisibility = useServerFn(saveKidVisibility);
  const blockSession = useServerFn(blockKidSession);
  const updateSettings = useServerFn(updateKidsSecuritySettings);
  const updateUpgradeConfig = useServerFn(updateKidUpgradeConfig);

  const [code, setCode] = useState(dependent.kid_login_code ?? "");
  const [pin, setPin] = useState("");
  const [days, setDays] = useState(dependent.kid_auto_upgrade_days ?? 365);
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrNonce, setQrNonce] = useState(0);
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
  }, [loginUrl, qrNonce]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["dependents"] });
  const refreshAudit = () => queryClient.invalidateQueries({ queryKey: ["kid_access_audit"] });

  async function copyLoginUrl() {
    if (!loginUrl) return;
    try {
      await navigator.clipboard.writeText(loginUrl);
      toast.success("Link do QR copiado!", { description: loginUrl });
    } catch {
      toast.error("Não foi possível copiar o link automaticamente.", { description: loginUrl });
    }
  }

  function reloadQr() {
    setQrNonce((value) => value + 1);
    void refresh();
    toast.success("QR atualizado na tela.");
  }

  async function handleUpdateUpgrade(newDays: number) {
    setDays(newDays);
    try {
      await updateUpgradeConfig({ data: { dependentId: dependent.id, days: newDays } });
      toast.success("Tempo de upgrade atualizado!");
      void refresh();
      void refreshAudit();
    } catch (error) {
      toast.error("Erro ao atualizar tempo de upgrade.");
    }
  }


  async function persist(nextCode: string, reason: "created" | "updated" | "rotated" | "pin_customized") {
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
    const promise = save({ data: { dependentId: dependent.id, code: clean, pin, expiresDays: days, reason } });
    
    toast.promise(promise, {
      loading: 'Salvando acesso...',
      success: (result) => {
        setCode(clean);
        setPin("");
        void refresh();
        void refreshAudit();
        return reason === "rotated" ? "Novo código gerado!" : reason === "pin_customized" ? "Alterações salvas com sucesso!" : "Acesso liberado!";
      },
      error: (error) => {
        return error instanceof Error ? error.message : "Não foi possível salvar o acesso.";
      }
    });

    try {
      await promise;
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
        <div className="flex items-center gap-2">
          {dependent.kid_login_code ? (
            <Badge variant={expiry.expired ? "destructive" : "secondary"} className="text-[10px]">
              {expiry.expired ? "Código expirado" : "Acesso ativo"}
            </Badge>
          ) : null}
          {(dependent as any).pin_code && (
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] gap-1">
              <ShieldCheck className="size-3" /> PIN Personalizado
            </Badge>
          )}
        </div>
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
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                type="button" 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                disabled={busy} 
                onClick={() => persist(code, dependent.kid_login_code ? "pin_customized" : "created")}
              >
                <ShieldCheck className="mr-1.5 size-3.5" />
                {dependent.kid_login_code ? "Salvar alterações" : "Salvar e Liberar acesso"}
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
                    className="text-destructive hover:bg-destructive/10"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja bloquear e excluir o acesso de ${dependent.name}? Isso removerá o código e senha atuais.`)) {
                        handleRevoke();
                      }
                    }}
                  >
                    <Trash2 className="mr-1.5 size-3.5" /> Bloquear e Excluir
                  </Button>
                </>
              ) : null}
            </div>
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

          <div className="rounded-xl border border-border p-3">
            <p className="flex items-center gap-2 text-[12px] font-bold">
              <ShieldAlert className="size-3.5 text-primary" aria-hidden /> Segurança e Notificações
            </p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2.5">
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold">Notificar tentativas falhas</span>
                  <span className="block text-[10px] text-muted-foreground">E-mail/push ao errar senha.</span>
                </span>
                <Switch 
                  checked={Boolean((dependent as any).kids_security_notifications?.failed_login)}
                  onCheckedChange={(val) => {
                    const current = (dependent as any).kids_security_notifications || { failed_login: true, code_revoked: true, new_session: false };
                    void updateSettings({ data: { notifications: { ...current, failed_login: val } } }).then(() => refresh());
                  }}
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2.5">
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold">Novo dispositivo/IP</span>
                  <span className="block text-[10px] text-muted-foreground">Aviso ao entrar de outro lugar.</span>
                </span>
                <Switch 
                  checked={Boolean((dependent as any).kids_security_notifications?.new_session)}
                  onCheckedChange={(val) => {
                    const current = (dependent as any).kids_security_notifications || { failed_login: true, code_revoked: true, new_session: false };
                    void updateSettings({ data: { notifications: { ...current, new_session: val } } }).then(() => refresh());
                  }}
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-2 text-[12px] font-bold">
                <CalendarClock className="size-3.5 text-primary" aria-hidden /> Expiração e Upgrade Automático
              </p>
              <Badge variant="outline" className="text-[10px] bg-primary/5">
                Limite: 14 anos
              </Badge>
            </div>
            <div className="grid gap-3">
              <div className="rounded-lg bg-muted/40 p-2.5">
                <Label className="text-[11px] font-semibold block mb-1.5">
                  Tempo para Upgrade / Expiração Personalizada
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {KID_UPGRADE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={days === opt.value ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px] px-2.5"
                      onClick={() => handleUpdateUpgrade(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Input
                      type="number"
                      className="h-7 w-16 text-[10px] px-2"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      onBlur={() => handleUpdateUpgrade(days)}
                    />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">dias</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground italic leading-relaxed">
                  Os pais podem definir tempos personalizados até o limite de upgrade automático (14 anos). 
                  Pode ser de 30, 60, 90, 360 dias ou personalizado.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="flex items-center gap-2 text-[12px] font-bold">
              <Tv className="size-3.5 text-primary" aria-hidden /> Dispositivos e Sessões
            </p>
            <SessionManager dependentId={dependent.id} />
          </div>
        </div>

        <aside className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[12px] font-bold">
            <QrCode className="size-3.5 text-primary" aria-hidden /> QR de entrada
          </p>
          {qr ? (
            <>
              <div id={`qr-container-${dependent.id}`} className="mx-auto mt-2 bg-white p-2 rounded-lg inline-block">
                <img
                  src={qr}
                  alt={`QR code de acesso do painel Kids de ${dependent.name}`}
                  className="w-40"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{expiry.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                A criança escaneia, o código já vem preenchido e ela digita só a senha.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full text-[10px] h-8 px-1"
                  onClick={() => void copyLoginUrl()}
                >
                  <Copy className="mr-1 size-3" /> Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full text-[10px] h-8 px-1"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qr;
                    link.download = `qr-acesso-${dependent.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                    link.click();
                  }}
                >
                  <Download className="mr-1 size-3" /> PNG
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full text-[11px]"
                onClick={reloadQr}
              >
                <RefreshCw className="mr-1.5 size-3.5" /> Reexibir QR atualizado
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 w-full text-[11px]"
                disabled={busy}
                onClick={() => persist(suggestKidCode(dependent.name), "rotated")}
              >
                <KeyRound className="mr-1.5 size-3.5" /> Gerar novo código
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

function SessionManager({ dependentId }: { dependentId: string }) {
  const getSessions = useServerFn(getKidSessions);
  const block = useServerFn(blockKidSession);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    void getSessions({ data: { dependentId } }).then((res) => {
      setSessions(res);
      setLoading(false);
    });
  }, [dependentId]);

  if (loading) return <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />;

  return (
    <div className="mt-2 space-y-2">
      {sessions.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-muted-foreground">Nenhuma sessão ativa.</p>
      ) : (
        sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2 text-[11px]">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {s.ip_address || "IP oculto"} {s.status === "blocked" && <Badge variant="destructive" className="ml-1 scale-75 h-4 px-1">Bloqueado</Badge>}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString("pt-BR")} · {s.user_agent?.split(" ")[0] || "Desconhecido"}
              </p>
            </div>
            {s.status !== "blocked" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-destructive hover:bg-destructive/10"
                onClick={() => {
                  void block({ data: { sessionId: s.id } }).then(() => {
                    toast.success("Acesso bloqueado!");
                    setSessions(sessions.map(sess => sess.id === s.id ? { ...sess, status: 'blocked' } : sess));
                  });
                }}
              >
                Bloquear
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function ExternalCodeCreator() {
  const queryClient = useQueryClient();
  const create = useServerFn(createExternalCode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(7);
  const [perms, setPerms] = useState({
    totals: true,
    charts: true,
    categories: true,
    transactions: false,
  });

  async function handleCreate() {
    if (!label || !password) {
      toast.error("Preencha o nome e a senha.");
      return;
    }
    setBusy(true);
    try {
      await create({ data: { label, password, expiresDays: days, permissions: perms } });
      toast.success("Acesso externo criado!");
      queryClient.invalidateQueries({ queryKey: ["external-codes"] });
      setOpen(false);
      setLabel("");
      setPassword("");
    } catch (err: any) {
      toast.error("Erro ao criar acesso: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1">
          <Plus className="size-3.5" /> Novo Código
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Acesso Externo</DialogTitle>
          <DialogDescription>
            Crie um link temporário para que terceiros vejam seu painel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ext-label">Nome/Identificação (ex: Contador)</Label>
            <Input 
              id="ext-label" 
              value={label} 
              onChange={e => setLabel(e.target.value)}
              placeholder="Ex: Consultoria Mensal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ext-pass">Senha de Acesso</Label>
            <Input 
              id="ext-pass" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Crie uma senha para este link"
            />
          </div>
          <div className="space-y-2">
            <Label>Validade (Dias: {days})</Label>
            <input 
              type="range" 
              min="1" 
              max="90" 
              value={days} 
              onChange={e => setDays(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-3">
            <Label>Permissões de Visualização</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={perms.totals} onCheckedChange={v => setPerms(p => ({...p, totals: !!v}))} />
                Ver Totais
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={perms.charts} onCheckedChange={v => setPerms(p => ({...p, charts: !!v}))} />
                Ver Gráficos
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={perms.categories} onCheckedChange={v => setPerms(p => ({...p, categories: !!v}))} />
                Ver Categorias
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={perms.transactions} onCheckedChange={v => setPerms(p => ({...p, transactions: !!v}))} />
                Ver Detalhes
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Gerar Código e Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExternalCodesList() {
  const fetchCodes = useServerFn(listExternalCodes);
  const { data: codes, isLoading, refetch } = useQuery({
    queryKey: ["external-codes"],
    queryFn: () => fetchCodes({ data: undefined }),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (!codes || codes.length === 0) return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[12px] text-muted-foreground bg-muted/5">
      Você ainda não criou nenhum acesso externo para adultos.
    </div>
  );

  return (
    <div className="space-y-3">
      {codes.map((code: any) => (
        <ExternalCodeCard key={code.id} code={code} onUpdate={refetch} />
      ))}
    </div>
  );
}

function ExternalCodeCard({ code, onUpdate }: { code: any, onUpdate: () => void }) {
  const revoke = useServerFn(revokeExternalCode);
  const updateExpiry = useServerFn(updateExternalCodeExpiry);
  const [busy, setBusy] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/auth?external=${code.access_code}` : "";
  const isExpired = new Date(code.expires_at) < new Date();

  async function handleRevoke() {
    if (!confirm("Deseja realmente revogar este acesso? Ele será invalidado imediatamente.")) return;
    setBusy(true);
    try {
      await revoke({ data: { id: code.id } });
      toast.success("Acesso revogado com sucesso.");
      onUpdate();
    } catch (err: any) {
      toast.error("Erro ao revogar: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleExtend() {
    const days = prompt("Deseja estender por quantos dias? (1-90)", "7");
    if (!days) return;
    const num = parseInt(days);
    if (isNaN(num) || num < 1 || num > 90) {
      toast.error("Número de dias inválido.");
      return;
    }
    setBusy(true);
    try {
      await updateExpiry({ data: { id: code.id, expiresDays: num } });
      toast.success("Validade atualizada!");
      onUpdate();
    } catch (err: any) {
      toast.error("Erro ao estender: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm truncate">{code.label}</h3>
            {isExpired ? (
              <Badge variant="destructive" className="h-4 text-[9px] uppercase">Expirado</Badge>
            ) : (
              <Badge variant="outline" className="h-4 text-[9px] uppercase border-emerald-500/50 text-emerald-600">Ativo</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-primary font-bold">{code.access_code}</code>
            <span>·</span>
            <span>Vence em: {new Date(code.expires_at).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copiado!");
          }}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setShowLogs(!showLogs)}>
            <History className="size-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 text-destructive hover:bg-destructive/10" 
            onClick={handleRevoke}
            disabled={busy}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(code.permissions || {}).map(([key, val]) => (
          <Badge key={key} variant={val ? "secondary" : "outline"} className="text-[10px] h-5 opacity-80">
            {key === 'totals' ? 'Totais' : key === 'charts' ? 'Gráficos' : key === 'categories' ? 'Categorias' : 'Transações'}
          </Badge>
        ))}
      </div>

      {isExpired && (
        <Button variant="outline" size="sm" className="w-full h-8 text-[11px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/50" onClick={handleExtend}>
          <RefreshCw className="size-3 mr-1.5" /> Estender Validade
        </Button>
      )}

      {showLogs && <ExternalAccessAuditList codeId={code.id} />}
    </article>
  );
}

function ExternalAccessAuditList({ codeId }: { codeId: string }) {
  const fetchLogs = useServerFn(getExternalAccessLogs);
  const { data: logs, isLoading } = useQuery({
    queryKey: ["external-logs", codeId],
    queryFn: () => fetchLogs({ data: { codeId } }),
  });

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="size-4 animate-spin" /></div>;

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-2">
      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
        <ShieldAlert className="size-3" /> Auditoria de Acessos
      </p>
      {!logs || logs.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-2">Nenhum acesso registrado.</p>
      ) : (
        <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between text-[10px] bg-muted/30 p-1.5 rounded-lg">
              <span className="font-medium text-foreground capitalize">{log.action === 'login' ? 'Entrada' : log.action}</span>
              <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
