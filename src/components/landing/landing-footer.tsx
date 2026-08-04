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
    <footer className="mt-20 border-t border-white/5 bg-background print:hidden py-16">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col items-start gap-4">
            <Logo className="scale-100" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Gestão financeira inteligente para quem busca clareza, 
              controle e resultados reais.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand">Produto</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/recursos" className="text-sm text-muted-foreground transition-colors hover:text-brand">Recursos</Link>
              <a href="#planos" className="text-sm text-muted-foreground transition-colors hover:text-brand">Planos</a>
              <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-brand">Área do Cliente</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand">Empresa</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/sobre" className="text-sm text-muted-foreground transition-colors hover:text-brand">Sobre nós</Link>
              <Link to="/contato" className="text-sm text-muted-foreground transition-colors hover:text-brand">Central de Ajuda</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand">Contato</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setContactOpen(true)}
                className="text-sm text-muted-foreground transition-colors hover:text-brand text-left"
              >
                Fale Conosco
              </button>
              <a href="mailto:contato@precocerto.shop" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
                <Mail className="size-4" />
                contato@precocerto.shop
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Minimal */}
      <div className="border-t border-border/20 bg-secondary/10 dark:bg-black/20">
        <div className="section-shell flex flex-col items-center justify-between gap-y-1 py-2 text-[9px] text-foreground/40 sm:flex-row sm:text-[10px]">
          <p>© {new Date().getFullYear()} GastoCerto.</p>
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
