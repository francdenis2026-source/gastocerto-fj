import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Clock, User, CheckCircle, AlertTriangle, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAuditPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("profile_audit_logs")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    
    // Inscrição em tempo real
    const channel = supabase
      .channel("profile_audits")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profile_audit_logs" },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border bg-card shadow-sm h-full">
      <div className="flex items-center gap-2 border-b p-4">
        <Shield className="size-4 text-primary" />
        <h3 className="font-display font-semibold">Auditoria de Perfil</h3>
      </div>
      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhuma alteração registrada.</div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="p-3 text-xs transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-primary">{log.field_name.toUpperCase()}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDateTime(log.changed_at)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="rounded bg-muted/50 p-1">
                    <span className="block text-[9px] uppercase text-muted-foreground">Anterior</span>
                    <span className="truncate block">{log.old_value || "—"}</span>
                  </div>
                  <div className="rounded bg-emerald-500/10 p-1">
                    <span className="block text-[9px] uppercase text-emerald-600">Novo</span>
                    <span className="truncate block font-medium">{log.new_value || "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  success: { label: "Sucesso", color: "bg-emerald-500", icon: CheckCircle },
  invalid: { label: "Inválido", color: "bg-destructive", icon: AlertTriangle },
  blocked: { label: "Bloqueado", color: "bg-orange-500", icon: Shield },
  already_used: { label: "Já Usado", color: "bg-blue-500", icon: User },
};

export function RedemptionHistoryPanel() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("code_redemption_history")
      .select("*")
      .order("redeemed_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    
    const channel = supabase
      .channel("redemption_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "code_redemption_history" },
        () => fetchHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border bg-card shadow-sm h-full">
      <div className="flex items-center gap-2 border-b p-4">
        <Key className="size-4 text-primary" />
        <h3 className="font-display font-semibold">Histórico de Resgates</h3>
      </div>
      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum resgate registrado.</div>
        ) : (
          <div className="divide-y">
            {history.map((item) => {
              const status = STATUS_MAP[item.status] || { label: item.status, color: "bg-muted", icon: Key };
              const StatusIcon = status.icon;
              return (
                <div key={item.id} className="p-3 text-xs transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <code className="font-mono font-bold text-primary">{item.code}</code>
                    <Badge className={cn("text-[9px] h-4", status.color)} variant="default">
                      <StatusIcon className="size-2 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{item.code_type.toUpperCase()}</span>
                    <span>{formatDateTime(item.redeemed_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
