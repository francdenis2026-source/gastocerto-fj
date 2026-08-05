import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Flame,
  CreditCard,
  Baby,
  ShieldCheck,
  Zap,
  Target,
  LayoutDashboard,
  Lock,
  ChevronDown,
  Sparkles,
  Shield,
  Brain,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const categories = [
  {
    name: "Visão Geral",
    icon: LayoutDashboard,
    items: [
      {
        icon: BarChart3,
        title: "Painel Inteligente",
        text: "Visão consolidada de saldo, gastos e metas.",
        tag: "Analytics",
        detail: {
          summary: "Um painel centralizado que aprende com seus hábitos financeiros.",
          benefits: ["Gráficos em tempo real", "Projeção de saldo", "Alertas de gastos"],
        },
      },
      {
        icon: Target,
        title: "Metas de Poupança",
        text: "Crie objetivos e acompanhe o progresso.",
        tag: "Planejamento",
        detail: {
          summary: "Transforme seus sonhos em metas alcançáveis com aportes guiados.",
          benefits: ["Barra de progresso visual", "Previsão de conclusão", "Priorização de metas"],
        },
      },
    ],
  },
  {
    name: "Automação",
    icon: Zap,
    items: [
      {
        icon: Flame,
        title: "Controle de Gás",
        text: "Previsão de consumo e alertas de troca.",
        tag: "Exclusivo",
        detail: {
          summary: "Nunca mais seja pego de surpresa pelo fim do gás de cozinha.",
          benefits: ["Histórico de duração", "Aviso de baixa", "Estimativa de custo anual"],
        },
      },
      {
        icon: CreditCard,
        title: "Gestão de Cartões",
        text: "Faturas e limites em um único lugar.",
        tag: "Eficiência",
        detail: {
          summary: "Gerencie múltiplos cartões sem perder o controle das datas.",
          benefits: ["Consolidação de faturas", "Alertas de vencimento", "Análise de parcelamento"],
        },
      },
    ],
  },
  {
    name: "Segurança",
    icon: ShieldCheck,
    items: [
      {
        icon: Lock,
        title: "Criptografia Bancária",
        text: "Seus dados protegidos com o mais alto padrão.",
        tag: "Proteção",
        detail: {
          summary: "Segurança de nível militar para suas informações financeiras.",
          benefits: ["Dados criptografados", "Zero compartilhamento", "Conformidade LGPD"],
        },
      },
      {
        icon: Baby,
        title: "Espaço Kids Seguro",
        text: "Educação financeira com PIN para os filhos.",
        tag: "Família",
        detail: {
          summary: "Ensine seus filhos a lidar com dinheiro em um ambiente controlado.",
          benefits: ["PIN de segurança", "Mesada automática", "Avatar personalizado"],
        },
      },
    ],
  },
];

const securitySeals = [
  { icon: ShieldCheck, title: "Criptografia de ponta a ponta", text: "Tráfego seguro HTTPS" },
  { icon: Lock, title: "Conformidade com LGPD", text: "Dados 100% seus" },
  { icon: ShieldCheck, title: "Dados nunca compartilhados", text: "Privacidade absoluta" },
];

const faqItems = [
  { q: "O GastoCerto é seguro?", a: "Sim, utilizamos criptografia de ponta a ponta e seguimos a LGPD rigorosamente." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multas ou taxas escondidas. Você tem controle total." },
  { q: "Existe versão gratuita?", a: "Sim, nosso plano grátis é funcional e perfeito para quem está começando." },
];

export function Benefits() {
  return (
    <div className="bg-background">
      <section id="recursos" className="section-y border-b border-white/5">
        <div className="section-shell">
          <Reveal className="text-center mx-auto max-w-2xl mb-16">
            <h2 className="section-title">Recursos essenciais para seu controle</h2>
            <p className="mt-4 text-muted-foreground">Clique nos cards para explorar as funcionalidades detalhadamente.</p>
          </Reveal>

          <div className="grid gap-12">
            {categories.map((cat, catIdx) => (
              <div key={cat.name}>
                <div className="flex items-center gap-2 mb-6">
                  <cat.icon className="size-5 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{cat.name}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {cat.items.map((item, itemIdx) => (
                    <Reveal key={item.title} delay={(catIdx * 100) + (itemIdx * 50)}>
                      <FeatureDetailDialog
                        feature={{ title: item.title, text: item.text, tag: item.tag }}
                      >
                        <button className="group relative flex w-full flex-col items-start rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-left transition-all hover:bg-white/[0.04] hover:border-emerald-500/30 hover:shadow-[0_0_30px_-12px_rgba(34,197,94,0.2)] active:scale-[0.98]">
                          <div className="mb-4 grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-black">
                            <item.icon className="size-6" />
                          </div>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">{item.tag}</span>
                            <ArrowRight className="size-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                          </div>
                          <h4 className="mt-2 text-xl font-bold text-white">{item.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                        </button>
                      </FeatureDetailDialog>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="py-16 bg-white/[0.01]">
        <div className="section-shell">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="max-w-md">
              <h3 className="text-2xl font-bold text-white">Sua segurança é nossa prioridade</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Utilizamos as mesmas tecnologias de segurança dos grandes bancos para garantir que seus dados estejam sempre protegidos.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:w-auto">
              {securitySeals.map((seal) => (
                <div key={seal.title} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <seal.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{seal.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{seal.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section-y border-b border-white/5 bg-background">
        <div className="section-shell max-w-3xl">
          <Reveal className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white">Dúvidas Frequentes</h3>
            <p className="mt-2 text-muted-foreground text-sm">Respostas para as perguntas mais comuns.</p>
          </Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 50}>
                <AccordionItem 
                  value={`item-${idx}`} 
                  className="rounded-xl border border-white/5 bg-[#131C19]/40 px-6 transition-all hover:bg-[#131C19]/60 data-[state=open]:border-emerald-500/30 data-[state=open]:shadow-[0_0_20px_-10px_rgba(34,197,94,0.2)]"
                >
                  <AccordionTrigger className="py-5 text-sm font-bold text-white hover:no-underline [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-emerald-500">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground border-l-2 border-emerald-500/0 data-[state=open]:border-emerald-500 pl-4 transition-all">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </Reveal>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="cta-final" className="section-y bg-background">
        <div className="section-shell">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-[#0B1210] border border-white/5 px-8 py-12 text-center shadow-2xl">
            {/* Gradiente Radial e SVG Decorativo */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse-glow" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <svg className="absolute bottom-0 left-0 w-full h-24 opacity-[0.05] text-emerald-500" preserveAspectRatio="none" viewBox="0 0 1200 120">
                <path d="M0 0l48.8 33.3C97.7 66.7 195 133.3 293 150c97.7 16.7 195.3-16.7 293-33.3 97.7-16.7 195.3 0 293 16.7 97.7 16.7 195.3 0 244-8.3l48.7-8.4V120H0V0z" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
                Pronto para transformar sua vida financeira?
              </h2>
              <p className="mt-3 text-base font-medium text-muted-foreground">
                Junte-se a mais de 10.000 pessoas e tome o controle hoje mesmo.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  asChild
                  className="group relative h-14 rounded-xl bg-emerald-500 px-10 text-base font-black text-black transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)]"
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Começar Grátis Agora
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
