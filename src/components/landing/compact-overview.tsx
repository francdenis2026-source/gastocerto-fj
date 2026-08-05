import { useEffect, useState } from "react";
import {
  Baby,
  Banknote,
  Send,
  BarChart3,
  Bell,
  CalendarClock,
  Car,
  CreditCard,
  Droplets,
  Dumbbell,
  Fingerprint,
  Flame,
  Fuel,
  HelpCircle,
  LayoutDashboard,
  Lock,
  PiggyBank,
  Receipt,
  Repeat,
  ScrollText,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Target,
  Tv,
  Wallet,
  type LucideIcon,
} from "lucide-react";


import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";
import { Reveal } from "@/components/landing/reveal";
import { handleAnchorClick } from "@/lib/scroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Feature = { icon: LucideIcon; title: string; text: string; tag: string };

const featureGroups: { group: string; caption: string; items: Feature[] }[] = [
  {
    group: "Essencial",
    caption: "Gestão do dia a dia",
    items: [
      {
        icon: Receipt,
        title: "Lançamentos em 10s",
        text: "Despesa ou receita com categoria e parcelas.",
        tag: "Agilidade",
      },
      {
        icon: Repeat,
        title: "Contas recorrentes",
        text: "Água, energia e internet lançadas sozinhas todo mês.",
        tag: "Automação",
      },
      {
        icon: CreditCard,
        title: "Gestão de Cartões",
        text: "Faturas, limites e vencimentos centralizados.",
        tag: "Cartões",
      },
      {
        icon: BarChart3,
        title: "Painel Inteligente",
        text: "Visão consolidada de saldo, gastos e metas.",
        tag: "Analytics",
      },
    ],
  },
  {
    group: "Diferenciais",
    caption: "Recursos exclusivos",
    items: [
      {
        icon: Baby,
        title: "Espaço Kids",
        text: "Painel simplificado por criança com PIN e avatar.",
        tag: "Família",
      },
      {
        icon: Flame,
        title: "Gás de cozinha",
        text: "Histórico, duração média e aviso de reposição.",
        tag: "Casa",
      },
      {
        icon: Fuel,
        title: "Abastecimentos",
        text: "Consumo médio e detecção de anomalias.",
        tag: "Frota",
      },
      {
        icon: Sparkles,
        title: "Consultor com IA",
        text: "Diagnóstico e plano de saída de dívidas.",
        tag: "Inteligência",
      },
    ],
  },
  {
    group: "Segurança",
    caption: "Privacidade absoluta",
    items: [
      {
        icon: Lock,
        title: "Dados Privados",
        text: "Criptografia bancária e conformidade LGPD.",
        tag: "Segurança",
      },
      {
        icon: Fingerprint,
        title: "Acesso Isolado",
        text: "Cada conta vê apenas seus próprios registros.",
        tag: "Controle",
      },
      {
        icon: ShieldCheck,
        title: "Sem Compartilhamento",
        text: "Dados 100% seus, nunca vendidos a terceiros.",
        tag: "Confiança",
      },
      {
        icon: CalendarClock,
        title: "Conciliação",
        text: "Feche o mês e bloqueie períodos com senha.",
        tag: "Gestão",
      },
    ],
  },
];

const highlights = [
  { icon: Droplets, value: "20+", label: "categorias prontas", hint: "gás, combustível, água, roupas…" },
  { icon: Dumbbell, value: "12", label: "módulos integrados", hint: "de lançamentos ao Espaço Kids" },
  { icon: ShieldCheck, value: "100%", label: "dados isolados", hint: "cada conta vê só o que é seu" },
];

const pillars = [
  { icon: ScrollText, title: "LGPD na prática", text: "Coletamos só o necessário e você pode exportar ou excluir tudo." },
  { icon: Lock, title: "Criptografia", text: "HTTPS no tráfego, banco criptografado e comprovantes privados." },
  { icon: Fingerprint, title: "Controle de acesso", text: "Cada conta enxerga apenas os próprios registros." },
];

const faqs = [
  { q: "O sistema é gratuito?", a: "Sim. O plano Gratuito cobre lançamentos, painel mensal, categorias, um veículo e relatórios simplificados." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada conta acessa apenas os próprios registros, com regras aplicadas no banco de dados." },
  { q: "Posso controlar despesas recorrentes?", a: "Sim, com vencimento, frequência, lançamento automático e alertas antes de vencer." },
  { q: "Posso exportar relatórios?", a: "Sim, em PDF e CSV, com métricas, gráficos e a lista completa do período." },
  { q: "Mensal ou anual?", a: "O conteúdo é o mesmo; no anual o Premium sai por R$ 20,75/mês em vez de R$ 24,90, e o Premium IA por R$ 29,00/mês em vez de R$ 34,90." },
  
];

const shortcuts = [
  { label: "Recursos", href: "#recursos", icon: Wallet },
  { label: "Planos", href: "#planos", icon: Sparkles },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
] as const;

const tabs = ["recursos", "faq"] as const;
type TabValue = (typeof tabs)[number];

const tabMeta: Record<TabValue, { label: string; description: string }> = {
  recursos: { label: "Recursos e Segurança", description: "Doze recursos essenciais organizados em três frentes" },
  faq: { label: "Suporte", description: "Perguntas frequentes: cinco dúvidas comuns sobre planos e segurança" },
};

export function CompactOverview() {
  const [tab, setTab] = useState<TabValue>("recursos");

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace("#", "") as TabValue;
      if (tabs.includes(hash)) setTab(hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <section id="recursos" className="relative section-y overflow-hidden">
      <div className="section-shell relative z-10">
        <Reveal className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-brand transition-all hover:scale-110 hover:bg-brand/10 cursor-default">
              <Sparkles className="size-3.5 animate-pulse" />
              Recursos de Próxima Geração
            </span>
          </div>
          <h2 className="section-title text-4xl sm:text-5xl lg:text-7xl tracking-tighter font-black">Infraestrutura Financeira</h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-base sm:text-xl leading-relaxed font-medium [text-wrap:balance]">
            Uma engenharia desenhada para quem busca precisão absoluta, segurança inabalável e automação de elite.
          </p>
        </Reveal>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-8">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/5 p-1 rounded-full">
              {tabs.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-full px-8 py-2 data-[state=active]:bg-brand data-[state=active]:text-black transition-all hover:scale-105 active:scale-95"
                >
                  {tabMeta[value].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {`Seção ativa: ${tabMeta[tab].label}. ${tabMeta[tab].description}.`}
          </p>

          <TabsContent value="recursos" className="mt-3 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["recursos"].label}</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureGroups.map((group, groupIndex) => (
                <Reveal
                  key={group.group}
                  delay={groupIndex * 50}
                  className="interactive-card rounded-[2.5rem] p-9 bg-white/[0.03] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-8 border-b border-brand/10 pb-5">
                    {group.group}
                  </p>
                  <ul className="grid gap-2">
                    {group.items.map((item) => (
                      <li key={item.title}>
                        <FeatureDetailDialog
                          feature={{ title: item.title, text: item.text, tag: item.tag }}
                        >
                          <button
                            type="button"
                            className="group flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-all hover:bg-white/[0.03]"
                          >
                            <div className="grid size-8 place-items-center rounded-lg bg-white/5 text-brand group-hover:bg-brand/10 transition-colors">
                              <item.icon className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{item.title}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{item.tag}</p>
                            </div>
                          </button>
                        </FeatureDetailDialog>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </TabsContent>


          <TabsContent value="faq" className="mt-3.5 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["faq"].label}</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <Reveal key={faq.q} delay={index * 50}>
                  <AccordionItem value={`faq-${index}`} className="px-4 rounded-xl mb-1 last:mb-0">
                    <AccordionTrigger className="px-1 text-left text-[13px] font-semibold sm:text-sm">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-1 text-[12.5px] leading-relaxed text-muted-foreground sm:text-sm">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </Reveal>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
