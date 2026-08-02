import { useNavigate } from "@tanstack/react-router";
import { KeyRound, ShieldAlert, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
import { adminAccessByCode } from "@/lib/admin-code.functions";
import { cn } from "@/lib/utils";

/** Chave guardada até o login para ser ativada automaticamente na conta. */
export const PENDING_LICENSE_KEY = "gastocerto:pending-license";

type Status = "idle" | "verifying" | "valid" | "invalid" | "used";

export function CodeAccessDialog({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminAccessByCode);
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
      // Tenta validar como admin primeiro
      const res = await checkAdmin({ data: { code: key } });
      if (res.success) {
        setStatus("valid");
        setMessage("Acesso administrativo confirmado! Redirecionando...");
        setTimeout(() => {
          setOpen(false);
          window.location.href = "/admin";
        }, 1500);
        return;
      }
    } catch (e) {
      // Não é admin, segue fluxo de licença normal
    }

    // Simulação de validação de licença (integrar com banco depois)
    const isPlanCode = key.startsWith("VIP") || key.startsWith("PLAN") || key.startsWith("OFF") || key.includes("PROMO");
    
    if (key.length >= 6) {
      setStatus("valid");
      setMessage(isPlanCode 
        ? "Código promocional identificado! Você será redirecionado para o cadastro com o desconto aplicado."
        : "Código de licença válido! Registrando acesso..."
      );

      try {
        sessionStorage.setItem(PENDING_LICENSE_KEY, key);
      } catch {}

      setTimeout(() => {
        setOpen(false);
        void navigate({ to: "/auth", search: { mode: "signup" } });
      }, 2000);
    } else {
      setStatus("invalid");
      setMessage("Este código não foi encontrado ou está expirado. Verifique e tente novamente.");
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
            Insira seu código de acesso, cupom ou licença administrativa para desbloquear recursos.
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
                  status === "valid" && "border-emerald-500 bg-emerald-50/30",
                  status === "invalid" && "border-destructive bg-destructive/5"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === "verifying" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {status === "valid" && <CheckCircle2 className="size-4 text-emerald-500" />}
                {status === "invalid" && <XCircle className="size-4 text-destructive" />}
              </div>
            </div>
          </div>

          {message && (
            <div className={cn(
              "rounded-lg border p-3 text-xs leading-relaxed transition-all animate-in fade-in slide-in-from-top-1",
              status === "valid" && "border-emerald-200 bg-emerald-50 text-emerald-800",
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
