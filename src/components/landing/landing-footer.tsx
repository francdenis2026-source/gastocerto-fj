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
    <footer className="mt-auto border-t border-border bg-secondary/10 dark:bg-black/20 print:hidden">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <div className="section-shell py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Logo className="scale-90 origin-left" />
            <p className="mt-3 max-w-xs text-[13px] text-muted-foreground leading-relaxed">
              A plataforma definitiva para organizar suas finanças com tecnologia de ponta e inteligência artificial.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-8 items-center justify-center rounded-lg bg-secondary/40 text-muted-foreground transition-all hover:bg-brand hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Produto</h4>
            <ul className="mt-3 space-y-1.5">
              {links.map((link) => (
                <li key={link.label}>
                  {"to" in link ? (
                    <Link
                      to={link.to}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <a href="#inicio" className="text-[13px] text-muted-foreground transition-colors hover:text-brand">Início</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Legal</h4>
            <ul className="mt-3 space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Suporte</h4>
            <ul className="mt-3 space-y-1.5">
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-[13px] text-muted-foreground transition-colors hover:text-brand"
                >
                  Contato
                </button>
              </li>
              <li>
                <Link to="/auth" className="text-[13px] text-muted-foreground transition-colors hover:text-brand">Área do Cliente</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 bg-secondary/20 dark:bg-black/40">
        <div className="section-shell flex flex-col items-center justify-between gap-y-3 py-3 text-[10.5px] text-foreground/60 sm:flex-row sm:py-4 sm:text-[11.5px]">
          <p>© {new Date().getFullYear()} GastoCerto.</p>
          <div className="flex shrink-0 items-center gap-1">
            <p>Dev. Franc D&apos;nis · Acre</p>
            <Link
              to="/admin"
              aria-label="Acesso restrito da equipe"
              title="Acesso da equipe"
              className={`grid size-3.5 shrink-0 place-items-center text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:text-foreground ${tapTarget} ${focusRing}`}
            >
              <Lock className="size-2.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
