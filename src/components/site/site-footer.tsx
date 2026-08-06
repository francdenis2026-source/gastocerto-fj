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
    <footer className="bg-[#020617] text-slate-200 pt-32 pb-16 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="shell relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5">
            <Logo onDark className="h-9 w-auto mb-10" />
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md font-medium">
              Elevando a inteligência financeira através de tecnologia de ponta e design intuitivo. A sua liberdade começa com clareza.
            </p>
            <div className="flex gap-5">
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="size-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Plataforma</h4>
            <ul className="space-y-5">
              {["Recursos", "Segurança", "IA Advisor", "Preços"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-300 hover:text-primary transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Empresa</h4>
            <ul className="space-y-5">
              {["Manifesto", "Carreiras", "Newsroom", "Contato"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-300 hover:text-primary transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-xl font-bold mb-4 relative">Newsletter Pro</h4>
              <p className="text-slate-400 text-sm mb-8 relative font-medium leading-relaxed">
                Insights semanais sobre gestão e mercado direto na sua caixa.
              </p>
              <div className="flex gap-2 relative">
                <input 
                  type="email" 
                  placeholder="Seu e-mail"
                  className="bg-white/5 border border-white/10 rounded-xl px-5 h-12 flex-1 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <Button className="rounded-xl size-12 p-0 shrink-0 shadow-lg shadow-primary/20">
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 GastoCerto. Crafted for masters.
          </p>
          <div className="flex gap-10">
            {["Terms", "Privacy", "Cookies"].map(item => (
              <a key={item} href="#" className="text-slate-500 text-sm hover:text-white transition-colors font-medium">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
