import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
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
  Users,
  Wallet,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";


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
    group: "Plataforma",
    caption: "Gestão inteligente",
    items: [
      {
        icon: Receipt,
        title: "Lançamentos Rápidos",
        text: "Despesa ou receita com categoria e parcelas.",
        tag: "Agilidade",
      },
      {
        icon: CreditCard,
        title: "Gestão de Cartões",
        text: "Faturas, limites e vencimentos centralizados.",
        tag: "Controle",
      },
      {
        icon: BarChart3,
        title: "Analytics Avançado",
        text: "Visão consolidada de saldo, gastos e metas.",
        tag: "Inteligência",
      },
      {
        icon: Sparkles,
        title: "Consultor com IA",
        text: "Diagnóstico e plano de saída de dívidas.",
        tag: "Inteligente",
      },
    ],
  },
  {
    group: "Exclusivos",
    caption: "Recursos completos",
    items: [
      {
        icon: Baby,
        title: "Espaço Kids",
        text: "Educação financeira para filhos com PIN.",
        tag: "Família",
      },
      {
        icon: Flame,
        title: "Controle de Gás",
        text: "Previsão de consumo e aviso de reposição.",
        tag: "Inovação",
      },
      {
        icon: Fuel,
        title: "Abastecimentos",
        text: "Consumo médio e detecção de anomalias.",
        tag: "Eficiência",
      },
      {
        icon: ShieldCheck,
        title: "Privacidade Absoluta",
        text: "Criptografia bancária e dados isolados.",
        tag: "Segurança",
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
  { q: "O sistema é seguro?", a: "Sim. Utilizamos criptografia de ponta a ponta e seguimos a LGPD. Cada conta acessa apenas os próprios registros com isolamento total via banco de dados." },
  { q: "Como faço meu cadastro?", a: "Basta clicar em 'Criar Conta Grátis', preencher seu e-mail e senha. Você terá acesso imediato ao painel para começar seus lançamentos." },
  { q: "Como controlo meus gastos?", a: "É simples: registre suas rendas e despesas diárias, categorize-as e use nossos gráficos para visualizar para onde seu dinheiro está indo." },
  { q: "Como funciona o teste gratuito?", a: "Você pode testar todos os recursos Premium por 14 dias. Após esse período, pode escolher um plano ou continuar no plano básico gratuito." },
  { q: "Posso cancelar minha conta?", a: "Sim, o cancelamento é livre e pode ser feito a qualquer momento diretamente nas configurações do seu perfil." },
];

const shortcuts = [
  { label: "Recursos", href: "#recursos", icon: Wallet },
  { label: "Planos", href: "#planos", icon: Sparkles },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
] as const;

const tabs = ["como-funciona", "recursos", "previas", "faq"] as const;
type TabValue = (typeof tabs)[number];

const tabMeta: Record<TabValue, { label: string; description: string }> = {
  "como-funciona": { label: "Como Funciona", description: "3 passos simples para o controle total" },
  recursos: { label: "Recursos", description: "Ferramentas completas para sua gestão" },
  previas: { label: "Prévias", description: "Veja o sistema em ação antes de cadastrar" },
  faq: { label: "Dúvidas", description: "Perguntas frequentes sobre segurança e uso" },
};

export function CompactOverview() {
  const [tab, setTab] = useState<TabValue>("como-funciona");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Só processa se o mouse estiver dentro do container ou próximo (melhor performance)
      const containerRect = containerRef.current.getBoundingClientRect();
      if (e.clientY < containerRect.top - 200 || e.clientY > containerRect.bottom + 200) return;

      if (frameId) cancelAnimationFrame(frameId);
      
      frameId = requestAnimationFrame(() => {
        const cards = containerRef.current?.querySelectorAll('.interactive-card');
        cards?.forEach((card) => {
          const rect = (card as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
          (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

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
    <section id="recursos" ref={containerRef} className="relative section-y overflow-hidden">
      <div className="section-shell relative z-10">
        <Reveal className="text-center mb-8">
          <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-brand transition-all hover:bg-brand/10 cursor-default">
              <Sparkles className="size-3.5" />
              Completo e Seguro
            </span>
          </div>
          <h2 className="section-title">Tudo o que você precisa</h2>
          <p className="mt-6 section-subtitle max-w-3xl mx-auto !text-white/80">
            Analise cada recurso que o GastoCerto oferece. Do controle de combustível ao Espaço Kids, temos tudo o que você precisa para uma gestão impecável.
          </p>
        </Reveal>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-8">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-white/5 p-1 rounded-full">
              {tabs.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-full px-6 py-1.5 data-[state=active]:bg-brand data-[state=active]:text-black transition-all hover:bg-white/10 active:scale-95"
                >
                  {tabMeta[value].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {`Seção ativa: ${tabMeta[tab].label}. ${tabMeta[tab].description}.`}
          </p>

          <TabsContent value="como-funciona" className="mt-3 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["como-funciona"].label}</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "01", title: "Cadastre-se", text: "Crie sua conta em segundos e comece seu teste de 14 dias sem compromisso.", icon: Users, aria: "Passo 1: Cadastre-se" },
                { step: "02", title: "Lance Gastos", text: "Registre suas despesas diárias, rendas e faturas de cartão de forma rápida.", icon: Receipt, aria: "Passo 2: Lance Gastos" },
                { step: "03", title: "Analise", text: "Visualize para onde vai seu dinheiro com gráficos claros e tome decisões inteligentes.", icon: BarChart3, aria: "Passo 3: Analise" },
              ].map((item, idx) => (
                <Reveal 
                  key={item.title} 
                  delay={idx * 100}
                  className="interactive-card rounded-[2rem] p-8 bg-black/40 border border-white/10 shadow-xl group flex flex-col items-center text-center"
                >
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-black text-xl shadow-[0_0_20px_rgba(31,174,109,0.1)]">
                    <item.icon className="size-6 mr-1" aria-hidden="true" /> {item.step}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-sm font-medium text-white/60 leading-relaxed">{item.text}</p>
                </Reveal>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recursos" className="mt-3 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["recursos"].label}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureGroups.map((group, groupIndex) => (
                <Reveal
                  key={group.group}
                  delay={groupIndex * 50}
                  className="interactive-card rounded-[1.5rem] p-8 bg-white/[0.03] border border-white/[0.08] shadow-xl group"
                  tabIndex={0}
                  role="button"
                  aria-label={`Grupo de recursos: ${group.group}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand mb-6 border-b border-brand/10 pb-4 group-hover:tracking-[0.3em] transition-all duration-500">
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
                              <p className="truncate text-[15px] font-bold tracking-tight text-white/95">{item.title}</p>
                              <p className="truncate body-text !text-[12px] !font-medium leading-relaxed opacity-60">{item.tag}</p>
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


          <TabsContent value="previas" className="mt-3 outline-none panel-enter" tabIndex={0}>
            <h3 className="sr-only">{tabMeta["previas"].label}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { 
                  title: "Painel Principal", 
                  desc: "Visão 360º de receitas, despesas e saldo disponível.", 
                  icon: LayoutDashboard,
                  action: "Ver Demo",
                  link: "/demonstracao"
                },
                { 
                  title: "Gestão de Veículos", 
                  desc: "Média de consumo, gastos por KM e alertas de manutenção.", 
                  icon: Car,
                  action: "Ver Detalhes",
                  feature: { title: "Abastecimentos", text: "Consumo médio e detecção de anomalias." }
                },
                { 
                  title: "Consultor IA", 
                  desc: "Diagnósticos inteligentes sobre seus hábitos financeiros.", 
                  icon: Sparkles,
                  action: "Conhecer IA",
                  feature: { title: "Consultor financeiro com IA", text: "Diagnóstico e plano de saída de dívidas." }
                },
              ].map((item, idx) => (
                <Reveal key={item.title} delay={idx * 100}>
                  <div className="interactive-card rounded-[1.5rem] p-6 bg-white/[0.03] border border-white/[0.08] shadow-xl group flex flex-col h-full">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <item.icon className="size-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs font-medium text-white/50 leading-relaxed mb-6 flex-1">{item.desc}</p>
                    
                    {item.link ? (
                      <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-white/10 hover:bg-brand hover:text-black hover:border-brand transition-all font-bold group">
                        <Link to={item.link}>
                          {item.action}
                          <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    ) : (
                      <FeatureDetailDialog feature={item.feature!}>
                        <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10 hover:bg-brand hover:text-black hover:border-brand transition-all font-bold group">
                          {item.action}
                          <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </FeatureDetailDialog>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-3.5 outline-none panel-enter" tabIndex={0}>

            <h3 className="sr-only">{tabMeta["faq"].label}</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <Reveal key={faq.q} delay={index * 50} className="group">
                  <AccordionItem value={`faq-${index}`} className="px-4 rounded-xl mb-1 last:mb-0 transition-all hover:bg-white/[0.02]">
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
