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

import { DemoDialog } from "@/components/landing/demo-dialog";
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
  { q: "Preciso de conta para a demonstração?", a: "Não. A demonstração é aberta, com dados fictícios e sem cartão de crédito." },
];

const shortcuts = [
  { label: "Recursos", href: "#recursos", icon: Wallet },
  { label: "Planos", href: "#planos", icon: Sparkles },
  { label: "Segurança", href: "#seguranca", icon: Lock },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
] as const;

const tabs = ["recursos", "seguranca", "faq"] as const;
type TabValue = (typeof tabs)[number];

const tabMeta: Record<TabValue, { label: string; description: string }> = {
  recursos: { label: "Recursos", description: "Vinte e quatro recursos organizados em seis frentes" },
  seguranca: { label: "Segurança", description: "LGPD, criptografia e controle de acesso" },
  faq: { label: "FAQ", description: "Perguntas frequentes: seis dúvidas comuns sobre planos e demonstração" },
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
    <section id="explorar" className="relative border-y border-white/5 bg-white/[0.01] section-y">
      <span id="seguranca" className="block" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--brand)_45%,transparent),transparent)]"
      />
      <div className="section-shell">
        <Reveal className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Recursos da plataforma
            </p>
            <h2 className="mt-1 section-title">
              Um sistema completo para o seu controle financeiro
            </h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-snug text-muted-foreground sm:text-[13px] sm:leading-relaxed">
              Recursos integrados para o dia a dia, veículos, planejamento, família e análise.
            </p>
          </div>
          <nav aria-label="Atalhos para seções da página" className="hidden min-w-0 flex-wrap items-center gap-1.5 sm:flex sm:justify-end">
            <DemoDialog>
              <button
                type="button"
                className="group inline-flex min-h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 text-xs font-bold text-brand transition-all hover:bg-brand hover:text-brand-foreground"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                Ver demonstração
              </button>
            </DemoDialog>
            {shortcuts.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => handleAnchorClick(event, item.href)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-3 text-xs font-medium text-muted-foreground transition-all hover:border-white/20 hover:text-foreground"
              >
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </a>
            ))}
          </nav>
        </Reveal>

        <Reveal delay={80} className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-border bg-card/70 px-3 py-2 backdrop-blur">
          {highlights.map((item) => (
            <div key={item.label} className="flex min-w-0 items-center gap-1.5">
              <item.icon className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
              <p className="tabular text-[13px] font-bold leading-none">{item.value}</p>
              <p className="truncate text-[12.5px] leading-none text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </Reveal>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-3.5">
          <div role="region" aria-label="Navegação das seções do produto" className="w-full">
            <p id="tabs-hint" className="sr-only">
              Lista de 4 seções em rolagem horizontal. Use as setas esquerda e direita para trocar de seção; o conteúdo é atualizado automaticamente.
            </p>
            <TabsList
              id="recursos"
              aria-label="Seções do produto"
              aria-describedby="tabs-hint"
              className="flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  id={value === "faq" ? "faq" : undefined}
                  className="shrink-0"
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
                  className="rounded-3xl border border-white/5 bg-white/[0.015] p-6"
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
                            className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all hover:bg-white/[0.03] hover:border-white/5"
                          >
                            <div className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
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

          <TabsContent value="seguranca" className="mt-3.5 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["seguranca"].label}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 70}>
                  <FeatureDetailDialog
                    feature={{ title: pillar.title, text: pillar.text, tag: "Segurança" }}
                  >
                    <button
                      type="button"
                      className="interactive-card h-full w-full rounded-2xl border border-white/5 bg-white/[0.015] p-5 text-left transition-all hover:border-white/20 sm:p-6"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
                        <pillar.icon className="size-4" aria-hidden="true" />
                      </span>
                      <p className="mt-2 text-sm font-semibold">{pillar.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pillar.text}</p>
                      <span className="mt-1.5 inline-flex text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Ver detalhes
                      </span>
                    </button>
                  </FeatureDetailDialog>
                </Reveal>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-3.5 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["faq"].label}</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <Reveal key={faq.q} delay={index * 50}>
                  <AccordionItem value={`faq-${index}`} className="border-border/60">
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
