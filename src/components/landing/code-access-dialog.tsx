import { useNavigate } from "@tanstack/react-router";
import { KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { useServerFn } from "@tanstack/react-start";
import { adminAccessByCode } from "@/functions/admin-code.functions";
import { verifyAccessCode } from "@/functions/licenses.functions";
import { cn } from "@/lib/utils";

/** Chave guardada até o login para ser ativada automaticamente na conta. */
export const PENDING_LICENSE_KEY = "gastocerto:pending-license";

type Status = "idle" | "verifying" | "valid" | "invalid" | "used";

export function CodeAccessDialog({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminAccessByCode);
  const checkCode = useServerFn(verifyAccessCode);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const key = code.trim().toUpperCase();
    if (key.length < 5) {
      toast.error("Informe o código completo.");
      return;
    }

    setStatus("verifying");
    setMessage("Validando código nos servidores...");

    try {
      // 1. Tenta validar como acesso administrativo direto (sem auth necessária)
      const res = await checkAdmin({ data: { code: key } });
      if (res.success) {
        setStatus("valid");
        setMessage(`Bem-vindo, ${res.label || "Administrador"}. Acesso confirmado! Redirecionando...`);
        setTimeout(() => {
          setOpen(false);
          window.location.href = "/admin";
        }, 1500);
        return;
      }
    } catch (e: any) {
      // Se deu erro mas é um erro de limite ou expiração, mostramos
      if (e.message && (e.message.includes("expirado") || e.message.includes("limite"))) {
        setStatus("invalid");
        setMessage(e.message);
        return;
      }
    }

    // 2. Se não é admin, valida a licença no servidor (sem depender de login)
    try {
      const result = await checkCode({ data: { code: key } });

      if (!result.valid) {
        setStatus(result.reason === "used" ? "used" : "invalid");
        setMessage(
          result.reason === "not_found"
            ? "Este código não foi encontrado. Verifique e tente novamente."
            : result.reason === "revoked"
              ? "Esta licença foi bloqueada/revogada pelo administrador."
              : result.reason === "expired"
                ? "Esta licença já expirou."
                : "Este código já foi utilizado em outra conta.",
        );
        return;
      }

      setStatus("valid");
      setMessage(
        result.planName
          ? `Licença para o plano "${result.planName}" identificada! Autenticando sua sessão...`
          : "Código de licença válido! Autenticando sua sessão...",
      );

      try {
        sessionStorage.setItem(PENDING_LICENSE_KEY, key);
      } catch {}

      setTimeout(() => {
        setOpen(false);
        // Otimização: Direciona para o login simplificado ou direto se já for reconhecido
        void navigate({ to: "/auth", search: { mode: "login", code: key } });
      }, 1500);
    } catch (err) {
      console.error("[code-access] erro na validação:", err);
      setStatus("invalid");
      setMessage("Erro ao validar código. Tente novamente mais tarde.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setStatus("idle");
        setMessage(null);
        setCode("");
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" aria-hidden />
            Acesso Profissional por Código
          </DialogTitle>
          <DialogDescription>
            Insira seu código de acesso, cupom ou licença para desbloquear sua conta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="access-code">Código de Acesso</Label>
            <div className="relative">
              <Input
                id="access-code"
                value={code}
                autoComplete="off"
                spellCheck={false}
                disabled={status === "verifying" || status === "valid"}
                placeholder="GC-XXXX-XXXX"
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
                className={cn(
                  "font-mono transition-all duration-200 pr-10",
                  status === "valid" && "border-success bg-success/10",
                  status === "invalid" && "border-destructive bg-destructive/5"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === "verifying" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {status === "valid" && <CheckCircle2 className="size-4 text-success" />}
                {status === "invalid" && <XCircle className="size-4 text-destructive" />}
              </div>
            </div>
          </div>

          {message && (
            <div className={cn(
              "rounded-lg border p-3 text-xs leading-relaxed transition-all animate-in fade-in slide-in-from-top-1",
              status === "valid" && "border-success/40 bg-success/10 text-success",
              status === "invalid" && "border-destructive/20 bg-destructive/10 text-destructive",
              status === "verifying" && "border-border bg-secondary/50 text-muted-foreground"
            )}>
              <p className="flex items-start gap-2">
                {status === "valid" && <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" />}
                {status === "invalid" && <XCircle className="size-3.5 mt-0.5 shrink-0" />}
                {message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            type="button" 
            onClick={submit} 
            disabled={status === "verifying" || status === "valid" || !code} 
            className="w-full sm:w-auto"
          >
            {status === "verifying" ? "Validando..." : "Verificar Código"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
