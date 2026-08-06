import { Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Zap, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      {/* Premium Background with Gradient & Lighting */}
      <div className="absolute inset-0 bg-background -z-20" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[70%] bg-primary/8 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      
      <div className="section-shell">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[13px] font-bold text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Inteligência Financeira Premium
            </div>
            
            <h1 className="text-[clamp(2.5rem,6vw,4.8rem)] font-black tracking-tight text-white leading-[1.05] mb-8">
              Controle absoluto <br />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">para sua liberdade</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-lg font-medium">
              GastoCerto transforma sua vida financeira com precisão absoluta, insights de IA e uma experiência visual extraordinária.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-12">
              <Button size="lg" className="rounded-full h-16 px-10 text-[18px] font-bold shadow-2xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Experiência <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-16 px-10 text-[18px] font-bold border-white/10 text-white hover:bg-white/5 transition-all" asChild>
                <Link to="/auth" search={{ mode: "login" }}>Ver Demonstração</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-8 border-t border-white/5 pt-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Shield className="size-5 text-primary/70" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Segurança</p>
                  <p className="text-sm font-bold text-white/80">Nível Bancário</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Zap className="size-5 text-primary/70" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Precisão</p>
                  <p className="text-sm font-bold text-white/80">Tempo Real</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Cinematic Mockups */}
          <div className="relative flex items-center justify-center pb-12 sm:pb-16 lg:pb-0">
            <Reveal delay={200} className="relative z-10 w-full">
              {/* Main Laptop Mockup */}
              <div className="relative w-full max-w-[800px] mx-auto group perspective-1000">
                <motion.div
                  initial={{ rotateY: 5, rotateX: 5, opacity: 0, y: 20 }}
                  whileInView={{ rotateY: 0, rotateX: 0, opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative rounded-2xl border border-white/10 bg-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                  {/* Laptop Screen Content - Realistic Dashboard UI */}
                  <div className="aspect-[16/10] bg-[#020617] p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex gap-1.5">
                        <div className="size-2 rounded-full bg-red-500/40" />
                        <div className="size-2 rounded-full bg-amber-500/40" />
                        <div className="size-2 rounded-full bg-green-500/40" />
                      </div>
                      <div className="flex gap-4">
                        <div className="h-4 w-20 bg-white/5 rounded-full" />
                        <div className="size-4 bg-white/5 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4 flex-1">
                      <div className="col-span-3 space-y-3">
                        <div className="h-8 w-full bg-primary/10 rounded-lg border border-primary/20" />
                        <div className="h-4 w-full bg-white/5 rounded-lg" />
                        <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                        <div className="mt-8 space-y-2">
                          <div className="h-3 w-full bg-white/5 rounded" />
                          <div className="h-3 w-full bg-white/5 rounded" />
                          <div className="h-3 w-1/2 bg-white/5 rounded" />
                        </div>
                      </div>
                      <div className="col-span-9 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-24 bg-white/5 border border-white/5 rounded-xl p-3">
                            <div className="h-2 w-1/2 bg-white/10 rounded mb-4" />
                            <div className="h-5 w-full bg-primary/20 rounded" />
                          </div>
                          <div className="h-24 bg-white/5 border border-white/5 rounded-xl p-3">
                            <div className="h-2 w-1/2 bg-white/10 rounded mb-4" />
                            <div className="h-5 w-full bg-white/10 rounded" />
                          </div>
                          <div className="h-24 bg-white/5 border border-white/5 rounded-xl p-3">
                            <div className="h-2 w-1/2 bg-white/10 rounded mb-4" />
                            <div className="h-5 w-full bg-white/10 rounded" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 relative overflow-hidden">
                          <div className="flex items-end gap-2 h-full">
                            {[40, 60, 45, 80, 55, 90, 65, 85, 40, 70, 50, 95].map((h, i) => (
                              <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                             <div className="h-2 w-12 bg-primary/30 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Gloss Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30" />
                </motion.div>

                {/* Smartphone Mockup */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                  className="hidden sm:block absolute -bottom-10 right-0 lg:-right-4 w-[160px] md:w-[200px] rounded-[2.5rem] border-[8px] border-[#1E293B] bg-[#020617] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden z-20"
                >
                  <div className="aspect-[9/19] p-4 flex flex-col gap-4">
                    <div className="h-5 w-16 bg-[#1E293B] rounded-full mx-auto mb-2" />
                    <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-[1.5rem] border border-primary/10 flex items-center justify-center">
                       <LayoutDashboard className="size-10 text-primary/40" />
                    </div>
                    <div className="space-y-3">
                       <div className="h-3 w-full bg-white/5 rounded" />
                       <div className="h-3 w-3/4 bg-white/5 rounded" />
                       <div className="h-10 w-full bg-primary rounded-xl shadow-lg shadow-primary/20 mt-4" />
                    </div>
                    <div className="mt-auto grid grid-cols-4 gap-2">
                       {[1,2,3,4].map(i => <div key={i} className="h-1 bg-white/5 rounded-full" />)}
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements Around */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden lg:block absolute top-10 -left-10 xl:-left-16 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-tighter">Economia</p>
                      <p className="text-sm font-bold text-white">Meta atingida!</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="hidden lg:block absolute bottom-20 -left-14 xl:-left-20 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap className="size-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Insights</p>
                      <p className="text-sm font-bold text-white">R$ 450,00 salvos</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
