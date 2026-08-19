import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  title?: string;
  description?: string;
  activeCount?: number;
  onClear?: () => void;
  children: ReactNode;
  className?: string;
  collapsibleOnMobile?: boolean;
};

export function FilterPanel({
  title = "Filtros",
  description,
  activeCount = 0,
  onClear,
  children,
  className,
  collapsibleOnMobile = true,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const contentId = `filter-panel-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
        className,
      )}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/35 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold leading-tight">{title}</p>
              {activeCount > 0 ? (
                <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary tabular-nums">
                  {activeCount} ativo{activeCount > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-0.5 max-w-prose text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onClear && activeCount > 0 ? (
            <Button variant="ghost" size="sm" className="min-h-9 px-2.5 text-xs" onClick={onClear}>
              <X className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Limpar</span>
              <span className="sm:hidden sr-only">Limpar filtros</span>
            </Button>
          ) : null}
          {collapsibleOnMobile ? (
            <Button
              variant="outline"
              size="sm"
              className="min-h-9 px-2.5 text-xs sm:hidden"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Fechar" : "Abrir"}
              <ChevronDown
                className={cn("size-3.5 transition-transform", open && "rotate-180")}
                aria-hidden="true"
              />
            </Button>
          ) : null}
        </div>
      </div>

      <div
        id={contentId}
        className={cn(
          "grid gap-3 p-3 sm:p-4 auto-cards-sm",
          collapsibleOnMobile && !open && "hidden sm:grid",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function FilterField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
