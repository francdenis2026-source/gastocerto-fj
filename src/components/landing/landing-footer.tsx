import { Lock, Mail, MessageSquare, Twitter, Github, Linkedin, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
import { ContactModal } from "@/components/finance/contact-modal";
import { useState } from "react";

type FooterLink = 
  | { label: string; to: any }
  | { label: string; href: string }
  | { label: string; action: 'contact' };

const footerLinks: { title: string; links: FooterLink[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", to: "/recursos" as const },
      { label: "Planos", href: "#planos" },
      { label: "Demonstração", to: "/demonstracao" as const },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/sobre" as const },
      { label: "Contato", action: "contact" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Área do Cliente", to: "/auth" as const },
      { label: "Suporte", action: "contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos", to: "/termos" as const },
      { label: "Privacidade", to: "/privacidade" as const },
    ],
  },
];

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);
  
  return (
    <footer className="border-t border-border bg-card section-padding pt-24 pb-12 print:hidden">
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-6">
            <Logo className="scale-110 origin-left" />
            <p className="text-base leading-relaxed text-muted-foreground max-w-xs">
              A nova geração da gestão financeira familiar. Elegante, inteligente e segura.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all">
                <Linkedin className="size-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all">
                <Github className="size-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col gap-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link to={link.to} className="text-base text-muted-foreground hover:text-primary transition-all flex items-center gap-1 group">
                        {link.label}
                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    ) : 'href' in link ? (
                      <a href={link.href} className="text-base text-muted-foreground hover:text-primary transition-all">
                        {link.label}
                      </a>
                    ) : (
                      <button 
                        onClick={() => link.action === 'contact' && setContactOpen(true)}
                        className="text-base text-muted-foreground hover:text-primary transition-all"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-8 border-t border-border flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GastoCerto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-sm font-medium text-muted-foreground">
              Desenvolvido por <span className="text-foreground">Franc D&apos;nis</span>
            </p>
            <Link
              to="/admin"
              className="p-2 rounded-lg bg-secondary text-muted-foreground/40 hover:text-foreground transition-all"
            >
              <Lock className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
