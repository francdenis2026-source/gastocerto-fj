import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Panel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
        className,
      )}
    >
      <header className="flex flex-col gap-3 border-b border-border bg-muted/20 px-3 py-3 sm:px-4 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight text-foreground sm:text-[15px]">{title}</h2>
            {description ? (
              <p className="mt-0.5 max-w-prose text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="-mx-0.5 flex max-w-full items-center gap-2 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] md:justify-end md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden [&>*]:shrink-0">
            {actions}
          </div>
        ) : null}
      </header>
      <div className={cn("p-3 sm:p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
