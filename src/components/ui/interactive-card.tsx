import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface InteractiveCardProps {
  id: string;
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
  onClick,
}: InteractiveCardProps) {
  const storageKey = `card-state-${id}`;
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "true";
  });
  const [showAllItems, setShowAllItems] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  const hasItems = items.length > 0 && Boolean(renderItem);
  const visibleItems = showAllItems ? items : items.slice(0, maxVisibleItems);
  const canExpandItems = items.length > maxVisibleItems;

  const handleCardClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select")) return;
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card shadow-soft transition-[border-color,box-shadow]",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-labelledby={`card-title-${id}`}
      aria-describedby={description ? `card-desc-${id}` : undefined}
    >
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon ? (
              <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                {icon}
              </div>
            ) : null}
            <CardTitle id={`card-title-${id}`} className="min-w-0 text-sm font-bold leading-snug tracking-tight">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-xl"
            aria-expanded={isExpanded}
            aria-controls={`card-content-${id}`}
            aria-label={isExpanded ? `Recolher ${title}` : `Expandir ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((value) => !value);
            }}
          >
            {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </Button>
        </div>
        {description ? (
          <CardDescription id={`card-desc-${id}`} className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
        {chart ? (
          <div
            className="flex h-32 w-full items-center justify-center rounded-2xl border border-border bg-muted/30 p-3"
            role="img"
            aria-label={`Gráfico: ${title}`}
          >
            {chart}
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              id={`card-content-${id}`}
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                {children}

                {hasItems ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Registros</h4>
                      {canExpandItems ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2.5 text-xs text-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setShowAllItems((value) => !value);
                          }}
                        >
                          {showAllItems ? "Ver menos" : `Ver todos (${items.length})`}
                        </Button>
                      ) : null}
                    </div>
                    <div className="space-y-1.5" role="list">
                      {visibleItems.map((item, index) => (
                        <div key={index} role="listitem">
                          {renderItem?.(item, index)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {footerInfo ? <div className="border-t border-border pt-3">{footerInfo}</div> : null}
      </CardContent>
    </Card>
  );
}
