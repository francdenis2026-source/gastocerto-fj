import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PENDING_LICENSE_KEY } from "@/components/landing/code-access-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Área de acesso por código exibida na própria tela de login/cadastro.
 * Guarda a chave e envia o visitante ao cadastro, onde ela é ativada.
 */
export function CodeAccessInline({ onContinue }: { onContinue?: () => void }) {
  const [code, setCode] = useState("");

  const submit = () => {
    const key = code.trim().toUpperCase();
    if (key.length < 6) {
      toast.error("Informe o código completo recebido por e-mail ou WhatsApp.");
      return;
    }
    try {
      sessionStorage.setItem(PENDING_LICENSE_KEY, key);
    } catch {
      /* armazenamento indisponível: o usuário poderá ativar em Meu perfil */
    }
    toast.success("Código registrado. Crie sua conta para ativar o período de teste.");
    setCode("");
    onContinue?.();
  };

  return (
    <section
      aria-labelledby="code-access-title"
      className="mt-2 rounded-xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur"
    >
      <h2
        id="code-access-title"
        className="flex items-center gap-2 text-[13px] font-semibold text-foreground"
      >
        <KeyRound className="size-4 text-primary" aria-hidden />
        Recebeu um código de teste?
      </h2>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        Informe a chave recebida para liberar seu período de teste.
      </p>

      <div className="mt-2 flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="inline-access-code" className="text-[13px]">
            Código de acesso
          </Label>
          <Input
            id="inline-access-code"
            value={code}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            placeholder="GC-XXXX-XXXX-XXXX"
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            className="mt-1 h-9 font-mono text-[12px] tracking-wide"
          />
        </div>
        <Button type="button" onClick={submit} className="h-9 shrink-0 px-3 text-xs">
          Validar
        </Button>
      </div>
    </section>
  );
}
