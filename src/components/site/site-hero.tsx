import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "./appear";
import { motion } from "framer-motion";

export function SiteHero() {
  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="shell relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <Appear>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/20 mb-10 backdrop-blur-sm hover:bg-primary/10 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">IA Financeira Ativada</span>
            </div>

            <h1 className="font-display text-[clamp(2.75rem,9vw,6rem)] font-bold tracking-tight leading-[0.9] text-foreground mb-8">
              A maestria do seu <br />
              <span className="relative inline-block">
                dinheiro.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-90 mb-12">
              GastoCerto transcende a gestão básica. É clareza absoluta, inteligência estratégica e o fim da incerteza financeira.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold shadow-[0_20px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.35)] hover:-translate-y-1 transition-all duration-300" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold group hover:bg-primary/5 transition-all" asChild>
                <button className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="size-4 fill-foreground translate-l-0.5" />
                  </div>
                  Ver demonstração
                </button>
              </Button>
            </div>

            <div className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6">
              {["Mastery Tools", "Bank Grade Security", "Expert Support"].map((text) => (
                <div key={text} className="flex items-center gap-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                  <div className="size-1.5 rounded-full bg-primary" />
                  {text}
                </div>
              ))}
            </div>
          </Appear>
        </div>

        {/* Dynamic Mockup Area */}
        <Appear delay={200} className="mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-3xl border-8 border-foreground/5 bg-background shadow-2xl overflow-hidden aspect-[16/9] relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                 {/* Visual placeholder for the real dashboard mockup */}
                 <div className="w-full h-full bg-muted/30 p-8">
                    <div className="grid grid-cols-12 gap-6 h-full">
                       <div className="col-span-3 space-y-4">
                          <div className="h-12 w-full bg-foreground/5 rounded-xl" />
                          <div className="h-40 w-full bg-primary/10 rounded-xl" />
                          <div className="h-32 w-full bg-foreground/5 rounded-xl" />
                       </div>
                       <div className="col-span-9 space-y-6">
                          <div className="flex justify-between items-center">
                             <div className="h-10 w-48 bg-foreground/5 rounded-xl" />
                             <div className="flex gap-2">
                                <div className="h-10 w-10 bg-foreground/5 rounded-full" />
                                <div className="h-10 w-10 bg-foreground/5 rounded-full" />
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                             <div className="h-28 bg-foreground/5 rounded-2xl" />
                             <div className="h-28 bg-primary/5 border border-primary/20 rounded-2xl" />
                             <div className="h-28 bg-foreground/5 rounded-2xl" />
                          </div>
                          <div className="h-64 bg-foreground/5 rounded-2xl w-full" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Floating element */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 hidden lg:block p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-border max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ArrowRight className="size-4 -rotate-45" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Economia</p>
                  <p className="text-sm font-bold text-foreground">+R$ 1.240</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary" />
              </div>
            </motion.div>
          </div>
        </Appear>
      </div>
    </section>
  );
}
