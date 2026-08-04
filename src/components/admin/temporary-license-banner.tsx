import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { usePlanAccess } from "@/lib/plan-features";

export function TemporaryLicenseBanner() {
  const access = usePlanAccess();
  
  // Só mostra se for teste de cortesia (sem IA e recursos avançados)
  if (!access.courtesyTrial || !access.trialActive) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-wider">
        <Clock className="size-4" />
        Acesso Temporário Ativo
      </div>
      <div className="h-4 w-px bg-amber-500/20 hidden sm:block" />
      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium max-w-md text-center">
        Sua licença temporária está ativa. A IA e a edição de dados pessoais são exclusivas para planos pagos.
      </p>
      <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
        <ShieldAlert className="size-3" />
        RESTRITO
      </div>
    </div>
  );
}
