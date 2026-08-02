import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BookOpen, ListChecks, Sparkles } from "lucide-react";

import { getFeatureDetail } from "@/lib/feature-details";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sections = [
  { id: "overview", label: "Visão geral", icon: BookOpen },
  { id: "how", label: "Como funciona", icon: ListChecks },
  { id: "benefits", label: "Benefícios", icon: Sparkles },
] as const;

type Props = {
  feature: { title: string; text: string; tag?: string };
  children: ReactNode;
};

/**
 * Modal detalhado de recurso: navegação por seções (visão geral, como funciona,
 * benefícios), screenshot ilustrativa e ações sugeridas.
 */
export function FeatureDetailDialog({ feature, children }: Props) {
  const [step, setStep] = useState(0);
  const detail = getFeatureDetail(feature);
  const current = sections[step];

  const items =
    current.id === "overview"
      ? detail.overview
      : current.id === "how"
        ? detail.howItWorks
        : detail.benefits;

  return (
    <Dialog onOpenChange={(open) => !open && setStep(0)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            {detail.tag ? (
              <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                {detail.tag}
              </span>
            ) : null}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recurso {step + 1} de {sections.length} · {current.label}
            </span>
          </div>
          <DialogTitle className="text-left text-lg font-bold">{detail.title}</DialogTitle>
          <DialogDescription className="text-left text-[13px] leading-relaxed">
            {detail.summary}
          </DialogDescription>
        </DialogHeader>

        <nav aria-label="Seções do recurso" className="flex flex-wrap gap-1.5">
          {sections.map((section, index) => {
            const active = index === step;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setStep(index)}
                aria-current={active ? "step" : undefined}
                className={
                  active
                    ? "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    : "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                }
              >
                <section.icon className="size-3.5" aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <ul className="grid gap-2 panel-enter">
            {items.map((item, index) => (
              <li
                key={item}
                className="flex gap-2 rounded-xl border border-border bg-card/70 p-2.5 text-[13px] leading-relaxed"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
          <figure className="order-first overflow-hidden rounded-xl border border-border sm:order-none">
            <img
              src={detail.screenshot}
              alt={detail.screenshotAlt}
              loading="lazy"
              decoding="async"
              className="h-28 w-full object-cover sm:h-32"
            />
            <figcaption className="border-t border-border bg-secondary/50 px-2 py-1 text-[10px] text-muted-foreground">
              Prévia da tela do recurso
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}
              disabled={step === sections.length - 1}
            >
              Avançar
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.actions.map((action, index) => (
              <Button
                key={action.label}
                asChild
                size="sm"
                variant={index === 0 ? "default" : "secondary"}
              >
                <a href={action.to}>{action.label}</a>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
