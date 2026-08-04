import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useDragControls } from "framer-motion";

interface InteractiveCardProps {
  id: string; // Obrigatório para persistência de estado

  title: string;
  description?: string;
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  children?: React.ReactNode;
  footerInfo?: React.ReactNode;
  maxVisibleItems?: number;
  items?: any[];
  renderItem?: (item: any, index: number) => React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function InteractiveCard({
  id,
  title,
  description,
  icon,
  chart,
  children,
  footerInfo,
  maxVisibleItems = 3,
  items = [],
  renderItem,
  className,
  onClick
}: InteractiveCardProps) {
  // Persistência de estado via LocalStorage
  const storageKey = `card-state-${id}`;
  const [isExpanded, setIsExpanded] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "true";
  });
  const [showAllItems, setShowAllItems] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  const hasItems = items && items.length > 0 && renderItem;
  const visibleItems = showAllItems ? items : items.slice(0, maxVisibleItems);
  const canExpandItems = items.length > maxVisibleItems;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    if (onClick) onClick();
  };

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg border-border/40 bg-card/40 backdrop-blur-md cursor-pointer focus-within:ring-2 focus-within:ring-brand/50 outline-none focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-labelledby={`card-title-${id}`}
      aria-describedby={description ? `card-desc-${id}` : undefined}
      aria-expanded={isExpanded}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {icon && <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>}
            <CardTitle id={`card-title-${id}`} className="text-sm font-bold tracking-tight">{title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 rounded-full hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
            aria-controls={`card-content-${id}`}
            aria-label={isExpanded ? `Recolher ${title}` : `Expandir ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </Button>
        </div>
        {description && <CardDescription id={`card-desc-${id}`} className="text-[10px] leading-tight">{description}</CardDescription>}
      </CardHeader>

      {/* Swipe Gestures para Mobile usando Framer Motion */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 50 && isExpanded) setIsExpanded(false);
          else if (info.offset.y < -50 && !isExpanded) setIsExpanded(true);
        }}
        className="touch-none"
      >
        <CardContent className="p-4 pt-0 space-y-4">
          {chart && (
            <div 
              className="h-32 w-full rounded-2xl bg-muted/20 p-3 flex items-center justify-center border border-border/10 shadow-inner"
              role="img"
              aria-label="Gráfico de dados"
            >
              {chart}
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id={`card-content-${id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-4">
                  {children}
                  
                  {hasItems && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registros</h4>
                        {canExpandItems && (
                          <Button 
                            variant="link" 
                            className="h-auto p-0 text-[10px] font-bold text-primary hover:no-underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAllItems(!showAllItems);
                            }}
                          >
                            {showAllItems ? "Ver menos" : `Ver todos (${items.length})`}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1" role="list">
                        {visibleItems.map((item, idx) => (
                          <div key={idx} className="group/item transition-all hover:translate-x-1" role="listitem">
                            {renderItem(item, idx)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {footerInfo && (
            <div className="pt-2 border-t border-border/20">
              {footerInfo}
            </div>
          )}
        </CardContent>
      </motion.div>
    </Card>
  );
}
