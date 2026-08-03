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
    <main className="relative isolate grid min-h-dvh w-full place-items-center overflow-x-hidden bg-[oklch(0.15_0.05_260)] p-3 font-sans sm:p-4 lg:h-dvh lg:max-h-dvh lg:min-h-0 lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,oklch(0.45_0.15_200/0.38),transparent_58%),radial-gradient(circle_at_82%_85%,oklch(0.5_0.18_160/0.3),transparent_52%)]"
      />

      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_90px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:h-full lg:max-h-[85dvh] lg:min-h-[420px] lg:grid-cols-[1.1fr_minmax(0,19rem)]">
        {/* Lado esquerdo: identidade visual Kids */}
        <section className="relative hidden flex-col justify-between overflow-hidden lg:flex">
          <img
            src={kidsHero}
            alt=""
            className="absolute inset-0 -z-10 size-full object-cover brightness-[0.92] saturate-[1.05] transition-transform duration-700 group-hover:scale-105"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-600/40 via-transparent to-blue-600/30"
          />

          <div className="p-5">
            <Link to="/" className="w-fit">
              <Logo onDark />
            </Link>
          </div>

          <div className="p-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
              <Sparkles className="size-3" /> Espaço Kids
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Seu dinheiro,
                <br />
                <span className="text-emerald-400">seu mundo.</span>
              </h1>
              <p className="mt-2 text-[11px] sm:text-[12px] lg:text-[13px] leading-relaxed text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-semibold">
                Entre com seu código e comece a cuidar do que é seu.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/10 p-2 shadow-sm backdrop-blur-sm">
                  <item.icon className="mb-1 size-3.5 text-emerald-400" />
                  <p className="text-[10px] font-bold leading-tight text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 pt-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">
              &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
            </p>
          </div>
        </section>

        {/* Lado direito: formulário */}
        <section className="flex max-h-full flex-col bg-card px-5 py-5 sm:px-6">
          <div className="mb-4 flex justify-center lg:hidden">
            <Link to="/" className="w-fit">
              <Logo />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex min-h-[340px] flex-col justify-center">{children}</div>
          </div>

          <div className="mt-4 pt-4 shrink-0 space-y-3 border-t border-border/50">
            <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-[10px] font-semibold leading-snug text-primary">
              Precisa de ajuda? Peça seu código ao seu responsável.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
