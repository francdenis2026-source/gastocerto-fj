import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "./appear";
import { motion } from "framer-motion";

export function SiteHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="shell relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Appear>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Novo: IA Financeira liberada</span>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-bold tracking-tight leading-[0.95] text-foreground">
              Seu dinheiro sob <br />
              <span className="text-primary italic">novo controle.</span>
            </h1>

            <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              O GastoCerto é a ferramenta definitiva para quem cansou de planilhas complexas e quer clareza absoluta sobre cada real.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora — Grátis
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-muted transition-colors" asChild>
                <button className="flex items-center gap-2">
                  <Play className="size-5 fill-current" />
                  Ver vídeo
                </button>
              </Button>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4">
              {["Sem cartões necessários", "Cancele a qualquer momento", "Suporte 24/7"].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
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
