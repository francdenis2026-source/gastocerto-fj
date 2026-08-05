import { Lock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
import { ContactModal } from "@/components/finance/contact-modal";
import { useState } from "react";

// Tap target ≥44px via invisible overlay
const tapTarget =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const focusRing =
  "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const navClass =
  "text-[10px] font-black uppercase tracking-[0.15em] text-white/60 hover:text-emerald-400 transition-all duration-300 hover:scale-105";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative border-t border-white/5 py-10 overflow-hidden">
      {/* Fundo com imagem profissional e overlay de gradiente para profundidade */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-10 brightness-[0.3] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001640] via-[#001640]/98 to-[#000a1a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />

      <div className="section-shell relative z-10">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="flex flex-row items-center gap-4">
            <Logo compact className="scale-110" />
            <p className="hidden text-[13px] text-white/50 font-medium tracking-tight sm:block max-w-[280px]">
              Gestão inteligente e segura de alto nível.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 lg:items-end lg:flex-row">
            <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link to="/recursos" className={navClass}>Serviços</Link>
              <a href="#planos" className={navClass}>Planos</a>
              <Link to="/termos" className={navClass}>Termos</Link>
              <Link to="/privacidade" className={navClass}>Privacidade</Link>
              <button onClick={() => setContactOpen(true)} className={navClass}>Contato</button>
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="mailto:contato@gastocerto.shop"
                className="group flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-white/50 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
              >
                <Mail className="size-3.5" />
                <span className="text-[11px] font-bold tracking-tight uppercase">Suporte</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Final Premium */}
      <div className="relative z-10 border-t border-white/5 mt-8 bg-[#000a1a]/95 backdrop-blur-xl">
        <div className="section-shell flex flex-col items-center justify-between gap-y-2 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500/50">©</span>
            <p>{new Date().getFullYear()} GASTOCERTO • TODOS OS DIREITOS RESERVADOS</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-white/50">SISTEMA ATUALIZADO</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="opacity-50 hover:opacity-100 transition-opacity">
                DESENVOLVIDO POR FRANC D&apos;NIS
              </p>
              <Link
                to="/admin"
                aria-label="Área administrativa"
                className={`flex items-center justify-center rounded-lg size-8 bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all ${tapTarget} ${focusRing}`}
              >
                <Lock className="size-3.5 text-white/20 hover:text-emerald-400" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
