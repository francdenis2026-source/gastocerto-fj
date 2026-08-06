import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format-utils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Search, 
  Calendar,
  Filter,
  AlertOctagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClearHistoryButton } from "@/components/finance/clear-history-button";


export function ProfileAuditPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchLogs = async () => {
    let query = supabase
      .from("profile_audit_logs")
      .select("*")
      .order("changed_at", { ascending: false });

    if (searchTerm) {
      query = query.or(`old_value.ilike.%${searchTerm}%,new_value.ilike.%${searchTerm}%`);
    }

    if (fieldFilter !== "all") {
      query = query.eq("field_name", fieldFilter);
    }

    if (dateFilter) {
      query = query.gte("changed_at", new Date(dateFilter).toISOString());
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    
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
  }, [searchTerm, fieldFilter, dateFilter]);

  // Detecção de anomalias: muitas alterações no mesmo campo em curto período
  const suspiciousActivity = logs.filter(log => {
    const window = 60000; // 1 minuto
    const sameFieldRecent = logs.filter(l => 
      l.field_name === log.field_name && 
      l.id !== log.id &&
      Math.abs(new Date(l.changed_at).getTime() - new Date(log.changed_at).getTime()) < window
    );
    return sameFieldRecent.length >= 3;
  });

  return (
    <div className="rounded-xl border bg-card shadow-sm h-full flex flex-col overflow-hidden max-h-[400px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <h3 className="font-display font-semibold">Auditoria de perfil</h3>
        </div>
        <div className="flex items-center gap-2">
          {suspiciousActivity.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertOctagon className="size-3 mr-1" />
              Atividade suspeita
            </Badge>
          )}
          <ClearHistoryButton
            table="profile_audit_logs"
            label="a auditoria de perfil"
            onCleared={fetchLogs}
          />
        </div>
      </div>


      <div className="p-3 border-b bg-muted/20 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por valor (nome, cpf...)" 
            className="pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Campo</Label>
            <select 
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-[10px] focus:ring-1 focus:ring-brand outline-none"
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="full_name">Nome</option>
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Desde</Label>
            <Input 
              type="date" 
              className="h-8 text-[10px] px-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[250px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs italic">
            Nenhuma alteração registrada com os filtros atuais.
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const isSuspicious = suspiciousActivity.some(s => s.id === log.id);
              return (
                <div key={log.id} className={cn(
                  "p-3 text-xs transition-colors hover:bg-muted/50",
                  isSuspicious && "bg-destructive/5"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-primary">{log.field_name.toUpperCase()}</span>
                      {isSuspicious && <AlertOctagon className="size-3 text-destructive" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDateTime(log.changed_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <div className="flex-1 min-w-[100px] rounded bg-muted/50 p-1.5 border border-border/30">
                      <span className="block text-[8px] uppercase font-bold text-muted-foreground mb-0.5">De</span>
                      <span className="truncate block leading-tight">{log.old_value || "—"}</span>
                    </div>
                    <div className="flex-1 min-w-[100px] rounded bg-emerald-500/5 p-1.5 border border-emerald-500/20">
                      <span className="block text-[8px] uppercase font-bold text-emerald-600 mb-0.5">Para</span>
                      <span className="truncate block font-medium leading-tight text-emerald-700 dark:text-emerald-400">{log.new_value || "—"}</span>
                    </div>
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

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  success: { label: "Sucesso", color: "bg-emerald-500", icon: CheckCircle },
  invalid: { label: "Inválido", color: "bg-destructive", icon: AlertTriangle },
  blocked: { label: "Bloqueado", color: "bg-orange-500", icon: Shield },
  already_used: { label: "Já Usado", color: "bg-blue-500", icon: User },
};

export function RedemptionHistoryPanel() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHistory = async () => {
    let query = supabase
      .from("code_redemption_history")
      .select("*")
      .order("redeemed_at", { ascending: false });

    if (searchTerm) {
      query = query.ilike("code", `%${searchTerm}%`);
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query.limit(50);

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
  }, [searchTerm, statusFilter]);

  // Alerta de força bruta: muitas tentativas inválidas/bloqueadas no mesmo código ou IP
  const suspiciousAttempts = history.filter(item => {
    const window = 300000; // 5 minutos
    const recentFailures = history.filter(h => 
      h.status !== "success" && 
      (h.code === item.code) &&
      h.id !== item.id &&
      Math.abs(new Date(h.redeemed_at).getTime() - new Date(item.redeemed_at).getTime()) < window
    );
    return recentFailures.length >= 5;
  });

  return (
    <div className="rounded-xl border bg-card shadow-sm h-full flex flex-col overflow-hidden max-h-[400px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <Key className="size-4 text-primary" />
          <h3 className="font-display font-semibold">Histórico de resgates</h3>
        </div>
        <div className="flex items-center gap-2">
          {suspiciousAttempts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="size-3 mr-1" />
              Padrão suspeito
            </Badge>
          )}
          <ClearHistoryButton
            table="code_redemption_history"
            label="o histórico de resgates"
            onCleared={fetchHistory}
          />
        </div>
      </div>


      <div className="p-3 border-b bg-muted/20 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por código..." 
            className="pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Status</Label>
          <select 
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-[10px] focus:ring-1 focus:ring-brand outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="success">Sucesso</option>
            <option value="invalid">Inválido</option>
            <option value="blocked">Bloqueado</option>
            <option value="already_used">Já Usado</option>
          </select>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[250px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs italic">
            Nenhum resgate encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="divide-y">
            {history.map((item) => {
              const status = STATUS_MAP[item.status] || { label: item.status, color: "bg-muted", icon: Key };
              const StatusIcon = status.icon;
              const isSuspicious = suspiciousAttempts.some(s => s.id === item.id);
              
              return (
                <div key={item.id} className={cn(
                  "p-3 text-xs transition-colors hover:bg-muted/50",
                  isSuspicious && "bg-destructive/5"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono font-bold text-primary">{item.code}</code>
                      {isSuspicious && <AlertTriangle className="size-3 text-destructive" />}
                    </div>
                    <Badge className={cn("text-[9px] h-4", status.color)} variant="default">
                      <StatusIcon className="size-2 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/80 mt-0.5">
                    <span className="font-medium tracking-wider">{item.code_type.toUpperCase()}</span>
                    <span className="flex items-center gap-1 opacity-70">
                      <Clock className="size-2.5" />
                      {formatDateTime(item.redeemed_at)}
                    </span>
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
