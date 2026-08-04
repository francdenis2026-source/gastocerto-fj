import { Lock } from "lucide-react";
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
    <footer className="mt-12 border-t border-border bg-background dark:bg-black/20 print:hidden">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      
      <div className="section-shell py-3 sm:py-5">
        <div className="flex flex-col items-center justify-between gap-3 lg:flex-row lg:items-center lg:gap-16">
          {/* Brand & Socials - Ultra Compact */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Logo className="scale-[0.7] origin-center" />
            <div className="flex gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-medium text-brand transition-all hover:bg-brand hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-3" />
                  <span>Fale Conosco</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links - Single Row Ultra Compact */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-medium sm:gap-x-6 sm:text-[11px]">
            {links.map((link) => (
              <li key={link.label} className="list-none">
                {"to" in link ? (
                  <Link to={link.to} className="text-muted-foreground/80 transition-colors hover:text-brand">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="text-muted-foreground/80 transition-colors hover:text-brand">
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            {legalLinks.map((link) => (
              <li key={link.label} className="list-none">
                <Link to={link.to} className="text-muted-foreground/80 transition-colors hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="list-none">
              <button
                onClick={() => setContactOpen(true)}
                className="text-muted-foreground/80 transition-colors hover:text-brand"
              >
                Contato
              </button>
            </li>
          </nav>
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
