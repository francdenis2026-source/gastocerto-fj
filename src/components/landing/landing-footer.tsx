import { Lock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
import { ContactModal } from "@/components/finance/contact-modal";
import { useState } from "react";

// Tap target ≥44px via invisible overlay
const tapTarget =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

 const navClass =
   "text-sm font-medium text-secondary-foreground hover:text-primary transition-all duration-300";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
     <footer className="relative py-16 overflow-hidden bg-background border-t border-border">
       <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-50" />
       </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />

      <div className="section-shell relative z-10 px-6">
         <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
           <div className="flex flex-col items-center gap-6 lg:items-start">
             <Logo compact className="scale-125" />
             <p className="text-center text-lg text-secondary-foreground font-medium max-w-sm lg:text-left">
               A plataforma definitiva para quem busca controle absoluto e tranquilidade financeira.
             </p>
           </div>

           <div className="flex flex-col items-center gap-10 lg:items-end">
             <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-8">
               <a href="#recursos" className={navClass}>Recursos</a>
               <a href="#planos" className={navClass}>Planos</a>
               <Link to="/termos" className={navClass}>Termos</Link>
               <Link to="/privacidade" className={navClass}>Privacidade</Link>
               <button onClick={() => setContactOpen(true)} className={navClass}>Contato</button>
             </nav>
 
             <div className="flex items-center gap-4">
               <a
                 href="mailto:contato@gastocerto.shop"
                 className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-foreground transition-all hover:bg-secondary active:scale-95"
               >
                 <Mail className="size-4 text-primary" />
                 <span className="text-sm font-semibold">Suporte Premium</span>
               </a>
             </div>
           </div>
        </div>
      </div>

       <div className="relative z-10 mt-16 border-t border-border bg-card/50">
         <div className="section-shell flex flex-col items-center justify-between gap-y-6 py-10 text-sm font-medium text-secondary-foreground sm:flex-row">
           <div className="flex items-center gap-2">
             <p>© {new Date().getFullYear()} GASTOCERTO. Todos os direitos reservados.</p>
           </div>
 
           <div className="flex flex-wrap items-center justify-center gap-8">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
               <span className="size-1.5 rounded-full bg-primary animate-pulse" />
               <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Sistema Ativo</p>
             </div>
 
             <div className="flex items-center gap-4">
               <p className="text-xs">
                 Desenvolvido por <span className="font-bold text-foreground">Franc D&apos;nis</span>
               </p>
               <Link
                 to="/admin"
                 aria-label="Área administrativa"
                 className="flex items-center justify-center rounded-lg size-8 bg-background border border-border hover:bg-secondary transition-all"
               >
                 <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
               </Link>
             </div>
           </div>
         </div>
       </div>
    </footer>
  );
}
