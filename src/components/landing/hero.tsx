import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, LayoutDashboard, Smartphone, CreditCard, PieChart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden md:pt-48 md:pb-24">
      {/* Background Cinematic Lighting */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[60%] bg-primary/5 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[50%] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="section-shell">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[13px] font-bold text-primary mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Inteligência Financeira Premium
            </div>
            
            <h1 className="text-4xl md:text-[4.5rem] font-extrabold tracking-tight text-foreground leading-[1.05] mb-8">
              A maestria da sua <br />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">economia pessoal</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-secondary-foreground leading-relaxed mb-10 max-w-lg font-medium opacity-90">
              GastoCerto redefine o controle financeiro com uma interface sofisticada, insights preditivos e segurança de nível bancário.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-16">
              <Button size="lg" className="rounded-full h-14 px-10 text-[17px] font-bold shadow-2xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Experiência <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full h-14 px-10 text-[17px] font-bold border border-border/50 hover:bg-secondary/80 transition-all" asChild>
                <Link to="/auth" search={{ mode: "login" }}>Ver Demonstração</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 border-t border-border/40 pt-10">
              {[
                { icon: Shield, label: "Segurança", desc: "Criptografado" },
                { icon: Zap, label: "Agilidade", desc: "Tempo Real" },
                { icon: LayoutDashboard, label: "Gestão", desc: "Multicontas" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <item.icon className="size-5 text-primary/70" />
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest">{item.label}</p>
                    <p className="text-[13px] text-secondary-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="relative">
            <Reveal delay={200} className="relative z-10">
              {/* Realistic Mockup Stack */}
              <div className="relative group">
                {/* Laptop: Main Focus */}
                <div className="relative rounded-2xl border border-white/10 bg-[#0A0F14] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 hover:shadow-primary/5">
                  <div className="aspect-[16/10] bg-[#0F151B] p-5 flex flex-col gap-5">
                    {/* Fake Header */}
                    <div className="flex items-center justify-between opacity-40">
                      <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-500/40" />
                        <div className="size-2.5 rounded-full bg-amber-500/40" />
                        <div className="size-2.5 rounded-full bg-green-500/40" />
                      </div>
                      <div className="h-5 w-24 bg-secondary/20 rounded-full" />
                    </div>
                    
                    {/* Fake Dashboard Layout */}
                    <div className="grid grid-cols-12 gap-5 flex-1">
                      <div className="col-span-3 space-y-4 opacity-30">
                        <div className="h-8 w-full bg-secondary/20 rounded-lg" />
                        <div className="h-4 w-full bg-secondary/10 rounded-lg" />
                        <div className="h-4 w-full bg-secondary/10 rounded-lg" />
                        <div className="h-4 w-full bg-secondary/10 rounded-lg" />
                      </div>
                      <div className="col-span-9 space-y-5">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-primary/10 border border-primary/20 rounded-xl" />
                          <div className="h-24 bg-secondary/5 border border-white/5 rounded-xl" />
                          <div className="h-24 bg-secondary/5 border border-white/5 rounded-xl" />
                        </div>
                        <div className="flex-1 bg-secondary/5 border border-white/5 rounded-2xl p-4">
                          <div className="flex items-end gap-2 h-full">
                            {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                              <div key={i} className="flex-1 bg-primary/20 rounded-t-md" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glass Glossy Overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50" />
                </div>

                {/* iPhone: Secondary Focus */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-10 -right-6 md:-right-12 w-[180px] md:w-[240px] rounded-[3rem] border-[8px] border-[#1A1F26] bg-[#0A0F14] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden z-20"
                >
                  <div className="aspect-[9/19.5] bg-[#0A0F14] p-5 flex flex-col gap-6">
                    <div className="h-5 w-16 bg-[#1A1F26] rounded-full mx-auto mb-2" />
                    
                    <div className="space-y-6">
                      <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-center relative overflow-hidden">
                        <PieChart className="size-16 text-primary/30" />
                        <div className="absolute bottom-4 left-4 right-4 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_10px_rgba(31,174,109,0.5)]" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="h-4 w-full bg-white/5 rounded-lg" />
                        <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
                        <div className="h-12 w-full bg-primary rounded-2xl shadow-lg shadow-primary/20" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Micro-data Cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 -left-12 p-4 rounded-2xl border border-white/10 bg-[#121821]/90 backdrop-blur-2xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Insights</p>
                      <p className="text-sm font-bold text-white">Meta atingida!</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-32 -left-16 p-4 rounded-2xl border border-white/10 bg-[#121821]/90 backdrop-blur-2xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Cartão</p>
                      <p className="text-sm font-bold text-white">Fatura fechada</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
