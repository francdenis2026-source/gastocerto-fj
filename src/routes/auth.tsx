import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertCircle, Baby, KeyRound, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import authHero from "@/assets/auth-hero.jpg";
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
import {
  cpfSignInSchema,
  cpfSignUpSchema,
  forgotPasswordSchema,
  friendlyAuthError,
} from "@/lib/validation";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
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

type Mode = "login" | "signup" | "forgot" | "admin" | "kid";

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>(search.mode === "signup" ? "signup" : "login");
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

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden lg:grid lg:grid-cols-[1.05fr_minmax(0,28rem)]">
      <img
        src={authHero}
        alt=""
        aria-hidden="true"
        width={1536}
        height={1024}
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(175deg,oklch(0.16_0.03_258/0.9)_0%,oklch(0.16_0.03_258/0.75)_45%,oklch(0.16_0.03_258/0.95)_100%)] lg:hidden"
      />

      <section className="relative isolate hidden overflow-hidden bg-[oklch(0.16_0.03_258)] text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
        <img
          src={authHero}
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          decoding="async"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,oklch(0.16_0.03_258/0.9)_10%,oklch(0.16_0.03_258/0.62)_58%,oklch(0.16_0.03_258/0.94)_100%)]"
        />
        <Link to="/" className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          <Logo onDark />
        </Link>
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
            Acesso à plataforma
          </p>
          <h2 className="font-display mt-2 text-3xl font-extrabold leading-tight tracking-[-0.02em] xl:text-4xl">
            Suas finanças organizadas em um só sistema.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            Acesse com CPF e senha de 6 dígitos. Cadastro gratuito, sem necessidade de cartão.
          </p>
        </div>
        <p className="text-[11px] text-white/90">Dev. Franc D&apos;nis · Feijó-AC</p>
      </section>

      <section className="relative flex w-full items-center justify-center px-4 py-8 lg:bg-secondary/30">
        <div className="w-full max-w-sm">
          <div className="mb-5 flex justify-center lg:hidden">
            <Link to="/">
              <Logo onDark />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-lifted backdrop-blur-md sm:p-6 lg:bg-card lg:shadow-sm">
            {mode === "forgot" ? (
              <ForgotPasswordForm onBack={() => setMode("login")} />
            ) : mode === "admin" ? (
              <AdminSignInForm onBack={() => setMode("login")} />
            ) : mode === "kid" ? (
              <KidSignInForm onBack={() => setMode("login")} />
            ) : (
              <Tabs 
                value={mode} 
                onValueChange={(value) => setMode(value as Mode)}
                className="transition-all duration-300 ease-in-out"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="transition-all">Entrar</TabsTrigger>
                  <TabsTrigger value="signup" className="transition-all">Criar conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-5">
                  <CpfSignInForm
                    onForgot={() => setMode("forgot")}
                    onAdmin={() => setMode("admin")}
                  />
                  <button
                    type="button"
                    onClick={() => setMode("kid")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-[12px] font-bold text-primary transition hover:bg-primary/10"
                  >
                    <Baby className="size-4" aria-hidden />
                    Sou criança — entrar com meu código
                  </button>
                </TabsContent>
                <TabsContent value="signup" className="mt-5">
                  <CpfSignUpForm onDone={() => setMode("login")} />
                  <p className="mt-4 border-t border-border pt-3 text-center text-xs text-muted-foreground">
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
          </div>

          {mode === "login" ? <CodeAccessInline onContinue={() => setMode("signup")} /> : null}

          <p className="mt-4 text-center text-xs text-white/80 lg:text-muted-foreground">
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut().catch(() => undefined);
                clearBrowserCredentials();
                window.location.replace("/auth");
              }}
              className="underline underline-offset-2 hover:text-white lg:hover:text-foreground"
            >
              Limpar acesso salvo neste navegador
            </button>
          </p>
        </div>
      </section>
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
      className="mt-1.5"
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
function KidSignInForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanCode = normalizeKidCode(code);
    if (!isValidKidCode(cleanCode) || !isValidKidPin(pin)) {
      setFormError("Confira o código e a senha (4 a 6 números).");
      return;
    }

    setFormError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: kidCodeToEmail(cleanCode),
      password: kidPassword(cleanCode, pin),
    });
    setLoading(false);

    if (error) {
      const message = "Código ou senha incorretos. Peça ajuda ao seu responsável.";
      setFormError(message);
      toast.error(message);
      return;
    }
    navigate({ to: await resolveHomeRouteForSession(), replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
      <div className="flex items-center gap-2">
        <Baby className="size-5 text-primary" aria-hidden />
        <h3 className="text-base font-bold text-foreground">Entrada da criança</h3>
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
      <Button type="submit" className="w-full h-12 text-base font-bold shadow-soft" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Entrar no meu espaço
      </Button>
      
      <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
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
