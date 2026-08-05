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
  "text-[12px] font-black uppercase tracking-[0.15em] text-white/70 hover:text-[#1FAE6D] transition-all duration-300 hover:-translate-y-1 inline-block";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative py-12 sm:py-16 overflow-hidden">
      {/* Fundo com imagem profissional e overlay de gradiente para profundidade */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-10 brightness-[0.3] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1512]/98 to-[#0A1512] 100%" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-[#1FAE6D]/15 to-transparent" />
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />

      <div className="section-shell relative z-10 px-6">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <Logo compact className="scale-[1.3] group-hover:scale-[1.4] transition-transform duration-500" />
            <p className="text-center text-[15px] text-white/70 font-bold tracking-tight sm:text-left sm:block max-w-[280px]">
              Gestão inteligente e segura <br className="hidden sm:block" />
              de alto nível para você.
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
                className="group flex items-center gap-3 rounded-2xl border border-[#1FAE6D]/30 bg-[#1FAE6D]/5 px-6 py-3 text-white/90 transition-all hover:bg-[#1FAE6D] hover:text-black hover:shadow-[0_0_20px_rgba(31,174,109,0.3)] active:scale-95"
              >
                <Mail className="size-4 text-[#1FAE6D] group-hover:text-black" />
                <span className="text-[12px] font-black tracking-[0.1em] uppercase">Suporte Premium</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Final Premium */}
      <div className="relative z-10 mt-10 border-t border-white/5 bg-[#0A1512]/80 backdrop-blur-2xl">
        <div className="section-shell flex flex-col items-center justify-between gap-y-4 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-white/40 sm:flex-row px-6">
          <div className="flex items-center gap-2">
            <span className="text-[#1FAE6D] text-sm">©</span>
            <p className="tracking-[0.2em]">{new Date().getFullYear()} GASTOCERTO • TODOS OS DIREITOS RESERVADOS</p>
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
