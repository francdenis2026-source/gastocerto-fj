import { useState, type ReactNode, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, ListChecks, Sparkles, Loader2, AlertCircle } from "lucide-react";

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
  const isSecurity = feature.title.toLowerCase().includes("seguran") || feature.title.toLowerCase().includes("criptografia");
  const isIA = feature.title.toLowerCase().includes("ia") || feature.title.toLowerCase().includes("inteligência") || feature.title.toLowerCase().includes("relat");
  const accentColor = isSecurity ? "text-cyan-400" : isIA ? "text-purple-400" : "text-emerald-500";
  const accentBg = isSecurity ? "bg-cyan-400/10" : isIA ? "bg-purple-400/10" : "bg-emerald-500/10";
  const accentBorder = isSecurity ? "border-cyan-400/20" : isIA ? "border-purple-400/20" : "border-emerald-500/20";
  const accentShadow = isSecurity ? "shadow-cyan-400/20" : isIA ? "shadow-purple-400/20" : "shadow-emerald-500/20";
  const accentBtn = isSecurity ? "bg-cyan-400 hover:bg-cyan-300" : isIA ? "bg-purple-400 hover:bg-purple-300" : "bg-emerald-500 hover:bg-emerald-400";

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const detail = getFeatureDetail(feature);
  const current = sections[step];

  const items =
    current.id === "overview"
      ? detail.overview
      : current.id === "how"
        ? detail.howItWorks
        : detail.benefits;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [step]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 2;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.removeProperty('user-select');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <Dialog onOpenChange={(open) => !open && setStep(0)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn(
        "max-w-xl sm:p-8 p-6 gap-6 overflow-y-auto max-h-[92vh] glass-morphism border-white/10 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300",
        isSecurity ? "ring-1 ring-cyan-500/20" : isIA ? "ring-1 ring-purple-500/20" : "ring-1 ring-emerald-500/20"
      )}>
        <DialogHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {detail.tag ? (
              <span className={cn(
                "rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                accentColor, accentBg, accentBorder
              )}>
                {detail.tag}
              </span>
            ) : null}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Recurso {step + 1} de {sections.length} · {current.label}
            </span>
          </div>
          <DialogTitle className="text-left text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {detail.title}
          </DialogTitle>
          <DialogDescription className="text-left text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2">
            {detail.summary}
          </DialogDescription>
        </DialogHeader>

        <nav aria-label="Seções do recurso" className="flex flex-wrap gap-2">
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
                    ? cn("inline-flex h-9 items-center gap-2 rounded-xl px-5 text-[11px] font-bold text-black shadow-lg transition-all focus-visible:outline-none", accentBtn, accentShadow)
                    : "inline-flex h-9 items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-5 text-[11px] font-bold text-muted-foreground transition-all hover:bg-white/5 focus-visible:outline-none"

                }
              >
                <section.icon className="size-3.5" aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="grid gap-5 sm:grid-cols-[1fr_200px] sm:items-start relative min-h-[160px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] z-10 rounded-2xl animate-in fade-in duration-300">
              <Loader2 className="size-8 text-primary animate-spin mb-2" />
              <p className="text-[12px] font-bold tracking-wider text-muted-foreground uppercase">Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/5 backdrop-blur-[1px] z-10 rounded-2xl border border-destructive/20 animate-in zoom-in-95 duration-300">
              <AlertCircle className="size-8 text-destructive mb-2" />
              <p className="text-[13px] font-bold text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsLoading(true)}>Tentar novamente</Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div 
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  className="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing scrollbar-none pb-2"
                  style={{ touchAction: 'pan-y' }}
                >
                  <ul className="flex gap-4 panel-enter w-max sm:w-full sm:grid sm:grid-cols-1">
                    {items.map((item, index) => (
                      <li
                        key={item}
                        className="flex w-[260px] sm:w-full gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-4 text-[14px] font-medium leading-relaxed text-white transition-all hover:bg-white/[0.03] select-none"
                      >
                        <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-black", accentBg, accentColor)}>
                          {index + 1}
                        </span>
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <figure className="order-first overflow-hidden rounded-2xl border border-border shadow-sm sm:order-none sm:block">
                <img
                  src={detail.screenshot}
                  alt={detail.screenshotAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-36"
                />
                <figcaption className="border-t border-border bg-muted/30 px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">
                  Visualização Real
                </figcaption>
              </figure>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-white/10 px-5 text-xs font-bold"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-white/10 px-5 text-xs font-bold"
              onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}
              disabled={step === sections.length - 1}
            >
              Próximo
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className={cn("h-10 rounded-xl px-6 text-xs font-black text-black", accentBtn)}
            >
              <Link to="/auth" search={{ mode: "signup" }}>Experimentar Agora</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
