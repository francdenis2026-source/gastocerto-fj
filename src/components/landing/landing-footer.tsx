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
  "text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 hover:text-[#1FAE6D] transition-all duration-300 hover:scale-105";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative py-8 overflow-hidden">
      {/* Fundo com imagem profissional e overlay de gradiente para profundidade */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-10 brightness-[0.3] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1512]/98 to-[#0A1512]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-[#1FAE6D]/15 to-transparent" />
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />

      <div className="section-shell relative z-10">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex flex-row items-center gap-4">
            <Logo compact className="scale-110" />
            <p className="hidden text-[13px] text-white/80 font-semibold tracking-tight sm:block max-w-[280px]">
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
                className="group flex items-center gap-2 rounded-xl border border-[#1FAE6D]/20 bg-[#1FAE6D]/5 px-4 py-2 text-white/90 transition-all hover:border-[#1FAE6D]/50 hover:bg-[#1FAE6D]/10 hover:text-[#1FAE6D]"
              >
                <Mail className="size-3.5 text-[#1FAE6D]" />
                <span className="text-[11px] font-bold tracking-tight uppercase">Suporte Premium</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Final Premium */}
      <div className="relative z-10 mt-6 border-t border-white/10 bg-[#0A1512]/60 backdrop-blur-xl">
        <div className="section-shell flex flex-col items-center justify-between gap-y-2 py-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-white/50 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-[#1FAE6D]">©</span>
            <p>{new Date().getFullYear()} GASTOCERTO • TODOS OS DIREITOS RESERVADOS</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FAE6D]/10 border border-[#1FAE6D]/20">
              <span className="size-1.5 rounded-full bg-[#1FAE6D] animate-pulse shadow-[0_0_8px_#1FAE6D]" />
              <p className="text-[10px] text-[#1FAE6D]">SISTEMA ATUALIZADO</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-white/40 hover:text-white transition-colors">
                DESENVOLVIDO POR FRANC D&apos;NIS
              </p>
              <Link
                to="/admin"
                aria-label="Área administrativa"
                className={`flex items-center justify-center rounded-lg size-8 bg-white/5 border border-white/5 hover:bg-[#1FAE6D]/10 hover:border-[#1FAE6D]/20 transition-all ${tapTarget} ${focusRing}`}
              >
                <Lock className="size-3.5 text-white/20 hover:text-[#1FAE6D]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
