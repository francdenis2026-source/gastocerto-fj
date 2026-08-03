import { Bell, Info, ShieldAlert, History } from "lucide-react";
import { useNotifications, useMarkNotifications, useDeleteNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function NotificationCenter({ isKid = false }: { isKid?: boolean }) {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotifications();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter(n => !n.read_at).length ?? 0;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="size-4 text-destructive" />;
      case 'warning': return <ShieldAlert className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative rounded-full", isKid ? "size-9" : "h-10 w-10")}>
          <Bell className={isKid ? "size-4" : "size-5"} />
          {unreadCount > 0 && (
            <Badge className={cn(
              "absolute justify-center rounded-full bg-destructive p-0 text-destructive-foreground ring-2 ring-background",
              isKid ? "-top-0.5 -right-0.5 h-4 w-4 text-[9px]" : "-top-1 -right-1 h-5 w-5 text-[10px]",
            )}>
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 shadow-lg", isKid ? "w-[16rem]" : "w-80")} align="end">
        <div className={cn("flex items-center justify-between border-b border-border", isKid ? "px-3 py-2" : "p-4")}>
          <h3 className={cn("flex items-center gap-1.5 font-bold", isKid ? "text-[12px]" : "text-sm")}>
            <Bell className={cn("text-primary", isKid ? "size-3.5" : "size-4")} /> Avisos
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider text-primary"
              onClick={() => markRead.mutate({ all: true })}
            >
              Lida(s)
            </Button>
          )}
        </div>
        <ScrollArea className={isKid ? "h-60" : "h-80"}>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <span className="text-[11px] text-muted-foreground">Carregando...</span>
            </div>
          ) : !notifications?.length ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center">
              <History className="size-8 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground">Você não tem avisos recentes.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50",
                    !n.read_at && "bg-primary/5"
                  )}
                  onClick={() => !n.read_at && markRead.mutate({ ids: [n.id] })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getIcon(n.severity || 'info')}
                      <span className="text-[12px] font-bold leading-tight">{n.title}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {!isKid && (
          <div className="border-t border-border p-2">
            <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-wider" asChild>
              <a href="/perfil">Ver tudo no perfil</a>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
