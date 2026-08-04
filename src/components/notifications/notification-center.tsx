import { Bell, Info, ShieldAlert, History, Trash2 } from "lucide-react";
import { useNotifications, useMarkNotifications, useDeleteNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";

function NotificationItem({ n, onMarkRead, onDelete }: { n: any, onMarkRead: () => void, onDelete: () => void }) {
  const x = useMotionValue(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="size-4 text-destructive" />;
      case 'warning': return <ShieldAlert className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-primary" />;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -60) {
      setIsDeleting(true);
      // Inicia o processo de "desfazer"
      setTimeout(() => {
        setShowUndo(true);
        // Timer de 5 segundos para confirmação final
        undoTimerRef.current = setTimeout(() => {
          onDelete();
        }, 5000);
      }, 200);
    }
  };

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    setIsDeleting(false);
    x.set(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!n.read_at) onMarkRead();
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDelete();
    }
  };

  if (showUndo) {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-between p-3 bg-muted/30 border-b border-border"
      >
        <span className="text-[10px] text-muted-foreground font-medium">Aviso removido.</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-3 text-[10px] font-bold text-primary hover:bg-primary/10"
          onClick={handleUndo}
        >
          DESFAZER
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden group">
      <div 
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-destructive text-destructive-foreground"
        style={{ opacity: x.get() < 0 ? Math.abs(x.get()) / 100 : 0 }}
      >
        <Trash2 className="size-5" />
      </div>

      <motion.div 
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={isDeleting ? { x: -400, opacity: 0 } : { x: 0, opacity: 1 }}
        className={cn(
          "relative z-10 flex flex-col gap-1 p-4 bg-background transition-colors hover:bg-muted/50 border-b border-border cursor-pointer focus-visible:outline-none focus-visible:bg-muted/50 focus-visible:ring-1 focus-visible:ring-brand/30",
          !n.read_at && "bg-primary/5"
        )}
        onClick={() => !n.read_at && onMarkRead()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${n.title}. ${n.message}. ${!n.read_at ? "Não lido" : "Lido"}. Arraste para a esquerda para excluir.`}
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
      </motion.div>
    </div>
  );
}

export function NotificationCenter({ isKid = false }: { isKid?: boolean }) {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotifications();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter(n => !n.read_at).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `Avisos (${unreadCount} não lidos)` : "Avisos"}
          className={cn(
            "relative shrink-0 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isKid ? "size-9" : "size-8 sm:size-9",
          )}
        >
          <Bell className={cn("shrink-0", isKid ? "size-5" : "size-4.5")} aria-hidden="true" />

          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-[4px] text-[10px] font-black leading-none text-destructive-foreground ring-2 ring-background animate-in zoom-in-50 duration-200"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("p-0 shadow-lg overflow-hidden", isKid ? "w-[16rem]" : "w-80")} align="end">
        <div className={cn("flex items-center justify-between border-b border-border", isKid ? "px-3 py-2" : "p-4 bg-background")}>
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
              <span className="text-[11px] text-muted-foreground animate-pulse">Carregando...</span>
            </div>
          ) : !notifications?.length ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center">
              <History className="size-8 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground">Você não tem avisos recentes.</p>
            </div>
          ) : (
            <div className="flex flex-col bg-background">
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <NotificationItem 
                    key={n.id} 
                    n={n} 
                    onMarkRead={() => markRead.mutate({ ids: [n.id] })}
                    onDelete={() => deleteNotification.mutate(n.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
        {!isKid && (
          <div className="border-t border-border p-2 bg-background">
            <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-wider" asChild>
              <a href="/perfil">Ver tudo no perfil</a>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}