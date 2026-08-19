import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

/** Cabeçalho consistente e responsivo das páginas internas. */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/90 bg-card p-4 shadow-soft sm:p-5 lg:p-6",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_70%)]" />

      <div className="relative grid gap-4 xl:grid-cols-[minmax(18rem,1fr)_auto] xl:items-center">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-4">
          {Icon ? (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:size-11">
              <Icon className="size-5" aria-hidden />
            </span>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-balance break-words font-display text-[clamp(1.15rem,4.6vw,1.6rem)] font-bold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <div className="mt-1.5 max-w-2xl text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </div>
            ) : null}
            {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
          </div>
        </div>

        {actions ? (
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 xl:justify-end [&>*]:shrink-0">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

const toneClass = {
  brand: "border-primary/25 bg-primary/10 text-primary",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

export type Tone = keyof typeof toneClass;

/** Chip informativo compacto usado nos cabeçalhos e filtros. */
export function MetaChip({
  icon: Icon,
  children,
  tone = "neutral",
}: {
  icon?: LucideIcon;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        toneClass[tone],
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
      <span className="break-words">{children}</span>
    </span>
  );
}
