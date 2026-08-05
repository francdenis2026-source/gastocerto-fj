import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";

const footerLinks = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#recursos" },
      { label: "Planos", href: "#planos" },
      { label: "Espaço Kids", href: "/kids" },
      { label: "IA Financeira", href: "/ia" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contato", href: "#contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "#" },
      { label: "Termos", href: "#" },
      { label: "Segurança", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-10 overflow-hidden">
      <div className="section-shell">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Logo className="h-10 w-auto mb-6" />
            <p className="text-secondary-foreground text-sm leading-relaxed max-w-xs mb-8 font-medium">
              Transformando a relação das pessoas com o dinheiro através de tecnologia, inteligência e design de elite.
            </p>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="sr-only">Instagram</span>
                <div className="size-5 bg-foreground/20 rounded-sm" />
              </div>
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="sr-only">LinkedIn</span>
                <div className="size-5 bg-foreground/20 rounded-sm" />
              </div>
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-sm font-semibold text-secondary-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-secondary-foreground">
            © {new Date().getFullYear()} GastoCerto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Sistema Operacional
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
