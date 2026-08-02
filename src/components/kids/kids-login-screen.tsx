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

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-10 lg:min-h-dvh">
        <section className="w-full max-w-md text-center text-white">
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <Logo onDark />
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <p className="flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              <Sparkles className="size-3.5" aria-hidden /> Espaço Kids
            </p>
          </div>
          
          <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
            Seu dinheiro, suas metas,
            <span className="block text-[oklch(0.86_0.16_160)]">do seu jeito.</span>
          </h1>
          
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/90">
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
            className="mx-auto mt-8 w-full max-w-[280px] rounded-3xl border border-white/20 shadow-2xl sm:max-w-[320px]"
          />

        </section>

        <section className="mt-8 w-full max-w-md min-w-0">
          <div className="rounded-3xl border border-white/25 bg-card p-5 shadow-2xl sm:p-7">
            <p className="mb-4 flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
              <Rocket className="size-4" aria-hidden /> Entrada da criança
            </p>
            {children}
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/90">
            Não sabe seu código? Peça para o seu responsável abrir o Espaço Kids no painel dele.
          </p>
        </section>

        <ul className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
          <li
                key={item.title}
                className="flex flex-col items-center text-center rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
            <div className="mb-2 rounded-full bg-white/10 p-2">
              <item.icon className="size-5 text-[oklch(0.88_0.16_160)]" aria-hidden />
            </div>
            <p className="text-[13px] font-bold text-white">
                  {item.title}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white/80">{item.text}</p>
          </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
