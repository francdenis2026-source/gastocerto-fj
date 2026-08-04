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
        
        {/* Background Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 bg-fixed",
              variation === "glass" ? "opacity-30" : "opacity-20"
            )}
            style={{ backgroundImage: `url(${heroMobileAlt})` }}
          />
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
            variation === "glass" && "text-3xl leading-[1.1]",
            variation === "minimal" && "text-4xl leading-none",
            variation === "split" && "text-3xl leading-tight"
          )}>
            {variation === "minimal" ? (
              <>Sua <span className="text-brand">prosperidade</span>, agora simplificada.</>
            ) : (
              <>Organize sua vida <br /><span className="text-brand italic">financeira hoje</span></>
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
            "mt-10 grid w-full transition-all duration-700",
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

          {/* New CTA for Split variation */}
          {variation === "split" && (
            <div className="mt-8 flex w-full flex-col gap-2">
              <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand font-display font-black text-brand-foreground shadow-lg shadow-brand/20">
                Começar agora
                <Sparkles className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
