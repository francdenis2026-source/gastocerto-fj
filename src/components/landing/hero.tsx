import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, LayoutDashboard, Smartphone, CreditCard, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden md:pt-44 md:pb-32">
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="section-shell">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-8 animate-in fade-in slide-in-from-bottom-4">
              <Sparkles className="size-3" />
              Sua vida financeira elevada ao próximo nível
            </div>
            <h1 className="text-5xl md:text-[5rem] font-extrabold tracking-tighter text-foreground leading-[1.05] mb-8">
              Controle absoluto com <span className="text-primary italic">precisão premium</span>.
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground leading-relaxed mb-10 max-w-xl">
              GastoCerto é a plataforma definitiva para quem busca organização financeira impecável, insights inteligentes e uma experiência de usuário sem precedentes em qualquer dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Agora <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-border bg-card/50 backdrop-blur-sm" asChild>
                <Link to="/auth" search={{ mode: "login" }}>Acessar Demo</Link>
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-6 border-t border-border pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-secondary-foreground">
                Junte-se a <span className="text-foreground font-bold">12.000+</span> usuários organizados.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} className="relative group">
            {/* Cinematic Mockup Container */}
            <div className="relative z-10 perspective-[2000px]">
              {/* Laptop Frame */}
              <div className="relative rounded-[2rem] border border-border bg-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden transition-transform duration-700 group-hover:rotate-y-[-5deg] group-hover:rotate-x-[2deg]">
                <div className="bg-secondary/40 aspect-[16/10] p-4 flex flex-col gap-4">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex gap-2">
                      <div className="size-3 rounded-full bg-red-500/20" />
                      <div className="size-3 rounded-full bg-amber-500/20" />
                      <div className="size-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="h-6 w-32 bg-secondary rounded-full" />
                  </div>
                  {/* Mock Dashboard Content */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-4">
                      <div className="h-32 bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col justify-end">
                        <div className="h-2 w-1/2 bg-primary/20 rounded mb-2" />
                        <div className="h-4 w-3/4 bg-primary/30 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-card border border-border rounded-2xl" />
                        <div className="h-24 bg-card border border-border rounded-2xl" />
                      </div>
                    </div>
                    <div className="h-full bg-card border border-border rounded-2xl p-4">
                      <div className="size-12 rounded-full bg-secondary mb-4 mx-auto" />
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-secondary rounded" />
                        <div className="h-2 w-2/3 bg-secondary rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mobile Frame */}
              <div className="absolute -bottom-10 -right-6 md:-right-12 w-[160px] md:w-[220px] rounded-[2.5rem] border-[6px] border-border bg-card shadow-2xl overflow-hidden transition-transform duration-700 group-hover:translate-y-[-20px] group-hover:rotate-y-[10deg]">
                <div className="aspect-[9/19] bg-background p-4 flex flex-col gap-4">
                  <div className="h-4 w-12 bg-secondary rounded-full mx-auto mb-2" />
                  <div className="h-32 w-full bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Smartphone className="size-10 text-primary/40" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-secondary rounded" />
                    <div className="h-3 w-full bg-secondary rounded" />
                    <div className="h-3 w-3/4 bg-secondary rounded" />
                  </div>
                  <div className="mt-auto h-12 w-full bg-primary rounded-xl" />
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-10 -left-8 md:-left-16 p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl transition-transform duration-700 group-hover:translate-x-[-10px] group-hover:translate-y-[-10px]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <PieChart className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-secondary-foreground uppercase">Economia</p>
                    <p className="text-sm font-black text-foreground">+ R$ 1.250,00</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -left-12 p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl transition-transform duration-700 group-hover:translate-x-[-10px] group-hover:translate-y-[10px]">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-secondary-foreground uppercase">Limite</p>
                    <p className="text-sm font-black text-foreground">75% Disponível</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow effects */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 transition-opacity duration-700 opacity-20 group-hover:opacity-40" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
