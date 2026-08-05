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

const featureGroupsOld: { group: string; caption: string; items: Feature[] }[] = [
  {
    group: "Dia a dia",
    caption: "Registros e contas do dia a dia",
    items: [
      {
        icon: Receipt,
        title: "Lançamentos em 10s",
        text: "Despesa ou receita com categoria, anexo, parcelas e data retroativa.",
        tag: "Rápido",
      },
      {
        icon: ShoppingBasket,
        title: "Mercado e alimentação",
        text: "Compras do mês, feira, delivery e água mineral separados por categoria.",
        tag: "Casa",
      },
      {
        icon: Repeat,
        title: "Contas recorrentes",
        text: "Água, energia, internet e mensalidades lançadas sozinhas todo mês.",
        tag: "Automático",
      },
      {
        icon: Flame,
        title: "Gás de cozinha",
        text: "Histórico de botijões, duração média e aviso quando estiver acabando.",
        tag: "Casa",
      },
    ],
  },
  {
    group: "Veículos e trabalho",
    caption: "Custos de veículos e rodagem",
    items: [
      {
        icon: Fuel,
        title: "Abastecimentos",
        text: "Litros, preço por litro, odômetro validado e detecção de anomalias.",
        tag: "Combustível",
      },
      {
        icon: Car,
        title: "Custo por km",
        text: "Consumo médio por veículo, metas de eficiência e alertas de desvio.",
        tag: "Frota",
      },
      {
        icon: ScrollText,
        title: "Auditoria de odômetro",
        text: "Histórico de alterações, comparação antes/depois e alertas acionados.",
        tag: "Rastreável",
      },
      {
        icon: Banknote,
        title: "Receitas variáveis",
        text: "Ideal para autônomos: entradas por dia, semana ou corrida.",
        tag: "Autônomo",
      },
    ],
  },
  {
    group: "Planejamento",
    caption: "Orçamentos, metas e previsibilidade",
    items: [
      {
        icon: PiggyBank,
        title: "Orçamentos por categoria",
        text: "Limite mensal com barra de consumo e aviso antes de estourar.",
        tag: "Limites",
      },
      {
        icon: Target,
        title: "Metas e aportes",
        text: "Objetivos com progresso mensal, prazo e quanto falta guardar.",
        tag: "Objetivos",
      },
      {
        icon: CreditCard,
        title: "Cartões de crédito e débito",
        text: "Faturas, limites, vencimentos e parcelas em aberto de cada cartão.",
        tag: "Cartões",
      },
      {
        icon: Tv,
        title: "Assinaturas e academia",
        text: "Streaming, apps e mensalidades: veja o total escondido do mês.",
        tag: "Recorrente",
      },
    ],
  },
  {
    group: "Família e Kids",
    caption: "Gestão e educação financeira",
    items: [
      {
        icon: Baby,
        title: "Espaço Kids",
        text: "Painel simplificado por criança, com PIN, avatar e tema próprio.",
        tag: "Kids",
      },
      {
        icon: Send,
        title: "PIX",
        text: "Envie dinheiro por PIX, com histórico, comprovante e aviso na hora.",
        tag: "PIX",
      },
      {
        icon: Target,
        title: "Metas e recompensas",
        text: "Objetivos de poupança da criança com progresso visual e conquistas.",
        tag: "Metas",
      },
      {
        icon: Repeat,
        title: "Envio automático",
        text: "Recorrência semanal ou mensal lançada sozinha no orçamento da casa.",
        tag: "Automático",
      },
    ],
  },
  {
    group: "Inteligência e relatórios",
    caption: "IA, análises e compartilhamento",
    items: [
      {
        icon: Sparkles,
        title: "Consultor financeiro com IA",
        text: "Diagnóstico do mês, plano de saída de dívidas e dicas sob medida.",
        tag: "IA",
      },
      {
        icon: BarChart3,
        title: "Balanço anual e relatórios",
        text: "Tendências, comparativos e exportação em CSV, Excel e PDF.",
        tag: "Análise",
      },
      {
        icon: CalendarClock,
        title: "Fechamento e conciliação",
        text: "Feche o mês, bloqueie períodos com senha e confira saldo por conta.",
        tag: "Fechamento",
      },
      {
        icon: Bell,
        title: "Compartilhamento seguro",
        text: "Link com senha e validade para alguém ver seus gastos sem cadastro.",
        tag: "Link",
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
  { label: "Segurança", href: "#seguranca", icon: Lock },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
] as const;

const tabs = ["recursos", "faq"] as const;
type TabValue = (typeof tabs)[number];

const tabMeta: Record<TabValue, { label: string; description: string }> = {
  recursos: { label: "Recursos e Segurança", description: "Doze recursos essenciais organizados em três frentes" },
  faq: { label: "Dúvidas", description: "Perguntas frequentes: cinco dúvidas comuns sobre planos e segurança" },
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
        <Reveal className="text-center mb-10">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Ecossistema Completo
          </p>
          <h2 className="mt-1 section-title">Tudo o que você precisa</h2>
        </Reveal>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-8">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/5 p-1 rounded-full">
              {tabs.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-full px-8 py-2 data-[state=active]:bg-brand data-[state=active]:text-black"
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureGroups.map((group, groupIndex) => (
                <Reveal
                  key={group.group}
                  delay={groupIndex * 50}
                  className="rounded-2xl p-5 border border-white/[0.03]"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand mb-4">
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
                            className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-all hover:bg-white/[0.04]"
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
