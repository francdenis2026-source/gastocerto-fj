import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { usePlanAccess } from "@/lib/plan-features";

export function TemporaryLicenseBanner() {
  const access = usePlanAccess();
  
  // Só mostra se for teste de cortesia (sem IA e recursos avançados)
  if (!access.courtesyTrial || !access.trialActive) return null;

  return (
    <div className="bg-amber-500/5 border-b border-amber-500/20 px-3 py-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-widest">
        <Clock className="size-3.5" />
        Expira em: {access.trialDaysLeft} dias
      </div>
      <div className="h-3 w-px bg-amber-500/20 hidden sm:block" />
      <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-semibold max-w-md text-center">
        Plano de Teste: IA bloqueada e edição de dados restrita ao administrador.
      </p>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] font-black border border-amber-500/20">
        <ShieldAlert className="size-3" />
        RESTRITO
      </div>
    </div>
  );
}
