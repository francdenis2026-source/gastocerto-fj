import { Link } from "@tanstack/react-router";
import { Coins, PiggyBank, Rocket, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";

import kidsHero from "@/assets/kids-login-hero.jpg";
import { Logo } from "@/components/logo";

const HIGHLIGHTS = [
  { icon: PiggyBank, title: "Meu cofrinho", text: "Veja quanto você já guardou." },
  { icon: Target, title: "Minhas metas", text: "Some moedas até o prêmio." },
  { icon: Coins, title: "Minha mesada", text: "Acompanhe entradas e gastos." },
];

/**
 * Tela dedicada ao login independente da criança: design ultra-compacto
 * para caber em uma única tela sem rolagem, com estética moderna e lúdica.
 */
export function KidsLoginScreen({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh w-full overflow-y-auto bg-[oklch(0.15_0.05_260)] font-sans flex items-center justify-center p-2 sm:p-4">
      {/* Background decorativo - mais imersivo e profundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,oklch(0.4_0.15_200/0.4),transparent_60%),radial-gradient(circle_at_80%_80%,oklch(0.45_0.18_160/0.3),transparent_50%)]"
      />
      
      {/* Container principal - Grid Split Screen para Desktop, Empilhado para Mobile, mas sempre fixo */}
      <div className="relative z-10 w-full max-w-5xl h-full lg:max-h-[850px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_32px_120px_-20px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Lado Esquerdo: Hero & Branding (Visível em Desktop, Compacto em Mobile) */}
        <section className="relative flex-1 bg-gradient-to-br from-emerald-600/20 to-blue-600/10 p-8 flex flex-col justify-between overflow-hidden">
          {/* Logo fixo no topo */}
          <div className="relative z-10">
            <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <Logo onDark />
            </Link>
          </div>

          {/* Conteúdo central lúdico */}
          <div className="relative z-10 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                <Sparkles className="size-3.5" /> Espaço Kids
              </div>
              <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl tracking-tight">
                Seu dinheiro,<br />
                <span className="text-emerald-400">seu mundo.</span>
              </h1>
              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                Entre agora e comece a construir seu futuro com diversão e inteligência.
              </p>
            </div>

            {/* Imagem Hero menor e com efeito flutuante */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full" />
              <img
                src={kidsHero}
                alt="Finanças para crianças"
                className="relative z-10 w-48 h-48 object-cover rounded-3xl border border-white/20 shadow-2xl animate-bounce-slow"
                style={{ animationDuration: '4s' }}
              />
            </div>
          </div>

          {/* Highlights compactos no rodapé da seção */}
          <div className="relative z-10 hidden lg:grid grid-cols-3 gap-3">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <item.icon className="size-4 text-emerald-400 mb-1" />
                <p className="text-[10px] font-bold text-white leading-tight">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lado Direito: Formulário de Login */}
        <section className="w-full lg:w-[420px] bg-card p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="space-y-8">
            <div className="text-center lg:text-left space-y-1">
              <p className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Rocket className="size-4" /> Acesso Seguro
              </p>
              <h2 className="text-xl font-bold text-foreground">Entrada da Criança</h2>
            </div>

            <div className="bg-secondary/20 p-6 rounded-[2rem] border border-border/50">
              {children}
            </div>

            <div className="text-center lg:text-left mt-2">
              <p className="text-[11px] font-bold text-primary bg-primary/10 py-2 px-3 rounded-lg border border-primary/20 leading-relaxed shadow-sm">
                Precisa de ajuda? Peça seu código para o seu responsável no painel principal.
              </p>
            </div>
          </div>

          {/* Assinatura discreta e bem posicionada */}
          <div className="mt-auto pt-8 flex justify-center lg:justify-start">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-primary/50 transition-colors cursor-default select-none border-t border-border/50 pt-3">
              &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
            </p>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow infinite ease-in-out;
        }
      `}} />
    </main>
  );
}
