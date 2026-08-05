import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AiFinanceIcon,
  KidsSpaceIcon,
  MultiAccountIcon,
} from "@/components/landing/hero-feature-icons";
import { Logo } from "@/components/logo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";



 export function Hero() {
   return (
     <section
       id="inicio"
       className="relative isolate overflow-hidden pt-32 pb-16 lg:pt-48 lg:pb-32"
     >
       <div className="section-shell relative z-10">
         <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
           {/* Text Content */}
           <Reveal className="flex flex-col items-start space-y-8">
             <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
               <Sparkles className="size-3" />
               O futuro das finanças chegou
             </div>
             
             <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
               Controle sua vida financeira com <span className="text-primary">simplicidade</span> e inteligência.
             </h1>
 
             <p className="max-w-xl text-lg font-medium leading-relaxed text-secondary-foreground">
               A plataforma definitiva para organizar gastos, planejar o futuro e tomar decisões inteligentes. Tudo o que você precisa em um só lugar.
             </p>
 
             <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
               <Button
                 size="lg"
                 className="h-14 rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95"
                 asChild
               >
                 <Link to="/auth" search={{ mode: "signup" }}>
                   Criar Conta Grátis
                   <ArrowRight className="ml-2 size-5" />
                 </Link>
               </Button>
 
               <Button
                 variant="ghost"
                 size="lg"
                 className="h-14 rounded-full px-10 text-base font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
                 asChild
               >
                 <Link to="/auth" search={{ mode: "login" }}>
                   Entrar no Painel
                 </Link>
               </Button>
             </div>
 
             <div className="flex items-center gap-6 pt-4">
               <div className="flex -space-x-3">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="size-10 rounded-full border-2 border-background bg-secondary" />
                 ))}
               </div>
               <div className="text-sm font-medium text-secondary-foreground">
                 <span className="font-bold text-foreground">50k+</span> usuários confiam no GastoCerto
               </div>
             </div>
           </Reveal>
 
           {/* Visual Mockup */}
           <Reveal className="relative lg:block" style={{ transitionDelay: '200ms' }}>
             <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[400px]">
               {/* Phone Frame */}
               <div className="relative aspect-[9/19] rounded-[3rem] border-[8px] border-border bg-card shadow-2xl overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-border rounded-b-2xl z-20" />
                 
                 {/* App Interface Mockup */}
                 <div className="absolute inset-0 bg-background p-6 pt-10">
                   <div className="flex items-center justify-between mb-8">
                     <div className="size-10 rounded-xl bg-secondary animate-pulse" />
                     <div className="size-10 rounded-full bg-secondary animate-pulse" />
                   </div>
                   
                   <div className="h-40 rounded-3xl bg-secondary mb-6 animate-pulse" />
                   
                   <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border">
                         <div className="size-10 rounded-xl bg-secondary animate-pulse" />
                         <div className="flex-1 space-y-2">
                           <div className="h-3 w-2/3 bg-secondary rounded animate-pulse" />
                           <div className="h-2 w-1/2 bg-secondary rounded animate-pulse opacity-50" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
 
               {/* Decorative Elements */}
               <div className="absolute -right-8 top-1/4 size-40 rounded-full bg-primary/20 blur-[60px] -z-10" />
               <div className="absolute -left-8 bottom-1/4 size-48 rounded-full bg-blue-500/10 blur-[80px] -z-10" />
             </div>
           </Reveal>
         </div>
       </div>
     </section>
   );
 }

import { Reveal } from "@/components/landing/reveal";

// Removed local Reveal definition to use the shared one that supports tabIndex and other props
