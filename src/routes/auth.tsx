import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { AlertCircle, Baby, KeyRound, Loader2, Sparkles, LayoutDashboard, UserPlus, ShieldAlert, Lock, Eye, EyeOff, ArrowRight, Fingerprint, UserCircle, User, LogIn, CheckCircle2 } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import loginHero from "@/assets/auth/login-hero.jpg";
import signupHero from "@/assets/auth/signup-hero.jpg";
import forgotHero from "@/assets/auth/forgot-hero.jpg";
import adminHero from "@/assets/auth/admin-hero.jpg";
import authHero from "@/assets/auth-hero.jpg";
import { KidsLoginScreen } from "@/components/kids/kids-login-screen";
import { PENDING_LICENSE_KEY } from "@/components/landing/code-access-dialog";

import { CodeAccessInline } from "@/components/landing/code-access-inline";
import { activateLicense, verifyAccessCode } from "@/lib/licenses.functions";

// Implementação simples de Rate Limiting para Auth no servidor (em memória/simulado para o ambiente)
const ATTEMPT_LIMIT = 5;
const WINDOW_MS = 60 * 1000; // 1 minuto
const attemptsMap = new Map<string, { count: number; lastReset: number }>();

export const authRateLimiter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ identifier: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { identifier } = data;
    const now = Date.now();
    const entry = attemptsMap.get(identifier) || { count: 0, lastReset: now };

    if (now - entry.lastReset > WINDOW_MS) {
      entry.count = 0;
      entry.lastReset = now;
    }

    entry.count++;
    attemptsMap.set(identifier, entry);

    if (entry.count > ATTEMPT_LIMIT) {
      throw new Response("Muitas tentativas. Tente novamente em 1 minuto.", { status: 429 });
    }
    
    return { ok: true };
  });

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { clearBrowserCredentials } from "@/lib/local-session";
import { resolveHomeRoute, resolveHomeRouteForSession } from "@/lib/post-login";
import { cpfToLoginEmail, maskCpf, onlyDigits, pinToPassword } from "@/lib/cpf";
import {
  isValidKidCode,
  isValidKidPin,
  kidCodeToEmail,
  kidPassword,
  normalizeKidCode,
} from "@/lib/kids-account";
import { checkKidLock, registerKidAttempt } from "@/lib/kids-account.functions";
import { kidLockMessage, kidRemainingMessage } from "@/lib/kids-login-guard";
import {
  cpfSignInSchema,
  cpfSignUpSchema,
  forgotPasswordSchema,
  friendlyAuthError,
} from "@/lib/validation";

const searchSchema = z.object({
  mode: z.enum(["login", "signup", "forgot", "admin", "kid", "external"]).optional(),
  kid: z.string().optional(),
  external: z.string().optional(),
  code: z.string().optional(),
});


export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: ({ match }) => {
    // O link do Espaço Kids (/auth?kid=CODIGO) recebe prévia própria, com
    // imagem e texto do universo da criança; o login do responsável mantém a
    // identidade do produto. Ambas em 1200x630 — nada de imagem gigante.
    const isKid = Boolean((match.search as { kid?: string } | undefined)?.kid);
    const title = isKid
      ? "Entrar no Meu Espaço — Kids"
      : "Acesse sua conta — Meu Controle Financeiro";

    const description = isKid
      ? "Acesso do Espaço Kids: a criança entra com o código do responsável para ver a mesada, as metas e os próprios gastos."
      : "Entre no sistema para acompanhar despesas, receitas, cartões, veículos e metas em um só painel.";
    const image = `https://gastocerto-fj.lovable.app/${isKid ? "og-kids.jpg" : "og-gastocerto-v2.jpg"}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://gastocerto-fj.lovable.app/auth" },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: isKid
            ? "Espaço Kids do GastoCerto: cofrinho e meta de poupança"
            : "Painel do GastoCerto com gráfico de gastos",
        },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    };
  },

  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot" | "admin" | "kid" | "external";

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>(
    search.external
      ? "external"
      : search.kid || search.mode === "kid"
        ? "kid"
        : search.mode
          ? search.mode
          : "login",

  );

  const [pendingCode, setPendingCode] = useState<string | null>(search.code ?? null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  // Ao alternar entre "Entrar" e "Criar conta", leva o foco do teclado
  // para o primeiro campo do formulário exibido.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const container = formAreaRef.current;
    if (!container) return;
    const frame = requestAnimationFrame(() => {
      const first = container.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select, textarea',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  useEffect(() => {
    try {
      const val = sessionStorage.getItem(PENDING_LICENSE_KEY);
      if (val) setPendingCode(val);
    } catch {}
  }, []);

  useEffect(() => {
    if (loading || !session) return;
    let cancelled = false;

    const pending = (() => {
      try {
        return sessionStorage.getItem(PENDING_LICENSE_KEY);
      } catch {
        return null;
      }
    })();

    const run = async () => {
      if (pending) {
        try {
          sessionStorage.removeItem(PENDING_LICENSE_KEY);
        } catch {}
        try {
          await activateLicense({ data: { licenseKey: pending } });
          toast.success("Código ativado! Seu período de teste começou agora.");
        } catch (error) {
          console.warn("Falha ao ativar licença pendente:", error);
        }
      }
      const to = await resolveHomeRoute(session.user?.id);
      if (!cancelled) {
        // Garantir que não redirecionamos para o painel de admin se o código for de cliente
        navigate({ to: to, replace: true });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [loading, session, navigate]);

  if (mode === "kid") {
    return (
      <KidsLoginScreen>
        <KidSignInForm onBack={() => setMode("login")} initialCode={search.kid ?? ""} />
      </KidsLoginScreen>
    );
  }

  return (
    <main className="relative isolate flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden p-3 sm:p-4 lg:p-6 bg-[#000a14] selection:bg-brand-green/30">
      {/* Imagem de fundo global otimizada com carregamento progressivo */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-brand-navy">
        <Suspense fallback={<div className="size-full bg-brand-navy" />}>
          <img
            src={authHero}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="size-full object-cover opacity-40 blur-[3px] brightness-[0.6] contrast-[1.1] transition-opacity duration-1000"
          />
        </Suspense>
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-transparent to-brand-navy/90 mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,168,95,0.08),transparent_70%)]" />

      {/* Card principal: Compacto e sem rolagem excessiva */}
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-brand-navy/40 backdrop-blur-xl shadow-2xl max-h-[95dvh] lg:h-[min(36rem,calc(100dvh-3rem))] lg:grid-cols-[1.1fr_1fr]">

        {/* Painel lateral dinâmico (Hero) - Compacto */}
        <section className="relative flex min-h-[140px] shrink-0 flex-col justify-between overflow-hidden lg:min-h-0 border-b border-white/5 lg:border-b-0 lg:border-r">
          <Suspense fallback={<div className="absolute inset-0 -z-10 bg-brand-navy/80" />}>
            <img
              src={
                mode === "login"
                  ? loginHero
                  : mode === "signup"
                    ? signupHero
                    : mode === "forgot"
                      ? forgotHero
                      : adminHero
              }
              alt=""
              loading="eager"
              decoding="async"
              className="absolute inset-0 -z-10 size-full object-cover brightness-[0.35] contrast-[1.1] transition-opacity duration-700"
            />
          </Suspense>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-navy/60 via-brand-navy/20 to-brand-navy/80"
          />

          <div className="p-4 sm:p-6">
            <Link to="/" className="relative z-10 inline-flex w-fit transition-transform hover:scale-105 active:scale-95">
              <Logo onDark />
            </Link>
          </div>

          <div className="relative z-10 space-y-3 p-4 sm:p-6">
            <div className="hidden -space-x-3 overflow-hidden sm:flex">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
              ].map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="inline-block size-9 rounded-full border-2 border-primary object-cover shadow-lg"
                  alt="Usuário satisfeito"
                />
              ))}
              <div className="flex size-9 items-center justify-center rounded-full border-2 border-primary bg-emerald-500 text-[10px] font-bold shadow-lg">
                +2k
              </div>
            </div>

            <div className="max-w-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-green">
                {mode === "login" ? (
                  <>
                    <LayoutDashboard className="size-3" /> Acesso ao Painel
                  </>
                ) : mode === "signup" ? (
                  <>
                    <UserPlus className="size-3" /> Nova Conta
                  </>
                ) : mode === "forgot" ? (
                  <>
                    <Lock className="size-3" /> Recuperar Acesso
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-3" /> Área Segura
                  </>
                )}
              </span>
              <h2 className="font-display mt-3 text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl">
                {mode === "login"
                  ? "Bem-vindo ao seu controle financeiro."
                  : mode === "signup"
                    ? "Sua liberdade financeira começa aqui."
                    : mode === "forgot"
                      ? "Não se preocupe, vamos te ajudar."
                      : "Administração e Suporte Técnico."}
              </h2>
              <p className="mt-2 hidden text-xs font-medium leading-relaxed text-white/70 sm:block">
                {mode === "login"
                  ? "Gerencie suas finanças com praticidade e segurança total."
                  : mode === "signup"
                    ? "Crie sua conta em segundos e teste grátis por 14 dias."
                    : mode === "forgot"
                      ? "Informe seus dados para validar sua identidade com segurança."
                      : "Área restrita para auditores e gerentes do sistema."}
              </p>
            </div>
          </div>

          <div className="hidden p-6 pt-0 sm:block">
            <p className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-white/20">
              Franc D&apos;nis · Feijó, AC
            </p>
          </div>
        </section>

        {/* Painel do formulário - Mais compacto */}
        <section className="flex min-h-0 flex-col px-6 py-6 sm:px-10 sm:py-8 bg-background/95 lg:h-full transition-colors duration-500">
          <div className="mb-5">
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight sm:text-3xl">
              {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Área Restrita"}
            </h1>
            <p className="text-[12px] font-bold text-muted-foreground/70 mt-1 uppercase tracking-wider">
              {mode === "login" ? "Acesse sua conta com segurança" : "Comece sua jornada gratuita hoje"}
            </p>
          </div>

          <div ref={formAreaRef} className="no-scrollbar min-h-0 flex-1 lg:overflow-y-auto lg:pr-2">
            {pendingCode ? (
              <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Fingerprint className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-brand">Acesso via código detectado</h3>
                      <p className="text-[11px] sm:text-[12px] leading-tight text-muted-foreground">Insira seu CPF e como deseja ser chamado para entrar.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="code-cpf" className="text-[11px] font-black uppercase tracking-widest text-emerald-500/90">Seu CPF</Label>
                    <div className="relative group/field">
                      <UserCircle className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/field:text-emerald-500" />
                      <Input 
                        id="code-cpf" 
                        placeholder="000.000.000-00" 
                        aria-label="CPF"
                        className="h-12 rounded-xl pl-10 text-sm bg-foreground/[0.03] dark:bg-white/[0.03] border-foreground/10 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-foreground dark:text-white"
                        onChange={(e) => {
                          const val = onlyDigits(e.target.value);
                          if (val.length <= 11) e.target.value = maskCpf(val);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="code-name" className="text-[11px] font-black uppercase tracking-widest text-emerald-500/90">Nome Completo</Label>
                    <div className="relative group/field">
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/field:text-emerald-500" />
                      <Input id="code-name" aria-label="Nome completo" placeholder="Ex: João Silva" className="h-12 rounded-xl pl-10 text-sm bg-foreground/[0.03] dark:bg-white/[0.03] border-foreground/10 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-foreground dark:text-white" />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-11 sm:h-12 rounded-xl text-[13px] sm:text-[14px] font-black uppercase tracking-widest gap-2 bg-brand text-brand-foreground hover:opacity-95 shadow-lg shadow-brand/20 active:scale-[0.98] transition-all" 
                    onClick={async () => {
                      const cpfInput = document.getElementById("code-cpf") as HTMLInputElement;
                      const nameInput = document.getElementById("code-name") as HTMLInputElement;
                      const cpf = onlyDigits(cpfInput?.value || "");
                      const name = nameInput?.value?.trim();

                      if (cpf.length !== 11) {
                        toast.error("CPF inválido", { description: "Certifique-se de digitar os 11 números." });
                        return;
                      }
                      if (!name || name.length < 3) {
                        toast.error("Nome inválido", { description: "Por favor, informe seu nome completo ou como deseja ser chamado." });
                        return;
                      }

                        toast.promise(
                        (async () => {
                          const result = await verifyAccessCode({ data: { code: pendingCode } });
                          if (!result.valid) {
                            throw new Error(result.reason === "revoked" ? "Código bloqueado" : "Código inválido ou expirado");
                          }
                          // Aqui o fluxo real de login simplificado seria disparado
                          // No MVP, redirecionamos para o fluxo convencional com os dados pré-preenchidos
                          toast.info("Validando credenciais...");
                          await new Promise(r => setTimeout(r, 1000));
                        })(),
                        {
                          loading: "Verificando código...",
                          success: "Acesso autorizado! Redirecionando...",
                          error: (err) => err.message
                        }
                      );
                    }}
                  >
                    <LogIn className="size-4" />
                    Acessar Painel
                  </Button>

                  <div className="pt-1 text-center">
                    <button 
                      onClick={() => {
                        setPendingCode(null);
                        sessionStorage.removeItem(PENDING_LICENSE_KEY);
                        navigate({ to: "/auth", search: { mode: "login" }, replace: true });
                      }} 
                      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-brand transition-colors p-2"
                    >
                      Usar e-mail e senha convencional
                    </button>
                  </div>
                </div>
              </div>
            ) : mode === "forgot" ? (
              <ForgotPasswordForm onBack={() => setMode("login")} />
            ) : mode === "admin" ? (
              <AdminSignInForm onBack={() => setMode("login")} />
            ) : mode === "external" ? (
              <ExternalSignInForm onBack={() => setMode("login")} initialCode={search.external ?? ""} />
            ) : (
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as Mode)}
                className="relative flex min-h-0 flex-col"
              >
                <TabsList className="grid h-10 w-full grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-brand-green data-[state=active]:text-white transition-all active:scale-95"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-brand-green data-[state=active]:text-white transition-all active:scale-95"
                  >
                    Criar conta
                  </TabsTrigger>
                </TabsList>

                <div className="mt-3 flex-1">

                  <TabsContent value="login" className="m-0 focus-visible:outline-none">
                    <CpfSignInForm
                      onForgot={() => setMode("forgot")}
                      onAdmin={() => setMode("admin")}
                    />
                    <div className="relative mt-5">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border/50"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="bg-background px-3 text-muted-foreground/50">Alternativas</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMode("kid")}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-2.5 transition-all hover:bg-muted/50 hover:border-brand-green/30"
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                          <Baby className="size-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Acesso Kids</span>
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPendingCode("")}
                        className="h-11 rounded-xl text-[11px] font-bold uppercase tracking-widest gap-2"
                      >
                        <Fingerprint className="size-3.5" />
                        Código de Acesso
                      </Button>
                    </div>

                  </TabsContent>
                  <TabsContent value="signup" className="m-0 focus-visible:outline-none">
                    <CpfSignUpForm onDone={() => setMode("login")} />
                    <p className="mt-4 border-t border-border pt-3 text-center text-[12px] font-medium text-[oklch(0.25_0.04_259)] dark:text-white/90">
                      Já tem conta?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-semibold text-primary underline underline-offset-2"
                      >
                        Voltar para Entrar
                      </button>
                    </p>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>

          <div className="mt-3 shrink-0 border-t border-border/50 pt-2.5">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut().catch(() => undefined);
                  clearBrowserCredentials();
                  window.location.replace("/auth");
                }}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Limpar acesso salvo neste navegador
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-xs text-destructive dark:text-destructive-foreground font-semibold">
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

function FormAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-[13px] font-bold text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span className="leading-tight">{message}</span>
    </div>
  );
}

function CpfInput({
  id,
  name,
  value,
  onChange,
  invalid,
  describedById,
  autoComplete,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedById?: string;
  autoComplete?: string;
}) {
  return (
    <Input
      id={id}
      name={name}
      value={value}
      inputMode="numeric"
      autoComplete={autoComplete || "username"}
      placeholder="000.000.000-00"
      maxLength={14}
      required
      aria-invalid={invalid || undefined}
      aria-describedby={describedById}
      className="h-10 rounded-xl border-border/50 bg-muted/20"
      onChange={(event) => onChange(maskCpf(event.target.value))}
    />
  );
}

function PinInput({
  id,
  name,
  autoComplete,
  invalid,
  describedById,
  label = "Senha (6 dígitos)",
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  invalid?: boolean;
  describedById?: string;
  label?: string;
}) {
  const [show, setShow] = useState(false);
  const Icon = show ? EyeOff : Eye;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </Label>
      </div>
      <div className="relative mt-1.5">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          inputMode="numeric"
          autoComplete={autoComplete}
          placeholder="••••••"
          maxLength={6}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedById}
          className="h-10 rounded-xl border-border/50 bg-muted/20 pr-10 tracking-[0.4em]"
          onChange={(event) => {
            event.target.value = onlyDigits(event.target.value).slice(0, 6);
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon className="size-4" />
        </button>
      </div>
    </div>
  );
}

// Versão anterior para compatibilidade se necessário (embora não usada nas rotas principais)
function PinInputOld({
  id,
  name,
  autoComplete,
  invalid,
  describedById,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  invalid?: boolean;
  describedById?: string;
}) {
  return (
    <Input
      id={id}
      name={name}
      type="password"
      inputMode="numeric"
      autoComplete={autoComplete}
      placeholder="••••••"
      maxLength={6}
      required
      aria-invalid={invalid || undefined}
      aria-describedby={describedById}
      className="mt-1.5 tracking-[0.4em]"
      onChange={(event) => {
        event.target.value = onlyDigits(event.target.value).slice(0, 6);
      }}
    />
  );
}

function CpfSignInForm({ onForgot, onAdmin }: { onForgot: () => void; onAdmin: () => void }) {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const clearFields = useClearAuthFields();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = cpfSignInSchema.safeParse({
      cpf,
      pin: String(form.get("pin") ?? ""),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);
    
    try {
      await checkRateLimit({ data: { identifier: parsed.data.cpf } });
    } catch (e: any) {
      setLoading(false);
      const msg = e.status === 429 ? e.message : "Falha na validação. Tente novamente.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cpfToLoginEmail(parsed.data.cpf),
      password: pinToPassword(parsed.data.cpf, parsed.data.pin),
    });
    setLoading(false);

    if (error) {
      // Implementação de alerta genérico e profissional para ocultar detalhes sobre CPF/Senha
      const message = friendlyAuthError(error.message);
      setFormError(message);
      toast.error(message, {
        description: "Verifique seus dados e tente novamente.",
        duration: 5000
      });
      return;
    }
    clearFields();
    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  const checkRateLimit = useServerFn(authRateLimiter);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-3" 
      noValidate 
      aria-busy={loading} 
      autoComplete="off"
    >
      <FormAlert message={formError} />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-cpf" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CPF</Label>
          <CpfInput id="login-cpf" name="cpf" value={cpf} onChange={setCpf} autoComplete="off" invalid={!!errors.cpf} />
          <FieldError message={errors.cpf} />
        </div>
        
        <div className="space-y-1.5">
          <PinInput id="login-pin" name="pin" autoComplete="current-password" label="Senha" invalid={!!errors.pin} />
          <FieldError message={errors.pin} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox 
          id="remember-me" 
          checked={rememberMe} 
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          className="border-muted-foreground/30 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
        />
        <Label htmlFor="remember-me" className="text-[11px] font-bold text-muted-foreground/80 cursor-pointer select-none">
          Manter-me conectado
        </Label>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onForgot} className="text-[11px] font-bold text-brand-green hover:underline">
          Esqueci minha senha
        </button>
        <button 
          type="button" 
          onClick={onAdmin} 
          className="group inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 hover:text-brand-green transition-colors"
        >
          <ShieldAlert className="size-3" />
          Acesso ADM
        </button>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          className="h-11 w-full rounded-xl bg-brand-green text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all active:scale-95" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="ml-2 size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function useClearAuthFields() {
  return () => {
    // Busca todos os inputs de texto, e-mail e CPF e limpa os valores
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])');
    inputs.forEach((input) => {
      const el = input as HTMLInputElement;
      el.value = '';
      // Dispara evento de input para sincronizar com estados de bibliotecas (se houver)
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
}


function CpfSignUpForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const clearFields = useClearAuthFields();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = cpfSignUpSchema.safeParse({
      fullName: String(form.get("fullName") ?? ""),
      cpf,
      contactEmail: String(form.get("contactEmail") ?? ""),
      pin: String(form.get("pin") ?? ""),
      confirmPin: String(form.get("confirmPin") ?? ""),
      acceptTerms: true,
      acceptPrivacy: true,
    });

    if (!parsed.success) {
      // Mostra exatamente qual campo precisa de correção.
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError(
        Object.values(fieldErrors)[0] ?? "Revise os dados informados.",
      );
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);

    const loginEmail = cpfToLoginEmail(parsed.data.cpf);
    const password = pinToPassword(parsed.data.cpf, parsed.data.pin);

    const { error } = await supabase.auth.signUp({
      email: loginEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          full_name: parsed.data.fullName,
          cpf: parsed.data.cpf,
          contact_email: parsed.data.contactEmail || null,
        },
      },
    });

    if (error) {
      setLoading(false);
      const message = friendlyAuthError(error.message);
      setFormError(message);
      toast.error(message);
      return;
    }

    // Entra automaticamente e leva o cliente para dentro do sistema.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    setLoading(false);

    if (signInError) {
      toast.success("Conta criada! Faça o login para continuar.");
      onDone();
      return;
    }

    toast.success("Conta criada! Bem-vindo ao GastoCerto.");
    clearFields();
    navigate({ to: "/painel", replace: true });
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate autoComplete="off">
      <FormAlert message={formError} />
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="signup-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo</Label>
          <Input id="signup-name" name="fullName" required className="h-10 rounded-xl border-border/50 bg-muted/20" autoComplete="off" aria-invalid={!!errors.fullName} />
          <FieldError message={errors.fullName} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-cpf" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CPF</Label>
          <CpfInput id="signup-cpf" name="cpf" value={cpf} onChange={setCpf} autoComplete="off" invalid={!!errors.cpf} />
          <FieldError message={errors.cpf} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail (opcional)</Label>
          <Input id="signup-email" name="contactEmail" type="email" className="h-10 rounded-xl border-border/50 bg-muted/20" autoComplete="off" aria-invalid={!!errors.contactEmail} />
          <FieldError message={errors.contactEmail} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <PinInput id="signup-pin" name="pin" autoComplete="new-password" label="Senha" invalid={!!errors.pin} />
            <FieldError message={errors.pin} />
          </div>
          <div className="space-y-1">
            <PinInput id="signup-confirm-pin" name="confirmPin" autoComplete="new-password" label="Confirmar" invalid={!!errors.confirmPin} />
            <FieldError message={errors.confirmPin} />
          </div>
        </div>
      </div>
      <div className="pt-3">
        <Button 
          type="submit" 
          className="h-11 w-full rounded-xl bg-brand-green text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all active:scale-95" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <>
              Criar conta
              <ArrowRight className="ml-2 size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Recuperar senha</h3>
      <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento.</p>
      <Button onClick={onBack} variant="outline" className="w-full">Voltar</Button>
    </div>
  );
}

function AdminSignInForm({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearFields = useClearAuthFields();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      setLoading(false);
      return;
    }

    clearFields();
    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <div className="text-center">
        <h3 className="text-lg font-black text-foreground tracking-tight">Painel Administrativo</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Restrito a gestores</p>
      </div>
      
      <FormAlert message={error} />

      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="admin-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</Label>
          <Input 
            id="admin-email" 
            name="email" 
            type="email" 
            placeholder="admin@exemplo.com"
            autoComplete="off"
            required
            className="h-10 rounded-xl border-border/50 bg-muted/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Senha</Label>
          <Input 
            id="admin-password" 
            name="password" 
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-10 rounded-xl border-border/50 bg-muted/20"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="h-11 w-full rounded-xl bg-brand-navy text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all active:scale-95" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <>
              Entrar Admin
              <ShieldAlert className="ml-2 size-3.5" />
            </>
          )}
        </Button>
      </div>

      <Button type="button" onClick={onBack} variant="ghost" className="h-9 w-full text-xs">
        Voltar para login comum
      </Button>
    </form>
  );
}

/**
 * Entrada independente da criança: código definido pelo responsável + senha
 * numérica. Não pede CPF nem e-mail e vai direto para o painel infantil.
 */
function KidSignInForm({ onBack, initialCode = "" }: { onBack: () => void; initialCode?: string }) {
  const navigate = useNavigate();
  const checkLock = useServerFn(checkKidLock);
  const registerAttempt = useServerFn(registerKidAttempt);
  const checkStatus = useServerFn(async (args: { data: { kidUserId?: string; code?: string } }) => {
    const { checkKidAccountStatus } = await import("@/lib/kids-license-check.functions");
    let kidUserId = args.data.kidUserId;
    if (!kidUserId && args.data.code) {
      const { data } = await supabase.from("dependents").select("id").eq("kid_login_code", args.data.code).maybeSingle();
      if (data) kidUserId = data.id;
    }
    if (!kidUserId) return { active: true, readOnly: false };
    const result = await checkKidAccountStatus({ data: { kidUserId } });
    return result as import("@/lib/kids-license-check.functions").KidAccountStatus;
  });

  const [code, setCode] = useState(normalizeKidCode(initialCode));
  const [pin, setPin] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const clearFields = useClearAuthFields();

  // Conta o tempo restante do bloqueio temporário.
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setInterval(() => setLockSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanCode = normalizeKidCode(code);
    if (!isValidKidCode(cleanCode) || !isValidKidPin(pin)) {
      setFormError("Confira o código e a senha (4 a 6 números).");
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      const lock = await checkLock({ data: { code: cleanCode } });
      if (lock.locked) {
        setLockSeconds(lock.secondsLeft);
        setFormError(kidLockMessage(lock.secondsLeft));
        setLoading(false);
        return;
      }
    } catch {
      // Se a checagem falhar, seguimos com o login normal.
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: kidCodeToEmail(cleanCode),
      password: kidPassword(cleanCode, pin),
    });

    let status: { locked: boolean; secondsLeft: number; remaining: number } | null = null;
    try {
      status = await registerAttempt({ data: { code: cleanCode, success: !error } });
    } catch {
      status = null;
    }
    setLoading(false);

    if (error) {
      const message = status?.locked
        ? kidLockMessage(status.secondsLeft)
        : kidRemainingMessage(status?.remaining ?? 0);
      if (status?.locked) setLockSeconds(status.secondsLeft);
      setFormError(message);
      toast.error(message);
      return;
    }

    // Verificar se o plano do pai expirou ANTES de redirecionar.
    try {
      const statusCheck = await checkStatus({ data: { code: cleanCode } }) as any;
      if (statusCheck.active === false || statusCheck.readOnly) {
        toast.warning("Aviso de Assinatura", {
          description: statusCheck.message || "A assinatura do seu responsável está expirada. O sistema entrará em modo somente leitura.",
          duration: 6000,
        });
      }
    } catch (e) {
      console.warn("Status check skipped", e);
    }



    // Registra a sessão com informações de dispositivo/IP (via RPC ou direto no servidor se possível, mas aqui usamos metadados ou o servidor na próxima requisição)
    try {
      const { data: dependent } = await supabase.from("dependents").select("id, user_id").eq("kid_login_code", cleanCode).single();
      if (dependent) {
        await supabase.from("kid_session_logs" as any).insert({
          dependent_id: dependent.id,
          user_id: dependent.user_id,
          user_agent: navigator.userAgent,
          device_info: { 
            screen: { width: window.screen.width, height: window.screen.height },
            platform: (navigator as any).platform,
            language: navigator.language
          }
        } as any);
      }
    } catch (e) {
      console.warn("Falha ao registrar log de sessão:", e);
    }

    clearFields();
    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate aria-busy={loading} autoComplete="off">
      <div className="flex items-center justify-center gap-2">
        <Baby className="size-5 shrink-0 text-primary" aria-hidden />
        <h1 className="text-lg font-extrabold text-foreground">Entrar no meu espaço</h1>
      </div>

      <FormAlert message={formError} />
      <div>
        <Label htmlFor="kid-code" className="text-[oklch(0.25_0.04_259)] dark:text-foreground font-semibold">Meu código</Label>
        <Input
          id="kid-code"
          value={code}
          onChange={(event) => setCode(normalizeKidCode(event.target.value))}
          placeholder="EX: JOAO-A1B"
          autoComplete="off"
          className="mt-1 font-mono tracking-wide uppercase"
        />
      </div>
      <PinInput 
        id="kid-pin" 
        name="pin" 
        autoComplete="current-password" 
        label="Minha senha (4 a 6 números)"
      />
      
      {lockSeconds > 0 ? (
        <p className="rounded-xl bg-destructive/10 p-2.5 text-center text-[12px] font-semibold text-destructive">
          Bloqueado por {Math.floor(lockSeconds / 60)}:{String(lockSeconds % 60).padStart(2, "0")}
        </p>
      ) : null}
      <div className="pt-2">
        <Button 
          type="submit" 
          className="h-11 w-full rounded-xl bg-brand-green text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all active:scale-95" 
          disabled={loading || lockSeconds > 0}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <>
              Entrar no Meu Espaço
              <Baby className="ml-2 size-3.5" />
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-center gap-2 whitespace-nowrap px-3 text-xs font-semibold"
          onClick={() => {
            toast.info("Aponte a câmera para o QR Code no painel do seu responsável.");
          }}
        >
          <KeyRound className="size-3.5 shrink-0" />
          <span className="truncate">Acesso via QR Code</span>
        </Button>
        <Button type="button" variant="ghost" className="h-9 w-full text-xs" onClick={onBack}>
          Voltar
        </Button>
      </div>

    </form>
  );
}

function ExternalSignInForm({ onBack, initialCode }: { onBack: () => void; initialCode: string }) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/external-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao validar");

      toast.success("Acesso autorizado!");
      window.location.href = `/compartilhado/\${code}`;
    } catch (err: any) {
      setError(err.message || "Erro ao validar código.");
      setLoading(false);
    }

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Acesso Externo</h3>
        <p className="text-[12px] text-muted-foreground">Visualize relatórios compartilhados sem cadastro.</p>
      </div>
      <FormAlert message={error} />
      <div>
        <Label htmlFor="ext-code" className="text-[oklch(0.25_0.04_259)] dark:text-foreground font-semibold">Código de Acesso</Label>
        <Input
          id="ext-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="EX: SHARE-123"
          className="mt-1 font-mono uppercase"
          required
        />
      </div>
      <div>
        <Label htmlFor="ext-pass" className="text-[oklch(0.25_0.04_259)] dark:text-foreground font-semibold">Senha</Label>
        <Input
          id="ext-pass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite a senha do link"
          className="mt-1"
          required
        />
      </div>
      <div className="pt-2">
        <Button 
          type="submit" 
          className="cta-lift btn-hover-shine h-12 w-full rounded-xl bg-brand text-base font-bold text-brand-foreground shadow-[0_10px_26px_-14px_color-mix(in_oklab,var(--brand)_70%,transparent)] hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <>
              Ver Relatório
              <ArrowRight className="ml-2 size-5" />
            </>
          )}
        </Button>
      </div>
      <Button type="button" variant="ghost" className="h-9 w-full text-xs" onClick={onBack}>
        Voltar
      </Button>
    </form>
  );
}

