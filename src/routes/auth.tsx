import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Baby, KeyRound, Loader2, Sparkles, LayoutDashboard, UserPlus, ShieldAlert, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { activateLicense } from "@/lib/licenses.functions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
});


export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Acesse sua conta — GastoCerto" },
      {
        name: "description",
        content: "Faça login no GastoCerto para controlar suas finanças pessoais.",
      },
      { property: "og:title", content: "Acesse sua conta — GastoCerto" },
      {
        property: "og:description",
        content: "Faça login no GastoCerto para controlar suas finanças pessoais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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

  const [pendingCode, setPendingCode] = useState<string | null>(null);

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
        navigate({ to, replace: true });
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
    <main className="relative isolate grid h-dvh max-h-dvh w-full place-items-center overflow-hidden p-3 sm:p-4">
      {/* Imagem de fundo global para o layout */}
      <img
        src={authHero}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(165deg,oklch(0.16_0.03_258/0.95)_0%,oklch(0.16_0.03_258/0.88)_50%,oklch(0.16_0.03_258/0.97)_100%)]"
      />

      {/* Card principal com altura fixa para evitar redimensionamento brusco */}
      <div className="grid h-[540px] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-lifted backdrop-blur-md lg:grid-cols-[1fr_minmax(0,22rem)]">
        {/* Painel lateral dinâmico (Hero) */}
        <section className="relative hidden flex-col justify-between overflow-hidden lg:flex">
          {/* Imagem Hero específica para cada modo */}
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
            className="absolute inset-0 -z-10 size-full object-cover brightness-[0.4] transition-all duration-700"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-[oklch(0.25_0.06_259/0.6)] via-transparent to-[oklch(0.16_0.03_258/0.8)]"
          />

          <div className="p-7">
            <Link to="/" className="relative z-10 inline-flex w-fit rounded-md">
              <Logo onDark />
            </Link>
          </div>

          <div className="relative z-10 space-y-5 p-7">
            <div className="flex -space-x-3 overflow-hidden">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
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
              <h2 className="font-display mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                {mode === "login"
                  ? "Suas finanças organizadas em um só sistema."
                  : mode === "signup"
                    ? "Comece hoje sua jornada para a liberdade financeira."
                    : mode === "forgot"
                      ? "Não se preocupe, vamos te ajudar a voltar."
                      : "Área de administração técnica e suporte."}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/85 drop-shadow-sm">
                {mode === "login"
                  ? "Entre com seu CPF e senha. Seus dados estão protegidos com criptografia de ponta."
                  : mode === "signup"
                    ? "Crie sua conta em segundos. Teste grátis por 14 dias com todos os recursos liberados."
                    : mode === "forgot"
                      ? "Informe seus dados para validar sua identidade e redefinir sua senha de acesso."
                      : "Acesso restrito para gerentes do sistema e auditores."}
              </p>
            </div>
          </div>

          <div className="p-7 pt-0">
            <p className="relative z-10 text-[9px] font-medium uppercase tracking-[0.25em] text-white/60">
              &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
            </p>
          </div>
        </section>

        {/* Painel do formulário rolável */}
        <section className="flex flex-col overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-4 flex justify-center lg:hidden">
            <Link to="/" className="w-fit">
              <Logo />
            </Link>
          </div>

          {mode === "forgot" ? (
            <ForgotPasswordForm onBack={() => setMode("login")} />
          ) : mode === "admin" ? (
            <AdminSignInForm onBack={() => setMode("login")} />
          ) : mode === "external" ? (
            <ExternalSignInForm onBack={() => setMode("login")} initialCode={search.external ?? ""} />
          ) : (
            <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <TabsList className="grid h-9 w-full grid-cols-2">
                <TabsTrigger value="login" className="text-xs">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <CpfSignInForm
                  onForgot={() => setMode("forgot")}
                  onAdmin={() => setMode("admin")}
                />
                <button
                  type="button"
                  onClick={() => setMode("kid")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] font-bold text-primary transition hover:bg-primary/10"
                >
                  <Baby className="size-4" aria-hidden />
                  Sou criança — entrar com meu código
                </button>
                <CodeAccessInline onContinue={() => setMode("signup")} />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <CpfSignUpForm onDone={() => setMode("login")} />
                <p className="mt-3 border-t border-border pt-2.5 text-center text-[11px] text-muted-foreground">
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
            </Tabs>
          )}

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
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
        </section>
      </div>
    </main>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-xs text-destructive">
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
      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
    >
      <AlertCircle className="mt-px size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
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
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedById?: string;
}) {
  return (
    <Input
      id={id}
      name={name}
      value={value}
      inputMode="numeric"
      autoComplete="username"
      placeholder="000.000.000-00"
      maxLength={14}
      required
      aria-invalid={invalid || undefined}
      aria-describedby={describedById}
      className="mt-1 h-10"
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = cpfSignInSchema.safeParse({
      cpf,
      pin: String(form.get("pin") ?? ""),
    });

    if (!parsed.success) {
      setErrors({});
      setFormError("Revise os dados informados.");
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: cpfToLoginEmail(parsed.data.cpf),
      password: pinToPassword(parsed.data.cpf, parsed.data.pin),
    });
    setLoading(false);

    if (error) {
      const message = friendlyAuthError(error.message);
      setFormError(message);
      toast.error(message);
      return;
    }
    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate aria-busy={loading}>
      <FormAlert message={formError} />
      <div>
        <Label htmlFor="login-cpf">CPF</Label>
        <CpfInput id="login-cpf" name="cpf" value={cpf} onChange={setCpf} />
      </div>
      <div>
        <Label htmlFor="login-pin">Senha (6 dígitos)</Label>
        <PinInput id="login-pin" name="pin" autoComplete="current-password" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onForgot} className="text-sm font-semibold text-primary underline">
          Esqueci minha senha
        </button>
        <button type="button" onClick={onAdmin} className="text-xs text-muted-foreground">
          Acesso administrativo
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}

function CpfSignUpForm({ onDone }: { onDone: () => void }) {
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

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
      setFormError("Revise os dados informados.");
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: cpfToLoginEmail(parsed.data.cpf),
      password: pinToPassword(parsed.data.cpf, parsed.data.pin),
      options: {
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

    await supabase.auth.signInWithPassword({
      email: cpfToLoginEmail(parsed.data.cpf),
      password: pinToPassword(parsed.data.cpf, parsed.data.pin),
    });
    setLoading(false);
    toast.success("Conta criada!");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
      <FormAlert message={formError} />
      <div>
        <Label htmlFor="signup-name">Nome Completo</Label>
        <Input id="signup-name" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="signup-cpf">CPF</Label>
        <CpfInput id="signup-cpf" name="cpf" value={cpf} onChange={setCpf} />
      </div>
      <div>
        <Label htmlFor="signup-email">E-mail de contato (opcional)</Label>
        <Input id="signup-email" name="contactEmail" type="email" />
      </div>
      <div>
        <Label htmlFor="signup-pin">Senha (6 dígitos)</Label>
        <PinInput id="signup-pin" name="pin" autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="signup-confirm-pin">Confirmar Senha</Label>
        <PinInput id="signup-confirm-pin" name="confirmPin" autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Criar conta
      </Button>
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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Acesso Administrativo</h3>
      <p className="text-sm text-muted-foreground">Use suas credenciais de administrador.</p>
      <Button onClick={onBack} variant="outline" className="w-full">Voltar</Button>
    </div>
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

    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate aria-busy={loading}>
      <div className="flex items-center justify-center gap-2">
        <Baby className="size-5 shrink-0 text-primary" aria-hidden />
        <h1 className="text-lg font-extrabold text-foreground">Entrar no meu espaço</h1>
      </div>

      <FormAlert message={formError} />
      <div>
        <Label htmlFor="kid-code">Meu código</Label>
        <Input
          id="kid-code"
          value={code}
          onChange={(event) => setCode(normalizeKidCode(event.target.value))}
          placeholder="EX: JOAO-A1B"
          autoComplete="username"
          className="mt-1.5 font-mono tracking-wide uppercase"
        />
      </div>
      <div>
        <Label htmlFor="kid-pin">Minha senha (4 a 6 números)</Label>
        <Input
          id="kid-pin"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => setPin(onlyDigits(event.target.value).slice(0, 6))}
          placeholder="••••"
          autoComplete="current-password"
          className="mt-1.5 tracking-[0.4em]"
        />
      </div>
      {lockSeconds > 0 ? (
        <p className="rounded-xl bg-destructive/10 p-2.5 text-center text-[12px] font-semibold text-destructive">
          Bloqueado por {Math.floor(lockSeconds / 60)}:{String(lockSeconds % 60).padStart(2, "0")}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-11 w-full text-sm font-bold shadow-soft"
        disabled={loading || lockSeconds > 0}
      >
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Entrar no meu espaço
      </Button>
      
      <div className="mt-2 flex gap-2 border-t border-border pt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full text-xs gap-2"
          onClick={() => {
            toast.info("Aponte a câmera para o QR Code no painel do seu responsável.");
          }}
        >
          <KeyRound className="size-3.5" />
          Acesso via QR Code
        </Button>
        <Button type="button" variant="ghost" className="w-full text-xs" onClick={onBack}>
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
        <Label htmlFor="ext-code">Código de Acesso</Label>
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
        <Label htmlFor="ext-pass">Senha</Label>
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Ver Relatório"}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Voltar
      </Button>
    </form>
  );
}

