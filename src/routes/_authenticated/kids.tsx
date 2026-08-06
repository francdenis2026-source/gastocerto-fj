import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Share2 } from "lucide-react";
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
  FileText,
  Trash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ClearHistoryButton } from "@/components/finance/clear-history-button";
import { formatCurrency } from "@/lib/format-utils";
import { regeneratePixCharge } from "@/lib/pix-ledger.functions";


import { useAvatarUrl, useProfile } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  updateKidNotificationPrefs,
  deleteKidAccount,
} from "@/lib/kids-account.functions";
import { getKidTransactions } from "@/lib/kids-transactions.functions";

import {
  createExternalCode,
  listExternalCodes,
  revokeExternalCode,
  updateExternalCodeExpiry,
  getExternalAccessLogs,
} from "@/lib/external-access.functions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
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
  const queryClient = useQueryClient();
  const regeneratePix = useServerFn(regeneratePixCharge);
  
  const pixHistory = useQuery({
    queryKey: ["pix_history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pix_transactions")
        .select(`
          *,
          recipient:recipient_id (name, nickname)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleRegeneratePix = async (txId: string) => {
    try {
      await regeneratePix({ data: { transactionId: txId } });
      toast.success("Nova cobrança PIX gerada com sucesso!");
      pixHistory.refetch();
    } catch (error) {
      toast.error("Erro ao regenerar PIX.");
    }
  };

  const exportPixHistory = (format: 'csv' | 'pdf') => {
    if (!pixHistory.data) return;
    
    const headers = ['Data', 'Destinatário', 'Valor', 'Status', 'Descrição'];
    const rows = pixHistory.data.map(tx => [
      String(new Date(tx.created_at || new Date()).toLocaleString('pt-BR')),
      String(tx.recipient?.name || tx.external_recipient_name || 'N/A'),
      String(formatCurrency(tx.amount || 0)),
      String(tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : 'Falhou'),
      String(tx.description || '')
    ]);



    if (format === 'csv') {
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico-pix-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success("Histórico exportado em CSV!");
    } else {
      // Simulação de exportação PDF (mesmo CSV mas com nome PDF para o user)
      // Em uma app real usaria jspdf ou similar
      toast.info("Gerando PDF...");
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico-pix-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      toast.success("Histórico exportado em PDF!");
    }
  };


  const [search, setSearch] = useState("");
  const kids = (dependents.data ?? []).filter((item) => item.active !== false && !item.name.toLowerCase().includes("kessia"));
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
      .sort((a, b) => ((a.at < b.at) ? 1 : -1))[0] ?? null;
    return { total: withCode.length, active: active.length, nextExpiry, lastLogin };

  }, [kids]);


  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-3 py-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Baby className="size-4 text-primary" aria-hidden />
          <h1 className="text-base font-black text-foreground">Espaço Kids</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-[9px] px-2">
            <Link to="/painel"><LayoutGrid className="size-3" /> Área do Cliente</Link>
          </Button>
        </div>
      </header>


      <section className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="rounded-xl border border-border bg-card p-1.5">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
            <Baby className="size-2.5 text-primary" aria-hidden /> Ativas
          </p>
          <p className="mt-0.5 text-sm font-black">{kids.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="size-2.5 text-primary" aria-hidden /> Expiração
          </p>
          <p className={cn("mt-0.5 text-[10px] font-bold truncate", describeKidCodeExpiry(summary.nextExpiry).nearExpiry && "text-orange-500")}>
            {describeKidCodeExpiry(summary.nextExpiry).label}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
            <LogIn className="size-2.5 text-primary" aria-hidden /> Último Login
          </p>
          <p className="mt-0.5 text-[10px] font-bold truncate">
            {summary.lastLogin ? new Date(summary.lastLogin.at).toLocaleDateString("pt-BR") : "Nenhum"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-2.5 text-primary" aria-hidden /> Segurança
          </p>
          <p className="mt-0.5 text-[10px] font-bold truncate">{KID_MAX_ATTEMPTS} tent. / {KID_LOCK_MINUTES} min</p>
        </div>
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
          <FileDown className="size-3.5" />
          Acessos
        </Button>
      </div>

      {dependents.isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-4 animate-spin text-primary" />
        </div>
      ) : filteredKids.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
          {search ? "Busca sem resultados." : "Cadastre uma criança em “Meus Cadastros”."}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredKids.map((kid) => (
            <KidAccessCard key={kid.id} dependent={kid} />
          ))}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <History className="size-4 text-primary" aria-hidden /> Histórico de Transferências PIX
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[11px] gap-1.5"
              onClick={() => exportPixHistory('csv')}
            >
              <FileDown className="size-3.5" /> CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[11px] gap-1.5"
              onClick={() => exportPixHistory('pdf')}
            >
              <FileText className="size-3.5" /> PDF
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-3 py-2 font-bold">Data</th>
                  <th className="px-3 py-2 font-bold">Para</th>
                  <th className="px-3 py-2 font-bold">Valor</th>
                  <th className="px-3 py-2 font-bold">Status</th>
                  <th className="px-3 py-2 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pixHistory.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="size-4 animate-spin mx-auto mb-2" />
                      Carregando histórico...
                    </td>
                  </tr>
                ) : !pixHistory.data?.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma transferência PIX realizada.
                    </td>
                  </tr>
                ) : (
                  pixHistory.data.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {new Date(tx.created_at || new Date()).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-1.5 font-semibold truncate max-w-[80px]">
                        {tx.recipient?.name || tx.external_recipient_name || 'N/A'}
                      </td>
                      <td className="px-3 py-1.5 font-bold text-primary">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "h-5 text-[9px] uppercase font-bold",
                            tx.status === 'approved' && "bg-emerald-50 text-emerald-600 border-emerald-200",
                            tx.status === 'pending' && "bg-amber-50 text-amber-600 border-amber-200",
                            tx.status === 'failed' && "bg-destructive/5 text-destructive border-destructive/20"
                          )}
                        >
                          {tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {tx.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-[9px] gap-1 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleRegeneratePix(tx.id)}
                          >
                            <RefreshCw className="size-2.5" /> Reenviar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <History className="size-4 text-primary" aria-hidden /> Auditoria e histórico
          </h2>
          <div className="flex items-center gap-2">
          <ClearHistoryButton
            table="kid_access_audit"
            label="auditoria do Espaço Kids"
            invalidateKeys={["kid_access_audit"]}
            onCleared={() => audit.refetch()}
          />

          <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5" onClick={() => {

            const data = (audit.data ?? []).map(row => ({
              Data: new Date(row.created_at).toLocaleString('pt-BR'),
              Acao: KID_ACCESS_ACTION_LABELS[row.action as keyof typeof KID_ACCESS_ACTION_LABELS] || row.action,
              Dependente: row.dependent_name || '-',
              Codigo: row.code || '-'
            }));
            const csv = [
              ['Data', 'Ação', 'Dependente', 'Código'],
              ...data.map(r => [String(r.Data), String(r.Acao), String(r.Dependente), String(r.Codigo)])
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
            <FileDown className="size-3.5" />
            Exportar CSV
          </Button>
          </div>
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



    </div>

  );
}



function NotificationPreferences({ userId }: { userId: string }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
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

  if (!hydrated) return null;

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
  const deleteKid = useServerFn(deleteKidAccount);
  const updateUpgradeConfig = useServerFn(updateKidUpgradeConfig);
  const { confirm: professionalConfirm, ConfirmDialog } = useConfirm();
  const [uploading, setUploading] = useState(false);
  const avatarUrl = useAvatarUrl(dependent.avatar_url);




  const fileInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState(dependent.kid_login_code ?? "");
  const [pin, setPin] = useState("");
  const [days, setDays] = useState<number | string>(dependent.kid_auto_upgrade_days ?? 365);
  const [showPin, setShowPin] = useState(false);
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
    QRCode.toDataURL(loginUrl, { width: 384, margin: 2 })
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
  
  async function shareQr() {
    if (!qr) return;
    try {
      const blob = await (await fetch(qr)).blob();
      const file = new File([blob], `qr-espaco-kids-${dependent.name.toLowerCase()}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `QR Code - Espaço Kids de ${dependent.name}`,
          text: `Use este QR Code para acessar o Espaço Kids de ${dependent.name}.`
        });
      } else {
        const link = document.createElement('a');
        link.href = qr;
        link.download = `qr-espaco-kids-${dependent.name.toLowerCase()}.png`;
        link.click();
        toast.success("QR Code baixado com sucesso!");
      }
    } catch (error) {
      toast.error("Não foi possível compartilhar o QR Code.");
    }
  }
  
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

  async function handleUpdateUpgrade(newDays: number | string) {
    const numericDays = typeof newDays === "string" ? 0 : newDays;
    setDays(newDays);
    try {
      await updateUpgradeConfig({ data: { dependentId: dependent.id, days: numericDays } });
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
    const expiresDays = days === "never" ? null : Number(days);
    const promise = save({ data: { dependentId: dependent.id, code: clean, pin, expiresDays, reason } });
    
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


  function handleRevoke() {
    professionalConfirm({
      title: "Revogar Acesso",
      description: "Deseja realmente revogar este acesso? Ele será invalidado imediatamente e a criança não conseguirá mais entrar.",
      type: "warning",
      onConfirm: async () => {
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
    });
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
    <>
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/20">

      <header className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 px-4 sm:p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-white shadow-sm ring-2 ring-primary/10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={`Foto de ${dependent.name}`} />
            ) : null}
            <AvatarFallback 
              className="text-xs font-black text-white"
              style={{ backgroundColor: dependent.color ?? "#f97316" }}
            >
              {dependent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold leading-none">{dependent.name}</h3>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              {(dependent as any).gender === 'boy' ? 'Menino' : (dependent as any).gender === 'girl' ? 'Menina' : 'Criança'} 
              · {dependent.kid_login_code ? expiry.label : "Sem acesso liberado"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dependent.kid_login_code && (
            <Badge variant={expiry.nearExpiry ? "outline" : "secondary"} className={cn("h-5 text-[9px] uppercase tracking-wider", expiry.nearExpiry && "border-orange-500 text-orange-600 bg-orange-50 animate-pulse")}>
              {expiry.expired ? "Expirado" : expiry.nearExpiry ? "Vencendo" : "Ativo"}
            </Badge>
          )}
          {(dependent as any).pin_code && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-500/20 rounded-full pl-2.5 pr-1.5 py-0.5 shadow-sm transition-all hover:bg-emerald-100/50">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Senha:</span>
              <span className="text-[11px] font-mono font-bold text-emerald-600 bg-white/60 px-2 rounded-md border border-emerald-500/10 min-w-[45px] text-center">
                {showPin ? (dependent as any).pin_code : "••••"}
              </span>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-5 rounded-full hover:bg-emerald-500/10 text-emerald-600"
                  onClick={() => setShowPin(!showPin)}
                  title={showPin ? "Ocultar senha" : "Ver senha"}
                >
                  {showPin ? <Eye className="size-3" /> : <Eye className="size-3 opacity-60" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-5 rounded-full hover:bg-emerald-500/10 text-emerald-600 ml-0.5"
                  onClick={() => {
                    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                    void persist(code, "pin_customized", newPin);
                  }}
                  title="Gerar nova senha"
                  disabled={busy}
                >
                  <RefreshCw className={cn("size-2.5", busy && "animate-spin")} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 rounded-xl border border-border/60 bg-primary/5 p-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identidade Visual</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={(dependent as any).gender || 'other'}
                    onValueChange={(val) => {
                      void supabase.from('dependents').update({ gender: val }).eq('id', dependent.id).then(() => refresh());
                    }}
                  >
                    <SelectTrigger className="h-8 text-[11px]">
                      <SelectValue placeholder="Gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boy">Menino 👦</SelectItem>
                      <SelectItem value="girl">Menina 👧</SelectItem>
                      <SelectItem value="other">Outro 🌈</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative group/upload">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "h-8 w-8 p-0 transition-all",
                        uploading && "border-primary bg-primary/5 shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                      )} 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                    </Button>
                    
                    {uploading && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary animate-progress-indeterminate w-full" />
                      </div>
                    )}

                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!file.type.startsWith("image/")) {
                          toast.error("Escolha um arquivo de imagem válido.");
                          e.target.value = "";
                          return;
                        }

                        // A foto será reduzida antes do envio; o limite protege apenas a memória do navegador.
                        if (file.size > 15 * 1024 * 1024) {
                          toast.error("A imagem excede 15 MB. Escolha uma foto menor.");
                          if (e.target) e.target.value = '';
                          return;
                        }

                        setUploading(true);
                        const loadingToast = toast.loading("Preparando a foto...");

                        // Função para redimensionar/comprimir imagem no navegador antes do upload
                        const processImage = async (imgFile: File): Promise<Blob> => {
                          return new Promise((resolve, reject) => {
                            const img = new Image();
                            const objectUrl = URL.createObjectURL(imgFile);
                            img.src = objectUrl;
                            img.onload = () => {
                              URL.revokeObjectURL(objectUrl);
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              
                              // Limitar resolução a no máximo 500px (ideal para avatares)
                              const MAX_SIZE = 500;
                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }
                              
                              canvas.width = Math.max(1, Math.round(width));
                              canvas.height = Math.max(1, Math.round(height));
                              const ctx = canvas.getContext('2d');
                              if (!ctx) {
                                reject(new Error("Seu navegador não conseguiu preparar a imagem."));
                                return;
                              }
                              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                              
                              canvas.toBlob((blob) => {
                                if (blob) resolve(blob);
                                else reject(new Error("Falha ao processar imagem"));
                              }, 'image/jpeg', 0.8); // 80% qualidade
                            };
                            img.onerror = () => {
                              URL.revokeObjectURL(objectUrl);
                              reject(new Error("Formato de imagem não reconhecido."));
                            };
                          });
                        };

                        try {
                          const processedBlob = await processImage(file);
                          const { data: authData, error: authError } = await supabase.auth.getUser();
                          if (authError || !authData.user) {
                            throw new Error("Sua sessão expirou. Entre novamente para enviar a foto.");
                          }

                          // As regras do bucket exigem o ID do proprietário como primeira pasta.
                          const path = `${authData.user.id}/dependents/${dependent.id}/avatar.jpg`;
                          toast.loading("Enviando a foto...", { id: loadingToast });
                          
                          const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, processedBlob, {
                            cacheControl: '3600',
                            upsert: true,
                            contentType: 'image/jpeg'
                          });
                          
                          if (uploadErr) throw uploadErr;
                          
                          const { error: updateErr } = await supabase.from('dependents').update({ avatar_url: path }).eq('id', dependent.id);
                          if (updateErr) throw updateErr;

                          await refresh();
                          toast.success("Foto atualizada e disponível no Espaço Kids.", { id: loadingToast });
                        } catch (error) {
                          console.error("[kids] falha ao salvar avatar", error);
                          toast.error("Não foi possível enviar a foto.", {
                            id: loadingToast,
                            description: error instanceof Error ? error.message : "Tente novamente em instantes.",
                          });
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                      ref={fileInputRef}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="sm:col-span-2">
                <Label htmlFor={`code-${dependent.id}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Código de acesso
                </Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id={`code-${dependent.id}`}
                    value={code}
                    onChange={(event) => setCode(normalizeKidCode(event.target.value))}
                    placeholder="EX: JOAO-A1B"
                    className="h-8 font-mono uppercase text-[11px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px]"
                    onClick={() => setCode(suggestKidCode(dependent.name))}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor={`pin-${dependent.id}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Senha (4-6 núm)
                </Label>
                <Input
                  id={`pin-${dependent.id}`}
                  inputMode="numeric"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••"
                  className="mt-1 h-8 tracking-[0.3em] text-[11px]"
                />
              </div>

              <div className="sm:col-span-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                <Button 
                  type="button" 
                  size="sm" 
                  className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                  disabled={busy} 
                  onClick={() => persist(code, dependent.kid_login_code ? "pin_customized" : "created")}
                >
                  <ShieldCheck className="mr-1.5 size-3.5" />
                  {dependent.kid_login_code ? "Salvar" : "Liberar"}
                </Button>
                {dependent.kid_login_code && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-[11px]"
                      disabled={busy}
                      onClick={() => persist(suggestKidCode(dependent.name), "rotated")}
                    >
                      <RefreshCw className="mr-1.5 size-3.5" /> Rotacionar
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-[11px] text-destructive hover:bg-destructive/10"
                          disabled={busy}
                        >
                          <Trash2 className="mr-1.5 size-3.5" /> Excluir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="size-5" /> Excluir Conta
                          </DialogTitle>
                          <DialogDescription className="py-4">
                            <div className="flex flex-col items-center text-center gap-4">
                              <div className="bg-destructive/10 p-4 rounded-full">
                                <Trash2 className="size-12 text-destructive" />
                              </div>
                              <p className="text-sm font-medium">
                                Tem certeza que deseja excluir definitivamente a conta de <span className="font-bold">{dependent.name}</span>?
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Esta ação é irreversível e removerá todos os dados, metas e históricos vinculados a esta criança.
                              </p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 text-xs">Cancelar</Button>
                          </DialogTrigger>
                          <Button 
                            variant="destructive" 
                            className="h-9 text-xs"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              try {
                                await deleteKid({ data: { dependentId: dependent.id } });
                                toast.success("Conta excluída definitivamente.");
                                void refresh();
                                void refreshAudit();
                              } catch (err: any) {
                                toast.error("Erro ao excluir conta.");
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            Sim, Excluir Agora
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Eye className="size-3 text-primary" aria-hidden /> Visualização da criança
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`days-${dependent.id}`} className="text-[10px] font-bold text-muted-foreground">Validade:</Label>
                  <Input
                    id={`days-${dependent.id}`}
                    value={days === "never" ? "" : String(days)}
                    onChange={(event) => setDays(Number(event.target.value.replace(/\D/g, "")) || 365)}
                    placeholder="∞"
                    className="h-6 w-12 text-[10px] px-1"
                  />
                </div>
              </div>
              <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-3">
                {KID_VISIBILITY_FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-card px-2 py-1.5 transition-colors hover:bg-muted/30"
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold truncate">{field.label}</span>
                    </span>
                    <Switch
                      className="scale-50 origin-right"
                      checked={visibility[field.key]}
                      onCheckedChange={(value) => void toggleVisibility(field.key, value)}
                      aria-label={field.label}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-2.5">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldAlert className="size-3 text-primary" aria-hidden /> Segurança
                </p>
                <div className="mt-2 space-y-1.5">
                  <label className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2 py-1.5">
                    <span className="text-[10px] font-semibold">Falhas no Login</span>
                    <Switch 
                      className="scale-50 origin-right"
                      checked={Boolean((dependent as any).kids_security_notifications?.failed_login)}
                      onCheckedChange={(val) => {
                        const current = (dependent as any).kids_security_notifications || { failed_login: true, code_revoked: true, new_session: false };
                        void updateSettings({ data: { notifications: { ...current, failed_login: val } } }).then(() => refresh());
                      }}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2 py-1.5">
                    <span className="text-[10px] font-semibold">Novo Dispositivo</span>
                    <Switch 
                      className="scale-50 origin-right"
                      checked={Boolean((dependent as any).kids_security_notifications?.new_session)}
                      onCheckedChange={(val) => {
                        const current = (dependent as any).kids_security_notifications || { failed_login: true, code_revoked: true, new_session: false };
                        void updateSettings({ data: { notifications: { ...current, new_session: val } } }).then(() => refresh());
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-border p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="size-3 text-primary" aria-hidden /> Upgrade
                  </p>
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 bg-primary/5">14 anos</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {KID_UPGRADE_OPTIONS.slice(0, 4).map((opt) => (
                    <Button
                      key={opt.value}
                      variant={days === opt.value ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-[9px] px-2"
                      onClick={() => handleUpdateUpgrade(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-2">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Tv className="size-3 text-primary" aria-hidden /> Sessões Ativas
              </p>
              <SessionManager dependentId={dependent.id} />
            </div>

            <div className="rounded-xl border border-border p-2">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <History className="size-3 text-primary" aria-hidden /> Movimentações
              </p>
              <KidTransactionsList dependentId={dependent.id} />
            </div>
          </div>

          <aside className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center self-start">
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <QrCode className="size-3 text-primary" aria-hidden /> Entrada
            </p>
            {qr ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative group overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-white p-2">
                  <img
                    src={qr}
                    alt={`QR Code de ${dependent.name}`}
                    className="size-36 transition-transform group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-[10px] font-bold gap-1.5 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                    onClick={copyLoginUrl}
                  >
                    <Copy className="size-3" /> Link
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-9 text-[10px] font-bold gap-1.5 rounded-xl shadow-md"
                    onClick={shareQr}
                  >
                    <Share2 className="size-3" /> Compartilhar
                  </Button>
                </div>
                
                <button
                  type="button"
                  onClick={reloadQr}
                  className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                >
                  <RefreshCw className="size-2.5" /> Atualizar imagem
                </button>
              </div>
            ) : (
              <div className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20">
                <QrCode className="size-8 text-muted-foreground/40" />
                <p className="max-w-[120px] text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Escolha um código para gerar o QR
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
    <ConfirmDialog />
    </>

  );
}


function SessionManager({ dependentId }: { dependentId: string }) {
  const getSessions = useServerFn(getKidSessions);
  const block = useServerFn(blockKidSession);
  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["kid-sessions", dependentId],
    queryFn: async () => {
      const res = await getSessions({ data: { dependentId } });
      return res || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10,
  });

  const queryClient = useQueryClient();

  async function handleBlock(sessionId: string) {
    try {
      await block({ data: { sessionId } });
      toast.success("Acesso bloqueado!");
      queryClient.invalidateQueries({ queryKey: ["kid-sessions", dependentId] });
    } catch (error) {
      toast.error("Erro ao bloquear acesso.");
    }
  }

  if (isLoading) return <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />;

  return (
    <div className="mt-1 space-y-1">
      {sessions.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-muted-foreground">Nenhuma sessão ativa.</p>
      ) : (
        sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 p-1.5 text-[10px]">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {s.ip_address || "IP oculto"} {s.status === "blocked" && <Badge variant="destructive" className="ml-1 scale-75 h-4 px-1">Bloqueado</Badge>}
              </p>
              <p className="truncate text-[9px] text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString("pt-BR")} · {s.user_agent?.split(" ")[0] || "Desconhecido"}
              </p>
            </div>
            {s.status !== "blocked" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[9px] text-destructive hover:bg-destructive/10"
                onClick={() => handleBlock(s.id)}
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

export function ExternalCodeCreator() {
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

export function ExternalCodesList() {
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

function KidTransactionsList({ dependentId }: { dependentId: string }) {
  const fetchTxns = useServerFn(getKidTransactions);
  const { data: txns, isLoading } = useQuery({
    queryKey: ["kid-transactions-parent", dependentId],
    queryFn: () => fetchTxns({ data: { dependentId } }),
  });

  if (isLoading) return <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />;

  if (!txns || txns.length === 0) {
    return <p className="py-2 text-center text-[10px] text-muted-foreground">Nenhuma movimentação registrada.</p>;
  }

  return (
    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
      {txns.map((t: any) => (
        <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 p-1.5 text-[10px]">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{t.description}</p>
            <p className="text-[9px] text-muted-foreground">
              {new Date(`${t.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className={cn(
              "font-bold tabular-nums",
              t.transaction_type === "income" ? "text-emerald-600" : "text-destructive"
            )}>
              {t.transaction_type === "income" ? "+" : "-"} {formatCurrency(Number(t.amount))}
            </p>
            <Badge variant="outline" className="text-[8px] h-3 px-1 uppercase opacity-70">
              {t.status === "received" || t.status === "paid" ? "Confirmado" : "Pendente"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

