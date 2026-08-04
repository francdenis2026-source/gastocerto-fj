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
      
      <div className="section-shell py-4 sm:py-6">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-start lg:gap-16">
          {/* Brand & Socials - Ultra Compact */}
          <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
            <Logo className="scale-75 origin-center lg:origin-left" />
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground transition-colors hover:text-brand"
                  aria-label={social.label}
                >
                  <social.icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links - Single Row/Grid Mobile */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium sm:gap-x-10">
            {links.map((link) => (
              <li key={link.label} className="list-none">
                {"to" in link ? (
                  <Link to={link.to} className="text-muted-foreground transition-colors hover:text-brand">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="text-muted-foreground transition-colors hover:text-brand">
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            {legalLinks.map((link) => (
              <li key={link.label} className="list-none">
                <Link to={link.to} className="text-muted-foreground transition-colors hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="list-none">
              <button
                onClick={() => setContactOpen(true)}
                className="text-muted-foreground transition-colors hover:text-brand"
              >
                Contato
              </button>
            </li>
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
