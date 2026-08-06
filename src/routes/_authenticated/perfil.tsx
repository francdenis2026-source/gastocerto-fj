import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, History, Loader2, Settings2, ShieldCheck, Upload, User, Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/finance/page-header";
import { AccountSettingsDialog } from "@/components/finance/accounts/account-settings-dialog";
import { AvatarCropDialog } from "@/components/finance/dialogs/avatar-crop-dialog";
import { LicenseCard } from "@/components/finance/license-card";
import { LicenseDetailPanel } from "@/components/finance/panels/license-detail-panel";
import { TrialCard } from "@/components/finance/trial-card";
import { ProfileAuditPanel, RedemptionHistoryPanel } from "@/components/admin/audit-panels";

import { SidebarConfig } from "@/components/settings/sidebar-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAvatarUrl, useInvalidateProfile, useProfile, useRoles } from "@/lib/queries";
import { profileSchema, validateAvatarFile } from "@/lib/validation";
import { ExternalCodesList, ExternalCodeCreator } from "./kids";
import { NotificationCenter } from "@/components/notifications/notification-center";



import { usePlanAccess } from "@/lib/plan-features";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — GastoCerto" },
      { name: "description", content: "Gerencie seus dados pessoais e foto no GastoCerto." },
      { property: "og:title", content: "Meu perfil — GastoCerto" },
      {
        property: "og:description",
        content: "Gerencie seus dados pessoais e foto no GastoCerto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { data: roles } = useRoles();
  const invalidateProfile = useInvalidateProfile();
  const avatarUrl = useAvatarUrl(profile?.avatar_url);
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("profile");

  /** Ativa a aba do atalho e rola até a seção correspondente. */
  function jumpTo(nextTab: string, anchor?: string) {
    setTab(nextTab);
    requestAnimationFrame(() => {
      const target = anchor ? document.getElementById(anchor) : null;
      (target ?? document.getElementById("perfil-conteudo"))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    });
  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const incomeRaw = String(form.get("monthlyIncome") ?? "").replace(",", ".");

    const parsed = profileSchema.safeParse({
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      monthlyIncome: incomeRaw === "" ? undefined : Number(incomeRaw),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        monthly_income: parsed.data.monthlyIncome ?? null,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      console.error("[perfil] falha ao atualizar", error.message);
      toast.error("Não foi possível salvar seu perfil.");
      return;
    }
    await invalidateProfile();
    toast.success("Perfil atualizado!");
  }

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setPending(file);
  }

  async function handleCropped(blob: Blob) {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      console.error("[perfil] falha no upload", uploadError.message);
      setUploading(false);
      toast.error("Não foi possível enviar a imagem.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("user_id", user.id);
    setUploading(false);
    setPending(null);

    if (updateError) {
      console.error("[perfil] falha ao salvar avatar", updateError.message);
      toast.error("Não foi possível salvar a foto.");
      return;
    }
    await invalidateProfile();
    toast.success("Foto atualizada!");
  }


  // Só mostramos o carregamento enquanto a sessão ou o perfil realmente estão
  // em busca. Antes, uma consulta em espera deixava a tela presa no spinner.
  if (authLoading || (isLoading && !isError)) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-5xl space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 text-center">
          <h2 className="text-sm font-semibold">Não foi possível carregar seu perfil</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Tente novamente em alguns segundos."}
          </p>
          <Button className="mt-4" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      </AppShell>
    );
  }

  const initials = (profile?.full_name ?? "GC")
    .split(" ")
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  const access = usePlanAccess();
  const readOnly = access.courtesyTrial && access.trialActive;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-3 sm:space-y-4">
        <PageHeader
          icon={User}
          eyebrow="Configurações"
          title="Meu Perfil"
          description="Gerencie sua conta e acompanhe o status da sua licença."
          className="pb-1"
        />
        {readOnly && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-medium animate-in fade-in slide-in-from-top duration-300">
            Sua conta está em modo de teste temporário. A edição de dados pessoais está bloqueada por segurança até a ativação de uma licença definitiva.
          </div>
        )}

        <div className={cn("grid gap-3 sm:gap-4 lg:grid-cols-[240px_minmax(0,1fr)]", readOnly && "pointer-events-none opacity-80")}>
          {/* Coluna esquerda: identidade */}
          <aside className="space-y-3 sm:space-y-4">
            <section className="accent-tile overflow-hidden rounded-2xl p-4 text-center shadow-soft">
              <div className="relative mx-auto mb-3 inline-block">
                <Avatar className="size-20 border-2 border-background shadow-lg ring-1 ring-border/30">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                  <AvatarFallback className="bg-muted text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                  title="Alterar foto"
                  aria-label="Alterar foto de perfil"
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                </button>
              </div>
              <h3 className="truncate font-display text-sm font-bold leading-tight">
                {profile?.full_name || "Usuário"}
              </h3>
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {(roles ?? ["user"]).join(" • ")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{user?.email}</p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-9 w-full rounded-xl text-[10px] font-bold uppercase tracking-wider"
                onClick={() => setAccountOpen(true)}
              >
                <Settings2 className="mr-1.5 size-3.5" aria-hidden />
                Conta e segurança
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-1.5 h-9 w-full rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                <Link to="/filhos">
                  <Users className="mr-1.5 size-3.5" aria-hidden />
                  Central da Família
                </Link>
              </Button>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePick}
              />
            </section>

            <TrialCard />
          </aside>

          {/* Coluna direita: dados, plano e licenças */}
          <div className="min-w-0" id="perfil-conteudo">
            <nav aria-label="Atalhos do painel do cliente" className="mb-3">
              <ul className="flex flex-wrap gap-2">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.id}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl text-[11px] font-semibold"
                      onClick={() => jumpTo(shortcut.tab, shortcut.anchor)}
                    >
                      {shortcut.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            <Tabs value={tab} onValueChange={setTab} className="w-full space-y-4">
              <TabsList className="bg-card border border-border rounded-xl p-1 h-11 w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="profile" className="rounded-lg text-xs gap-2">
                  <User className="size-3.5" aria-hidden />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg text-xs gap-2">
                  <Settings2 className="size-3.5" aria-hidden />
                  Configurações
                </TabsTrigger>
                <TabsTrigger value="external" className="rounded-lg text-xs gap-2">
                  <ExternalLink className="size-3.5" aria-hidden />
                  Acessos externos
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-lg text-xs gap-2">
                  <Bell className="size-3.5" aria-hidden />
                  Avisos
                </TabsTrigger>
                <TabsTrigger value="audit" className="rounded-lg text-xs gap-2">
                  <History className="size-3.5" aria-hidden />
                  Histórico
                </TabsTrigger>

              </TabsList>




              <TabsContent value="profile" className="space-y-4 mt-0">
                <form autoComplete="off" data-1p-ignore
                  onSubmit={handleSubmit}
                  className="accent-tile rounded-2xl p-4 shadow-soft sm:p-5"
                  noValidate
                >
              <div className="mb-3 border-b border-border/40 pb-2.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Informações pessoais
                </h2>
              </div>

              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="fullName" className={LABEL_CLASS}>
                    Nome completo
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile?.full_name ?? ""}
                    className={INPUT_CLASS}
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] font-medium text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <Label htmlFor="email" className={LABEL_CLASS}>
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    className="h-10 w-full rounded-xl border-transparent bg-muted/40 opacity-70"
                    disabled
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <Label htmlFor="phone" className={LABEL_CLASS}>
                    Telefone / WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={profile?.phone ?? ""}
                    className={INPUT_CLASS}
                    maxLength={20}
                  />
                  {errors.phone && (
                    <p className="text-[10px] font-medium text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <Label htmlFor="monthlyIncome" className={LABEL_CLASS}>
                    Renda mensal estimada
                  </Label>
                  <Input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    inputMode="decimal"
                    defaultValue={
                      profile?.monthly_income != null ? String(profile.monthly_income) : ""
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                  {errors.monthlyIncome && (
                    <p className="text-[10px] font-medium text-destructive">
                      {errors.monthlyIncome}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 w-full rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md shadow-primary/20 sm:w-auto sm:px-6"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="mr-2 size-3 animate-spin" /> : null}
                  Salvar perfil
                </Button>
              </div>
                </form>

                <div id="perfil-licencas" tabIndex={-1}>
                  <LicenseDetailPanel />
                </div>
                <div id="perfil-planos" tabIndex={-1}>
                  <LicenseCard />
                </div>

              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="accent-tile rounded-2xl p-4 shadow-soft sm:p-5">
                  <SidebarConfig />
                </div>
              </TabsContent>

              <TabsContent value="external" className="mt-0 space-y-4">
                <div className="accent-tile rounded-2xl p-4 shadow-soft sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                      <ExternalLink className="size-4 text-primary" aria-hidden /> Acessos Externos
                    </h2>
                    <ExternalCodeCreator />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                      <ShieldCheck className="size-3 text-primary" /> Segurança de Acesso
                    </p>
                    Crie links protegidos para terceiros visualizarem suas finanças sem registro.
                  </div>
                  <ExternalCodesList />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-4">
                <div className="accent-tile rounded-2xl p-4 shadow-soft sm:p-5 space-y-4">
                  <div className="border-b border-border/40 pb-2.5">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                      <Bell className="size-4 text-primary" aria-hidden /> Central de Avisos e Notificações
                    </h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Acompanhe alertas importantes sobre seu plano, segurança e status do Espaço Kids.
                    </p>
                  </div>
                  <NotificationCenter />
                </div>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-4">



                <div
                  id="perfil-historico"
                  tabIndex={-1}
                  className="grid gap-3 sm:gap-4 md:grid-cols-2"
                >
                  <ProfileAuditPanel />
                  <RedemptionHistoryPanel />
                </div>

              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AccountSettingsDialog open={accountOpen} onOpenChange={setAccountOpen} />
      <AvatarCropDialog
        file={pending}
        saving={uploading}
        onCancel={() => setPending(null)}
        onSave={handleCropped}
      />
    </AppShell>
  );
}

const LABEL_CLASS =
  "text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70";
const INPUT_CLASS =
  "h-10 w-full rounded-xl border-border/40 bg-background/50 transition-colors focus:bg-background";


const SHORTCUTS: Array<{ id: string; label: string; tab: string; anchor?: string }> = [
  { id: "planos", label: "Planos", tab: "profile", anchor: "perfil-planos" },
  { id: "licencas", label: "Licenças", tab: "profile", anchor: "perfil-licencas" },
  { id: "historico", label: "Histórico", tab: "audit", anchor: "perfil-historico" },
];
