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
  { q: "O GastoCerto é seguro?", a: "Sim, utilizamos criptografia de ponta a ponta e seguimos a LGPD rigorosamente. Seus dados financeiros são privados e nunca são compartilhados." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, o cancelamento é instantâneo e pode ser feito diretamente nas configurações do seu perfil. Sem letras miúdas ou taxas extras." },
  { q: "Como funciona o Espaço Kids?", a: "É uma área exclusiva com PIN de segurança onde você pode definir mesadas automáticas, criar metas para seus filhos e ensiná-los o valor do dinheiro." },
  { q: "O Consultor com IA é pago?", a: "O consultor básico está disponível em todos os planos. Recursos avançados de análise preditiva e recomendações personalizadas fazem parte do plano PRO." },
  { q: "Existe versão gratuita?", a: "Sim, nosso plano grátis permite o controle essencial de gastos e receitas. O trial de 14 dias do plano PRO também está disponível para novos usuários." },
];

export function Benefits() {
  return (
    <div className="relative overflow-hidden">
      {/* Imagem de Fundo Global da Seção */}
      {/* Imagem de Fundo Global da Seção - Removida para limpar o visual */}
      <section id="recursos" className="section-y relative z-10 border-t border-white/[0.03]">
        <div className="section-shell">
           <Reveal className="text-center mx-auto max-w-3xl mb-16">
             <h2 className="section-title">Recursos Inteligentes</h2>
             <p className="mt-4 section-subtitle max-w-2xl mx-auto">Tudo o que você precisa para uma vida financeira organizada e tranquila, com ferramentas que simplificam o seu dia a dia.</p>
           </Reveal>
 
           <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {categories.flatMap(cat => cat.items).map((item, idx) => (
               <Reveal key={item.title} delay={idx * 50}>
                 <FeatureDetailDialog
                   feature={{ title: item.title, text: item.text, tag: item.tag }}
                 >
                   <button className="interactive-card group relative flex w-full flex-col items-start rounded-2xl p-8 text-left border border-border bg-card transition-all duration-300 outline-none">
                     <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                       <item.icon className="size-6" />
                     </div>
                     <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary">{item.tag}</span>
                     <h4 className="text-xl font-bold text-foreground mb-3">{item.title}</h4>
                     <p className="text-sm font-medium leading-relaxed text-secondary-foreground">{item.text}</p>
                   </button>
                 </FeatureDetailDialog>
               </Reveal>
             ))}
           </div>
        </div>
      </section>

       <section id="seguranca" className="py-24 bg-card border-y border-border relative z-10">
         <div className="section-shell">
           <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
             <div className="max-w-xl text-center lg:text-left">
               <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Sua segurança é nossa prioridade</h3>
               <p className="mt-4 text-lg font-medium text-secondary-foreground leading-relaxed">
                 Utilizamos padrões de segurança bancários para garantir que seus dados estejam sempre protegidos e privados.
               </p>
             </div>
             <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:w-auto">
               {securitySeals.map((seal) => (
                 <div key={seal.title} className="flex flex-col items-center lg:items-start gap-4 p-6 rounded-2xl border border-border bg-background">
                   <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                     <seal.icon className="size-6" />
                   </div>
                   <div className="text-center lg:text-left">
                     <p className="text-sm font-bold text-foreground leading-tight">{seal.title}</p>
                     <p className="text-xs font-medium text-secondary-foreground mt-1">{seal.text}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>

       <section id="faq" className="section-y relative z-10">
         <div className="section-shell max-w-4xl relative z-10">
           <Reveal className="text-center mb-16">
             <h3 className="section-title">Dúvidas Frequentes</h3>
             <p className="mt-4 section-subtitle max-w-2xl mx-auto">Tudo o que você precisa saber sobre o GastoCerto para começar com confiança.</p>
           </Reveal>
           <div className="grid gap-4">
             <Accordion type="single" collapsible className="w-full space-y-4">
               {faqItems.map((faq, idx) => (
                 <Reveal key={faq.q} delay={idx * 100}>
                   <AccordionItem 
                     value={`item-${idx}`} 
                     className="group border border-border bg-card rounded-2xl px-6 transition-all duration-300 hover:border-primary/30"
                   >
                     <AccordionTrigger className="flex py-6 text-lg font-bold text-foreground hover:no-underline transition-all data-[state=open]:text-primary">
                       <span className="flex-1 text-left pr-4">{faq.q}</span>
                     </AccordionTrigger>
                     <AccordionContent className="pb-8 text-base font-medium text-secondary-foreground leading-relaxed">
                       {faq.a}
                     </AccordionContent>
                   </AccordionItem>
                 </Reveal>
               ))}
             </Accordion>
           </div>
         </div>
       </section>

       <section id="cta-final" className="section-y relative overflow-hidden z-10 bg-primary/5 border-t border-border">
         <div className="section-shell relative z-10">
           <Reveal className="relative overflow-visible px-8 py-24 text-center">
             <div className="relative z-10 mx-auto max-w-3xl">
               <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                 Comece a organizar sua vida financeira hoje.
               </h2>
               <p className="mt-8 text-lg font-medium text-secondary-foreground max-w-2xl mx-auto">
                 Junte-se a milhares de pessoas que já simplificaram sua gestão financeira com o GastoCerto.
               </p>
               <div className="mt-12 flex justify-center">
                 <Button
                   asChild
                   className="h-14 rounded-full bg-primary px-12 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                 >
                   <Link to="/auth" search={{ mode: "signup" }}>
                     Começar Teste Gratuito
                     <ArrowRight className="ml-2 size-5" />
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
