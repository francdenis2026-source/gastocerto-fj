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
      className="mt-2.5 rounded-xl border border-border bg-card/80 p-2.5 shadow-sm backdrop-blur"
    >
      <h2
        id="code-access-title"
        className="flex items-center gap-1.5 text-[11.5px] font-semibold text-foreground"
      >
        <KeyRound className="size-3.5 shrink-0 text-primary" aria-hidden />
        Recebeu um código de teste?
      </h2>

      <div className="mt-1.5 flex items-center gap-2">
        <Input
          id="inline-access-code"
          aria-label="Código de acesso"
          value={code}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          placeholder="GC-XXXX-XXXX-XXXX"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          className="h-8 min-w-0 flex-1 font-mono text-[12px] tracking-wide"
        />
        <Button type="button" onClick={submit} className="h-8 shrink-0 px-3 text-xs">
          Validar
        </Button>
      </div>
    </section>
  );
}

