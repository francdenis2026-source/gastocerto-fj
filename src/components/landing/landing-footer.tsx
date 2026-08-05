import { Lock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
import { ContactModal } from "@/components/finance/contact-modal";
import { useState } from "react";

const links = [
  { label: "Recursos", to: "/recursos" as const },
  { label: "Planos", href: "#planos" },
  { label: "Área do Cliente", to: "/auth" as const },
];

const legalLinks = [
  { label: "Termos de uso", to: "/termos" as const },
  { label: "Privacidade", to: "/privacidade" as const },
];

const socials: { label: string; icon: any; href: string }[] = [];

// Tap target ≥44px via invisible overlay
const tapTarget =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);
  
  return (
    <footer className="border-t border-white/5 bg-[#001640] py-8">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      
      <div className="section-shell">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <Logo compact className="scale-90" />
          
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link to="/termos" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">Termos</Link>
            <Link to="/privacidade" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">Privacidade</Link>
            <button 
              onClick={() => setContactOpen(true)}
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
            >
              Contato
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <a href="mailto:contato@precocerto.shop" className="size-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-emerald-500 transition-colors">
              <Mail className="size-4" />
            </a>
          </div>
        </div>
      </div>
      {/* Bottom Bar - Minimal */}
      <div className="border-t border-border/20 bg-[#001640]/80">
        <div className="section-shell flex flex-col items-center justify-between gap-y-1 py-2 text-[9px] text-foreground/40 sm:flex-row sm:text-[10px]">
          <p>© {new Date().getFullYear()} Meu Controle Financeiro.</p>
          <div className="flex shrink-0 items-center gap-1">
            <p className="opacity-70">Dev. Franc D&apos;nis</p>
            <Link
              to="/admin"
              className={`grid size-3 shrink-0 place-items-center text-muted-foreground/20 transition-colors hover:text-foreground ${tapTarget} ${focusRing}`}
            >
              <Lock className="size-2" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
