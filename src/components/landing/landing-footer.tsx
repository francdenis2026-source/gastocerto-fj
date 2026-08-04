
import { Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/logo";

const footerLinks = {
  produto: [
    { label: "Recursos", href: "#recursos" },
    { label: "IA Financeira", href: "#ia" },
    { label: "Segurança", href: "#seguranca" },
    { label: "Planos", href: "#planos" },
  ],
  empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#" },
  ],
  legal: [
    { label: "Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-background pt-16 pb-10 border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo className="mb-6" />
            <p className="text-muted-foreground font-medium leading-relaxed max-w-xs mb-8">
              Dominando a jornada financeira através da inteligência e design de alto nível.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                SSL Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" />
                AES-256
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Produto</h4>
            <ul className="space-y-4">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Empresa</h4>
            <ul className="space-y-4">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Newsletter IA</h4>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
              <button className="absolute right-2 top-1.5 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed italic">
              * Receba insights exclusivos gerados por nossa IA.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            © 2026 GastoCerto · Mastery of Finances
          </p>
          
          <div className="flex items-center gap-6">
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Dev. Franc D'nis · Feijó, AC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
