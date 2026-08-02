import { useQuery } from "@tanstack/react-query";
import { 
  ClipboardList, 
  History, 
  UserCircle, 
  Calendar, 
  Tag, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Painel de Auditoria de Perfil
 * Mostra alterações em tempo real de campos sensíveis.
 */
export function ProfileAuditPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["profile-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_audit_logs")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Atualização em tempo real (polling)
  });

  if (isLoading) return <AuditSkeleton />;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserCircle className="size-5 text-primary" />
          <CardTitle className="text-lg">Auditoria de Perfil</CardTitle>
        </div>
        <CardDescription>
          Rastreamento de alterações em campos sensíveis (Nome, CPF, E-mail).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs?.length === 0 ? (
              <EmptyAudit message="Nenhuma alteração registrada recentemente." />
            ) : (
              logs?.map((log) => (
                <div key={log.id} className="relative pl-6 border-l-2 border-muted pb-4 last:pb-0">
                  <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-background border-2 border-primary" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground uppercase tracking-wider">
                        Campo: {translateFieldName(log.field_name)}
                      </span>
                      <span>
                        {format(new Date(log.changed_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="line-through text-muted-foreground/60">{log.old_value || "(vazio)"}</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span className="font-medium text-emerald-600">{log.new_value || "(vazio)"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Painel de Histórico de Resgates
 * Mostra o uso de códigos e cupons.
 */
export function RedemptionHistoryPanel() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["code-redemption-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_redemption_history")
        .select("*")
        .order("redeemed_at", { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <AuditSkeleton />;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <CardTitle className="text-lg">Histórico de Resgates</CardTitle>
        </div>
        <CardDescription>
          Registros de ativação de planos, cupons e licenças.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history?.length === 0 ? (
              <EmptyAudit message="Nenhum resgate de código registrado." />
            ) : (
              history?.map((entry) => (
                <div key={entry.id} className="rounded-lg border bg-secondary/20 p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-[13px] font-bold tracking-tight bg-background border px-1.5 py-0.5 rounded text-primary">
                        {entry.code}
                      </code>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {translateCodeType(entry.code_type)}
                      </Badge>
                    </div>
                    <Badge className={cn("text-[10px] uppercase", getStatusColor(entry.status))}>
                      {translateStatus(entry.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {format(new Date(entry.redeemed_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function translateFieldName(name: string) {
  const map: Record<string, string> = {
    full_name: "Nome Completo",
    cpf: "CPF",
    email: "E-mail de Contato",
  };
  return map[name] || name;
}

function translateCodeType(type: string) {
  const map: Record<string, string> = {
    plan: "Plano",
    coupon: "Cupom",
    license: "Licença",
  };
  return map[type] || type;
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    success: "Sucesso",
    already_used: "Já usado",
    invalid: "Inválido",
    blocked: "Bloqueado",
  };
  return map[status] || status;
}

function getStatusColor(status: string) {
  switch (status) {
    case "success": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "already_used": return "bg-amber-500/10 text-amber-600 border-amber-200";
    case "invalid": return "bg-destructive/10 text-destructive border-destructive/20";
    case "blocked": return "bg-destructive text-destructive-foreground";
    default: return "";
  }
}

function AuditSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-xl">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

function EmptyAudit({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <AlertCircle className="size-8 opacity-20 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
