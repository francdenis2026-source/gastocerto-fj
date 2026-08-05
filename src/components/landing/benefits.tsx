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
    <div className="bg-background relative overflow-hidden">
      {/* Imagem de Fundo Global da Seção */}
      <img 
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
        alt="" 
        className="absolute inset-0 h-full w-full object-cover opacity-[0.08] dark:opacity-[0.12] grayscale-[0.1] pointer-events-none"
      />
      <section id="recursos" className="section-y border-b border-border/5 relative z-10">
        <div className="section-shell">
          <Reveal className="text-center mx-auto max-w-2xl mb-12">
            <h2 className="section-title">Ecosystema de alto desempenho</h2>
            <p className="mt-3 text-muted-foreground">Ferramentas técnicas para gestão de patrimônio e otimização financeira.</p>
          </Reveal>

          <div className="grid gap-8">
            {categories.map((cat, catIdx) => (
              <div key={cat.name}>
                <div className="flex items-center gap-2 mb-4">
                  <cat.icon className="size-4 text-emerald-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{cat.name}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {cat.items.map((item, itemIdx) => (
                    <Reveal key={item.title} delay={(catIdx * 100) + (itemIdx * 50)}>
                      <FeatureDetailDialog
                        feature={{ title: item.title, text: item.text, tag: item.tag }}
                      >
                        <button className="group relative flex w-full flex-col items-start rounded-xl border border-border/5 bg-card/5 p-5 text-left transition-all glass-morphism hover:bg-card/10 hover:border-emerald-500/30 hover:shadow-[0_0_30px_-12px_rgba(31,174,109,0.2)] active:scale-[0.98]">
                          <div className="mb-3 grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-[#001640]">
                            <item.icon className="size-5" />
                          </div>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">{item.tag}</span>
                            <ArrowRight className="size-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                          </div>
                          <h4 className="mt-1.5 text-lg font-bold text-white">{item.title}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
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

      <section id="seguranca" className="py-12 bg-white/[0.01] relative z-10">
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

      <section id="faq" className="section-y border-b border-border/5 bg-background relative z-10">
        {/* Textura SVG sutil */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="section-shell max-w-3xl relative z-10">
          <Reveal className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white">Dúvidas Frequentes</h3>
            <p className="mt-2 text-muted-foreground text-sm">Respostas para as perguntas mais comuns.</p>
          </Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 50}>
                <AccordionItem 
                  value={`item-${idx}`} 
                  className="glass-morphism rounded-xl px-5 transition-all hover:bg-card/60 data-[state=open]:border-emerald-500/30 data-[state=open]:shadow-[0_0_20px_-10px_rgba(31,174,109,0.2)]"
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

      <section id="cta-final" className="section-y bg-background relative overflow-hidden z-10">
        <div className="section-shell relative z-10">
          <Reveal className="relative overflow-hidden rounded-[1.5rem] glass-morphism px-6 py-8 text-center shadow-2xl border border-border/5">
            {/* Foto Real de Fundo com Baixa Opacidade */}
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop" 
              alt="" 
              className="absolute inset-0 h-full w-full object-cover opacity-10 grayscale pointer-events-none"
            />
            {/* Gradiente Radial e SVG Decorativo */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse-glow" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <svg className="absolute bottom-0 left-0 w-full h-24 opacity-[0.05] text-emerald-500" preserveAspectRatio="none" viewBox="0 0 1200 120">
                <path d="M0 0l48.8 33.3C97.7 66.7 195 133.3 293 150c97.7 16.7 195.3-16.7 293-33.3 97.7-16.7 195.3 0 293 16.7 97.7 16.7 195.3 0 244-8.3l48.7-8.4V120H0V0z" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                Tome o controle estratégico hoje.
              </h2>
              <p className="mt-2 text-[15px] font-medium text-muted-foreground">
                Junte-se à elite da gestão financeira e automatize seu futuro.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  asChild
                  className="group relative h-11 rounded-lg bg-emerald-500 px-8 text-[14px] font-black text-[#0A1512] transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(31,174,109,0.5)]"
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
