import { useState } from "react";
import { Mail, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/finance/contact-modal";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const channels = [
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@gastocerto.shop",
    href: "mailto:contato@gastocerto.shop",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageSquare,
    label: "Suporte",
    value: "Ticket via Formulário",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Clock,
    label: "Atendimento",
    value: "Seg a Sex, 9h às 18h",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export function ContactSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="contato" className="section-y bg-background border-t border-border overflow-hidden">
      <ContactModal open={open} onOpenChange={setOpen} />

      <div className="section-shell relative">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <Sparkles className="size-3" />
            Canais de Suporte
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Sempre aqui para ajudar você
          </h2>
          <p className="text-secondary-foreground text-lg max-w-2xl mx-auto">
            Dúvidas sobre planos, migração ou Espaço Kids? Nossa equipe responde em até 24 horas úteis.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-center">
          <Reveal>
            <div className="grid sm:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <div
                  key={channel.label}
                  className="interactive-card group p-6 rounded-[2rem] border border-border bg-card"
                >
                  <div className={cn("mb-4 flex size-10 items-center justify-center rounded-xl", channel.bg)}>
                    <channel.icon className={cn("size-5", channel.color)} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground mb-1">
                    {channel.label}
                  </p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-foreground">{channel.value}</p>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 tracking-tight">Precisa de algo mais específico?</h3>
                <p className="text-primary-foreground/80 mb-8 font-medium">
                  Nosso formulário de contato direto é a forma mais rápida de falar com um especialista financeiro.
                </p>
                <Button
                  className="w-full h-14 rounded-full bg-white text-primary hover:bg-white/90 font-bold text-lg shadow-xl"
                  onClick={() => setOpen(true)}
                >
                  Abrir Formulário
                </Button>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
