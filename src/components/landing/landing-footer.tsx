import { Instagram, Linkedin, Lock, Mail, Youtube, CheckCircle2, Send, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
import { ContactModal } from "@/components/finance/contact-modal";
import { useState } from "react";

const links = [
  { label: "Recursos", to: "/recursos" as const },
  { label: "Planos", href: "#planos" },
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

// Tap target ≥44px via invisible overlay, keeps the footer visually short.
const tapTarget =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <footer className="mt-auto border-t border-border bg-secondary/20 dark:bg-black/40">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <div className="section-shell py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              A plataforma definitiva para organizar suas finanças com tecnologia de ponta e inteligência artificial.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-all hover:bg-brand hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Produto</h4>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  {"to" in link ? (
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <a href="#inicio" className="text-sm text-muted-foreground transition-colors hover:text-brand">Início</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Suporte</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  Contato
                </button>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-brand">Área do Cliente</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="section-shell flex items-center justify-between gap-x-3 py-2 text-[11px] text-foreground/70 sm:py-2.5 sm:text-[12.5px]">
          <p className="truncate">© {new Date().getFullYear()} GastoCerto.</p>
          <div className="flex shrink-0 items-center gap-1">
            <p className="truncate">Dev. Franc D&apos;nis · Acre</p>
            <Link
              to="/admin"
              aria-label="Acesso restrito da equipe"
              title="Acesso da equipe"
              className={`grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground ${tapTarget} ${focusRing}`}
            >
              <Lock className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
