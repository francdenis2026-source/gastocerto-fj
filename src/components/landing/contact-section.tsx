import { useState } from "react";
import { Mail, MessageSquare, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/finance/contact-modal";
import { Reveal } from "@/components/landing/reveal";
import { LeadCaptureForm } from "./lead-capture-form";

/** Ícone SVG exclusivo de contato: envelope com onda de sinal. */
function ContactMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="13" width="28" height="20" rx="4" className="stroke-current fill-current/10" />
      <path d="M7.5 16.5 20 25l12.5-8.5" className="stroke-current" />
      <path d="M38 18a8 8 0 0 1 0 12" className="stroke-current" opacity="0.5" />
      <path d="M41.5 14.5a13 13 0 0 1 0 19" className="stroke-current" opacity="0.25" />
      <circle cx="34" cy="24" r="1.4" className="fill-current" stroke="none" />
    </svg>
  );
}

const channels = [
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@gastocerto.shop",
    href: "mailto:contato@gastocerto.shop",
  },
  {
    icon: MessageSquare,
    label: "Suporte",
    value: "Abrir um ticket no formulário",
  },
  {
    icon: Clock,
    label: "Atendimento",
    value: "Seg a Sex, 9h às 18h (BRT)",
  },
];

/** Seção de contato da landing: canais diretos + formulário em modal. */
export function ContactSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="contato" className="section-y relative">
      <ContactModal open={open} onOpenChange={setOpen} />

      <div className="section-shell">
        <Reveal>
          <div className="grid gap-12 rounded-[3rem] bg-black/40 border border-white/10 p-8 backdrop-blur-xl sm:p-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ContactMarkIcon className="size-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500">
                    Central de Relacionamento
                  </p>
                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Fale com nossos estrategistas
                  </h2>
                </div>
              </div>

              <p className="text-base leading-relaxed text-white/60 font-medium max-w-lg">
                Dúvidas sobre planos corporativos, migração massiva de dados ou segurança? Nossa equipe de elite está pronta para oferecer suporte técnico e estratégico.
              </p>

              <div className="grid gap-4 sm:grid-cols-1">
                {channels.map((channel) => (
                  <div
                    key={channel.label}
                    className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 p-4 transition-all hover:bg-white/[0.05]"
                  >
                    <div className="size-10 rounded-xl bg-emerald-500/5 flex items-center justify-center">
                      <channel.icon className="size-5 text-emerald-500" aria-hidden />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                        {channel.label}
                      </p>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          className="text-sm font-bold text-white hover:text-emerald-500 transition-colors"
                        >
                          {channel.value}
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-white">{channel.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Tempo médio de resposta</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="size-4 text-emerald-500/50" />
                  <span className="text-sm font-black text-white/80 tracking-tight">Sob demanda em até 24 horas úteis</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-[3rem] -z-10" />
              <LeadCaptureForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
