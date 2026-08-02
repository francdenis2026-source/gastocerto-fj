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
 * Tela dedicada ao login independente da criança: hero ilustrado, fundo
 * temático e o formulário de entrada em destaque.
 */
export function KidsLoginScreen({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[oklch(0.18_0.05_255)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,oklch(0.42_0.13_190/0.55),transparent_55%),radial-gradient(circle_at_85%_10%,oklch(0.45_0.16_150/0.45),transparent_50%),radial-gradient(circle_at_50%_100%,oklch(0.3_0.1_280/0.5),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(oklch(1_0_0)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:items-center lg:gap-10 lg:py-10">
        <section className="min-w-0 text-white">
          <div>
            <Link
              to="/"
              className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <Logo onDark />
            </Link>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            <Sparkles className="size-3.5" aria-hidden /> Espaço Kids
          </p>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl xl:text-5xl">
            Seu dinheiro, suas metas,
            <span className="block text-[oklch(0.86_0.16_160)]">do seu jeito.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white sm:text-base">
            Entre com o seu código e a sua senha de números. É rapidinho — sem e-mail, sem CPF e sem
            precisar chamar o adulto.
          </p>

          <img
            src={kidsHero}
            alt="Cofrinho, moedas e foguete representando o Espaço Kids do GastoCerto"
            width={1280}
            height={1280}
            loading="lazy"
            decoding="async"
            className="mx-auto mt-6 w-full max-w-xs rounded-3xl border border-white/20 shadow-2xl sm:max-w-sm lg:mt-8"
          />

        </section>

        <section className="order-first min-w-0 lg:order-none">
          <div className="rounded-3xl border border-white/25 bg-card p-5 shadow-2xl sm:p-6">
            <p className="mb-3 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <Rocket className="size-3.5" aria-hidden /> Entrada da criança
            </p>
            {children}
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/90">
            Não sabe seu código? Peça para o seu responsável abrir o Espaço Kids no painel dele.
          </p>
        </section>
        <ul className="order-last grid gap-2 sm:grid-cols-3 lg:hidden">
            {HIGHLIGHTS.map((item) => (
          <li
                key={item.title}
                className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"
              >
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-white">
            <item.icon className="size-4 shrink-0 text-[oklch(0.88_0.16_160)]" aria-hidden />
                  {item.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-white/90">{item.text}</p>
          </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
