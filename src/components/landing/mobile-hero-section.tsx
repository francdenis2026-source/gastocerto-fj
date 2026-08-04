import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import heroMobileAlt from "@/assets/hero-mobile-pro-2027.jpg";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, ShieldCheck, Users } from "lucide-react";

type Variation = "glass" | "minimal" | "split";

export function MobileHeroSection() {
  const hydrated = useHydrated();
  const [variation, setVariation] = useState<Variation>("glass");

  if (!hydrated) return null;

  return (
    <section className="relative overflow-hidden px-4 py-8 md:hidden">
      {/* Variation Switcher - For comparison as requested */}
      <div className="mb-6 flex justify-center gap-2">
        {(["glass", "minimal", "split"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariation(v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[11px] font-bold transition-all",
              variation === v 
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/20" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className={cn(
        "relative flex flex-col overflow-hidden transition-all duration-700",
        variation === "glass" && "rounded-[2.5rem] border border-border/50 bg-card shadow-lifted p-1",
        variation === "minimal" && "rounded-3xl border border-border/30 bg-transparent p-0",
        variation === "split" && "rounded-[3rem] border-2 border-brand/10 bg-card/40 p-2"
      )}>
        
        {/* Dashboard Preview Layer (The "Real" Background) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Dashboard Screenshot Mockup - Representing the app interface */}
          <div className="absolute -right-12 -top-12 h-[140%] w-[120%] rotate-[-6deg] opacity-[0.15] blur-[1px]">
            <div className="h-full w-full rounded-[3rem] border-[8px] border-border/20 bg-card p-4 shadow-2xl">
              <div className="h-full w-full space-y-4 rounded-2xl bg-muted/30 p-4">
                <div className="h-8 w-1/2 rounded-lg bg-brand/20" />
                <div className="h-32 rounded-xl bg-card/80" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-xl bg-card/80" />
                  <div className="h-24 rounded-xl bg-card/80" />
                </div>
              </div>
            </div>
          </div>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-b transition-all duration-700",
            variation === "glass" && "from-card/40 via-card/80 to-card",
            variation === "minimal" && "from-background/20 via-background/90 to-background",
            variation === "split" && "from-brand/5 via-card/80 to-card"
          )} />
        </div>

        {/* Content Layer */}
        <div className={cn(
          "relative z-10 flex flex-col transition-all duration-700",
          variation === "glass" && "p-8 items-center text-center",
          variation === "minimal" && "p-6 items-start text-left",
          variation === "split" && "p-10 items-center text-center"
        )}>
          
          {/* Badge/Icon */}
          <div className={cn(
            "mb-6 flex items-center justify-center rounded-2xl transition-all duration-500",
            variation === "glass" && "size-14 bg-brand/10 text-brand shadow-inner",
            variation === "minimal" && "h-8 px-3 bg-brand text-brand-foreground text-[10px] font-black uppercase tracking-widest",
            variation === "split" && "size-16 bg-white/5 border border-white/10 text-brand backdrop-blur-xl"
          )}>
            {variation === "minimal" ? (
              "Novo GastoCerto"
            ) : (
              <TrendingUp className={cn(variation === "split" ? "size-7" : "size-6")} />
            )}
          </div>
          
          {/* Headline - Removed requested phrase, added alternatives */}
          <h2 className={cn(
            "font-display font-black tracking-tight text-foreground transition-all duration-700",
            variation === "glass" && "text-2xl leading-tight",
            variation === "minimal" && "text-3xl leading-none",
            variation === "split" && "text-2xl leading-tight"
          )}>
            {variation === "minimal" ? (
              <>Sua <span className="text-brand">prosperidade</span>, simplificada.</>
            ) : (
              <>Controle <span className="text-brand">total</span>, tranquilidade <span className="text-brand italic">sempre</span></>
            )}
          </h2>
          
          <p className={cn(
            "mt-5 font-medium leading-relaxed text-muted-foreground transition-all duration-700",
            variation === "glass" && "text-sm px-2",
            variation === "minimal" && "text-base max-w-[80%]",
            variation === "split" && "text-[13px] opacity-80"
          )}>
            {variation === "split" 
              ? "Acesse o poder de uma gestão profissional na palma da sua mão."
              : "Uma inteligência dedicada à sua tranquilidade diária e metas de longo prazo."}
          </p>
          
          {/* Feature Cards with Glassmorphism */}
          <div className={cn(
            "mt-8 grid w-full transition-all duration-700",
            variation === "glass" && "grid-cols-2 gap-4",
            variation === "minimal" && "grid-cols-1 gap-3",
            variation === "split" && "grid-cols-2 gap-2"
          )}>
            <div className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all active:scale-95">
              <ShieldCheck className="mb-2 size-5 text-brand" />
              <p className="text-lg font-black text-foreground">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Segurança</p>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all active:scale-95">
              <Users className="mb-2 size-5 text-brand" />
              <p className="text-lg font-black text-foreground">+24k</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Comunidade</p>
            </div>
          </div>

          {/* Enhanced CTA with Trust Badges */}
          <div className="mt-8 flex w-full flex-col gap-4">
            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-display font-black text-brand-foreground shadow-lg shadow-brand/20 transition-all active:scale-[0.96] hover:brightness-110">
              Começar agora gratuito
              <Sparkles className="size-4" />
            </button>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Privacidade protegida</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1 rounded-full bg-brand" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Sem cartão</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1 rounded-full bg-brand" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Cancelamento fácil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
