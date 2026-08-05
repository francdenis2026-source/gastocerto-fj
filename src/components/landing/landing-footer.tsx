import { Lock, Mail, Linkedin } from "lucide-react";
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
  "text-[12px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-emerald-400 transition-all duration-300 hover:scale-105";

export function LandingFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative border-t border-emerald-500/10 py-12 overflow-hidden">
      {/* Imagem de Fundo Realista no Footer com Efeito de Destaque */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-20 brightness-[0.2] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001a4d] via-[#001a4d]/95 to-[#000d26]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />

      <div className="section-shell relative z-10">
        <div className="flex flex-col items-center justify-between gap-16 lg:flex-row">
          <div className="flex flex-col items-center lg:items-start gap-6 max-w-md">
            <Logo compact className="scale-125 mb-4" />
            <p className="text-[14px] text-white/50 leading-relaxed text-center lg:text-left font-medium tracking-tight max-w-sm">
              A plataforma definitiva para quem busca liberdade financeira através de uma gestão
              inteligente, segura e de alto nível.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 lg:items-end">
            <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              <Link to="/recursos" className={navClass}>
                Serviços
              </Link>
              <a href="#planos" className={navClass}>
                Planos
              </a>
              <Link to="/termos" className={navClass}>
                Termos
              </Link>
              <Link to="/privacidade" className={navClass}>
                Privacidade
              </Link>
              <button onClick={() => setContactOpen(true)} className={navClass}>
                Contato
              </button>
            </nav>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:contato@gastocerto.shop"
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-3 text-white/60 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
              >
                <Mail className="size-4 transition-transform group-hover:rotate-12" />
                <span className="text-[12px] font-bold tracking-tight uppercase">Fale Conosco</span>
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-3 text-white/60 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
              >
                <Linkedin className="size-4 transition-transform group-hover:scale-110" />
                <span className="text-[12px] font-bold tracking-tight uppercase">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Final Premium */}
      <div className="relative z-10 border-t border-white/5 mt-10 bg-black/30 backdrop-blur-md">
        <div className="section-shell flex flex-col items-center justify-between gap-y-4 py-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 sm:flex-row">
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
