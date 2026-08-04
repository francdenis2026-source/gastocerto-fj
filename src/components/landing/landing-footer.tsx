import { Instagram, Linkedin, Lock, Mail, Youtube } from "lucide-react";
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

const socials = [
  { label: "Instagram", icon: Instagram, href: "#inicio" },
  { label: "LinkedIn", icon: Linkedin, href: "#inicio" },
  { label: "YouTube", icon: Youtube, href: "#inicio" },
  { label: "E-mail", icon: Mail, href: "mailto:contato@gastocerto.app" },
];

// Tap target ≥44px via invisible overlay
const tapTarget =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);
  
  return (
    <footer className="mt-auto border-t border-border bg-secondary/10 dark:bg-black/20 print:hidden">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      
      <div className="section-shell py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:items-start lg:gap-16">
          {/* Brand & Description */}
          <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <Logo className="scale-[0.85] origin-center lg:origin-left" />
            <p className="max-w-[28ch] text-[12px] leading-relaxed text-muted-foreground">
              Gestão inteligente de finanças com tecnologia de ponta e IA.
            </p>
            <div className="flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-7 items-center justify-center rounded-lg bg-secondary/40 text-muted-foreground transition-all hover:bg-brand hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links - Compact Grid */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3 lg:gap-x-16">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Produto</h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link to={link.to} className="text-[12px] text-muted-foreground transition-colors hover:text-brand">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-[12px] text-muted-foreground transition-colors hover:text-brand">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Legal</h4>
              <ul className="space-y-1.5">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[12px] text-muted-foreground transition-colors hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Suporte</h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="text-[12px] text-muted-foreground transition-colors hover:text-brand"
                  >
                    Contato
                  </button>
                </li>
                <li>
                  <Link to="/auth" className="text-[12px] text-muted-foreground transition-colors hover:text-brand">Privado</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40 bg-secondary/20 dark:bg-black/40">
        <div className="section-shell flex flex-col items-center justify-between gap-y-2 py-3 text-[10px] text-foreground/50 sm:flex-row sm:text-[11px]">
          <p>© {new Date().getFullYear()} GastoCerto.</p>
          <div className="flex shrink-0 items-center gap-1">
            <p>Dev. Franc D&apos;nis · Acre</p>
            <Link
              to="/admin"
              aria-label="Acesso restrito"
              className={`grid size-3.5 shrink-0 place-items-center text-muted-foreground/30 transition-colors hover:text-foreground ${tapTarget} ${focusRing}`}
            >
              <Lock className="size-2.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
