import { Link } from "@tanstack/react-router";
import { Coins, PiggyBank, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";

import kidsHero from "@/assets/kids-login-hero.jpg";
import { Logo } from "@/components/logo";

const HIGHLIGHTS = [
  { icon: PiggyBank, title: "Meu cofrinho" },
  { icon: Target, title: "Minhas metas" },
  { icon: Coins, title: "Minha mesada" },
];

/**
 * Tela de login da criança: card único que sempre cabe em uma janela.
 * Nenhuma rolagem da página — apenas o formulário rola internamente.
 */
export function KidsLoginScreen({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate grid h-dvh max-h-dvh w-full place-items-center overflow-hidden bg-[oklch(0.15_0.05_260)] p-3 font-sans sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,oklch(0.45_0.15_200/0.38),transparent_58%),radial-gradient(circle_at_82%_85%,oklch(0.5_0.18_160/0.3),transparent_52%)]"
      />

      <div className="grid max-h-full w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid-cols-[1fr_minmax(0,22rem)]">
        {/* Lado esquerdo: identidade compacta (desktop) */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600/25 to-blue-600/10 p-7 lg:flex">
          <Link to="/" className="w-fit">
            <Logo onDark />
          </Link>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
              <Sparkles className="size-3" /> Espaço Kids
            </span>
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-black leading-tight tracking-tight text-white">
                  Seu dinheiro,
                  <br />
                  <span className="text-emerald-400">seu mundo.</span>
                </h1>
                <p className="mt-2 text-[12px] leading-relaxed text-white/70">
                  Entre com seu código e comece a cuidar do que é seu.
                </p>
              </div>
              <img
                src={kidsHero}
                alt="Finanças para crianças"
                className="size-24 shrink-0 rounded-2xl border border-white/20 object-cover shadow-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-2">
                <item.icon className="mb-1 size-3.5 text-emerald-400" />
                <p className="text-[10px] font-bold leading-tight text-white">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lado direito: formulário */}
        <section className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 flex-col overflow-y-auto bg-card px-5 py-5 sm:px-6">
          <div className="mb-4 flex justify-center lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          {children}

          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-[10px] font-semibold leading-snug text-primary">
            Precisa de ajuda? Peça seu código ao seu responsável.
          </p>

          <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50">
            &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
          </p>
        </section>
      </div>
    </main>
  );
}
