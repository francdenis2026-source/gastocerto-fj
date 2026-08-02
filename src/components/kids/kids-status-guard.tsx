import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkKidAccountStatus } from "@/lib/kids-license-check.functions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

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
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="size-4 !text-amber-600" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Atenção: Modo Consulta</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed">
              {status.message || "A conta do seu responsável está inativa. Novos lançamentos estão bloqueados."}
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
}
