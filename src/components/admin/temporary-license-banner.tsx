import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { usePlanAccess } from "@/lib/plan-features";

export function TemporaryLicenseBanner() {
  const access = usePlanAccess();
  
  // Só mostra se for teste de cortesia (sem IA e recursos avançados)
  if (!access.courtesyTrial || !access.trialActive) return null;

  return (
    <div className="sticky top-0 z-[60] bg-brand/5 border-b border-brand/20 px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Clock className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand leading-none">Acesso em Teste</span>
          <span className="text-[9px] font-bold text-muted-foreground mt-0.5">Expira em {access.trialDaysLeft} dias</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <p className="text-[10px] text-muted-foreground font-medium hidden md:block">
          Alguns recursos e edições de perfil estão restritos neste modo.
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-foreground text-[9px] font-black uppercase tracking-widest border border-border shadow-sm">
          <ShieldAlert className="size-3 text-brand" />
          Modo Restrito
        </div>
      </div>
    </div>
  );
}
