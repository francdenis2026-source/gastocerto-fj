import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";

export function LandingFooter() {
  return (
    <footer className="pt-20 pb-10 bg-[#090E0C] text-white overflow-hidden border-t border-white/5">
      <div className="section-shell">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mb-20">
          <div className="lg:col-span-5 space-y-8">
            <Logo onDark />
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              GastoCerto é a síntese da tecnologia aplicada à gestão financeira pessoal. Controle, clareza e prosperidade.
            </p>
            <div className="flex items-center gap-6">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary">Produto</h4>
              <ul className="space-y-4 text-[15px] font-medium text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary">Empresa</h4>
              <ul className="space-y-4 text-[15px] font-medium text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
              </ul>
            </div>
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary">Suporte</h4>
              <ul className="space-y-4 text-[15px] font-medium text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm font-medium">
            © 2026 GastoCerto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Sistema Online</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Precisão Absoluta</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
