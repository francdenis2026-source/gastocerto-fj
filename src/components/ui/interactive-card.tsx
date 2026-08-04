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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showAllItems, setShowAllItems] = React.useState(false);

  const hasItems = items && items.length > 0 && renderItem;
  const visibleItems = showAllItems ? items : items.slice(0, maxVisibleItems);
  const canExpandItems = items.length > maxVisibleItems;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    if (onClick) onClick();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {icon && <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>}
            <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 rounded-full hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
        {description && <CardDescription className="text-[10px] leading-tight">{description}</CardDescription>}
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {chart && (
          <div className="h-32 w-full rounded-xl bg-muted/30 p-2 flex items-center justify-center border border-border/20">
            {chart}
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
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
                    <div className="space-y-1">
                      {visibleItems.map((item, idx) => (
                        <div key={idx} className="group/item transition-all hover:translate-x-1">
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
    </Card>
  );
}
