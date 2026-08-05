import { useState } from "react";
import { Mail, MessageSquare, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/finance/contact-modal";
import { Reveal } from "@/components/landing/reveal";

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
          <div className="grid gap-10 rounded-3xl bg-white/[0.02] p-6 backdrop-blur-sm sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex min-w-0 items-center gap-4">
                <ContactMarkIcon className="size-12 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    Contato
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Fale com a nossa equipe
                  </h2>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Dúvidas sobre planos, migração de dados ou uso do Espaço Kids? Envie sua mensagem —
                respondemos em até 1 dia útil.
              </p>

              <ul className="grid gap-3 sm:grid-cols-3">
                {channels.map((channel) => (
                  <li
                    key={channel.label}
                    className="rounded-2xl bg-background/40 p-4"
                  >
                    <channel.icon className="size-4 text-emerald-400" aria-hidden />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {channel.label}
                    </p>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="mt-1 block truncate text-sm font-semibold text-foreground hover:text-emerald-400"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-foreground">{channel.value}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 lg:w-64">
              <Button
                className="h-12 w-full rounded-xl bg-emerald-500 text-[12px] font-black uppercase tracking-[0.14em] text-[#001640] transition-all hover:bg-emerald-400 active:scale-95"
                onClick={() => setOpen(true)}
              >
                Abrir formulário
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-border/20 text-[12px] font-bold tracking-tight"
                asChild
              >
                <a href="mailto:contato@gastocerto.shop">Enviar e-mail</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
