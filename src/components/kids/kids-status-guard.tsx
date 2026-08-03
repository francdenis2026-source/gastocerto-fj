import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkKidAccountStatus } from "@/lib/kids-license-check.functions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function KidsStatusGuard({ kidUserId, children }: { kidUserId: string; children: React.ReactNode }) {
  const checkStatus = useServerFn(checkKidAccountStatus);
  const [status, setStatus] = useState<{ active: boolean; readOnly?: boolean; message?: string } | null>(null);

  useEffect(() => {
    checkStatus({ data: { kidUserId } }).then(setStatus);
  }, [kidUserId]);

  if (!status) return <>{children}</>;

  return (
    <>
      {status.readOnly && (
        <div className="px-4 pt-4">
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 shadow-sm">
            <ShieldAlert className="size-4 !text-amber-600" />
            <div className="flex-1">
              <AlertTitle className="text-xs font-bold uppercase tracking-wider">Atenção: Modo Consulta Ativado</AlertTitle>
              <AlertDescription className="mt-1 text-[11px] leading-relaxed">
                {status.message || "A conta do seu responsável está com o plano expirado ou bloqueada."}
                <div className="mt-2">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Novos lançamentos estão bloqueados até a regularização.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-2 h-7 gap-1.5 text-[10px] bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100">
                    <Link to="/auth" search={{ mode: 'login' }}>
                      Falar com responsável <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
}

