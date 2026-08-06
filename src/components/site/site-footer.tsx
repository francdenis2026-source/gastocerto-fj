import { 
  ArrowRight, 
  Users2, 
  Smartphone, 
  Globe2, 
  Mail, 
  Instagram, 
  Twitter 
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background pt-24 pb-12">
      <div className="shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4">
            <Logo onDark className="h-10 w-auto mb-8" />
            <p className="text-background/60 text-lg leading-relaxed mb-8 max-w-sm">
              Redefinindo a relação das pessoas com o dinheiro através de tecnologia, simplicidade e transparência.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="size-10 rounded-xl bg-background/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6">Produto</h4>
            <ul className="space-y-4">
              {["Funcionalidades", "Método", "Segurança", "Preços"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/50 hover:text-background transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6">Empresa</h4>
            <ul className="space-y-4">
              {["Sobre nós", "Carreiras", "Blog", "Contato"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/50 hover:text-background transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="p-8 rounded-[2rem] bg-background/5 border border-background/10">
              <h4 className="text-xl font-bold mb-4">Newsletter Pro</h4>
              <p className="text-background/50 text-sm mb-6">
                Receba dicas exclusivas de economia e as novidades do GastoCerto toda semana.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Seu e-mail"
                  className="bg-background/5 border border-background/10 rounded-xl px-4 flex-1 text-sm focus:outline-none focus:border-primary/50"
                />
                <Button className="rounded-xl size-10 p-0 shrink-0">
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-background/40 text-sm">
            © 2026 GastoCerto. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-background/40 text-sm hover:text-background transition-colors">Termos de Uso</a>
            <a href="#" className="text-background/40 text-sm hover:text-background transition-colors">Privacidade</a>
            <a href="#" className="text-background/40 text-sm hover:text-background transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
