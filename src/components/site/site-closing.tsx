import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "./appear";

export function SiteClosing() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="shell relative z-10">
        <div className="bg-foreground rounded-[3rem] p-12 md:p-24 text-center text-background relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -top-24 -left-24 size-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 size-64 bg-primary/30 rounded-full blur-[100px]" />
          
          <Appear className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-8 text-primary">
              <Sparkles size={24} className="animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest">O futuro é agora</span>
            </div>
            
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[0.95]">
              Pronto para ter <br />
              <span className="text-primary italic">paz financeira?</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-background/60 mb-12 leading-relaxed">
              Junte-se a milhares de pessoas que já transformaram sua relação com o dinheiro usando o GastoCerto.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-2xl shadow-primary/40 hover:scale-105 transition-transform" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Agora Grátis
                  <ArrowRight className="ml-2 size-6" />
                </Link>
              </Button>
              <div className="text-background/40 font-medium">
                Mais de 10.000 usuários ativos mensalmente.
              </div>
            </div>
          </Appear>
        </div>
      </div>
    </section>
  );
}
