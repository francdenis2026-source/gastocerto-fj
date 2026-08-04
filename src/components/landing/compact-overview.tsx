
import { Link } from "@tanstack/react-router";
import { 
  Sparkles, 
  ArrowRight, 
  PlayCircle, 
  ShieldCheck, 
  Zap, 
  Bot, 
  Target, 
  CreditCard,
  Car,
  Receipt,
  Flame,
  BarChart3,
  CalendarClock,
  Wallet,
  Lock,
  ChevronRight,
  Plus
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DemoDialog } from "@/components/landing/demo-dialog";

const featureGroups = [
  {
    id: "dia-a-dia",
    label: "Controle Diário",
    icon: Zap,
    description: "Gerencie cada centavo com velocidade e precisão absoluta.",
    features: [
      { icon: Receipt, title: "Lançamentos Rápidos", desc: "Registre gastos em menos de 10 segundos com IA." },
      { icon: CreditCard, title: "Gestão de Cartões", desc: "Faturas, limites e parcelas de todos os seus bancos." },
      { icon: CalendarClock, title: "Contas Fixas", desc: "Automação de aluguel, internet e assinaturas mensais." },
      { icon: Flame, title: "Previsão de Gás", desc: "Saiba exatamente quando o seu botijão vai acabar." }
    ]
  },
  {
    id: "inteligencia",
    label: "IA & Análise",
    icon: Bot,
    description: "Deixe nossa IA trabalhar para o seu futuro financeiro.",
    features: [
      { icon: Bot, title: "Consultor de IA", desc: "Insights personalizados baseados no seu perfil de gastos." },
      { icon: BarChart3, title: "Balanço Anual", desc: "Visão macro da sua evolução patrimonial ao longo dos meses." },
      { icon: Target, title: "Metas de Longo Prazo", desc: "Planeje sua aposentadoria ou a compra do seu imóvel." },
      { icon: Car, title: "Custo por Quilômetro", desc: "Análise profunda da eficiência e gastos do seu veículo." }
    ]
  }
];

const faqs = [
  { q: "O GameCarto é realmente gratuito?", a: "Sim! Oferecemos um plano gratuito robusto que permite que você comece sua jornada financeira sem custos. À medida que suas necessidades crescem, você pode migrar para planos Premium." },
  { q: "Meus dados bancários estão seguros?", a: "Segurança é nossa prioridade #1. Utilizamos criptografia de nível militar (AES-256) e não armazenamos senhas bancárias. Seus dados são seus e de mais ninguém." },
  { q: "Posso acessar pelo celular?", a: "Com certeza. Nossa plataforma é PWA de alta performance, funcionando como um app nativo no iOS e Android, inclusive com modo offline." }
];

export function CompactOverview() {
  return (
    <section id="explorar" className="py-24 lg:py-32 bg-secondary/20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <Reveal delay={100}>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                Poderoso por dentro. <span className="text-primary italic">Simples</span> por fora.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                Combinamos as ferramentas mais avançadas de gestão com uma experiência de usuário 
                fluida e minimalista. Tudo o que você precisa, sem a complexidade desnecessária.
              </p>
            </Reveal>
          </div>
          
          <Reveal delay={300} className="hidden lg:block pb-2">
             <DemoDialog>
               <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl">
                 <PlayCircle className="size-5" />
                 Ver demonstração interativa
               </button>
             </DemoDialog>
          </Reveal>
        </div>

        <Tabs defaultValue="dia-a-dia" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-card border border-border p-1.5 h-auto rounded-2xl">
              {featureGroups.map(group => (
                <TabsTrigger 
                  key={group.id} 
                  value={group.id}
                  className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all"
                >
                  <group.icon className="size-4 mr-2" />
                  {group.label}
                </TabsTrigger>
              ))}
              <TabsTrigger 
                value="faq"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all"
              >
                <ShieldCheck className="size-4 mr-2" />
                Dúvidas
              </TabsTrigger>
            </TabsList>
          </div>

          {featureGroups.map(group => (
            <TabsContent key={group.id} value={group.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="p-8 rounded-[32px] bg-card border border-border shadow-xl">
                    <h3 className="text-2xl font-black text-foreground mb-4">{group.label}</h3>
                    <p className="text-muted-foreground font-medium mb-8">{group.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {group.features.map((f, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-colors group">
                          <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <f.icon className="size-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm mb-1">{f.title}</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                   <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   <div className="relative rounded-[40px] border border-border bg-card p-4 shadow-2xl overflow-hidden aspect-[4/3] lg:aspect-auto">
                      <div className="w-full h-full bg-secondary/50 rounded-[32px] flex items-center justify-center">
                        <group.icon className="size-24 text-primary opacity-20 animate-pulse" />
                        <div className="absolute bottom-12 left-12 right-12 p-6 rounded-2xl bg-background/80 backdrop-blur border border-border">
                           <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Destaque do Módulo</p>
                           <p className="text-base font-bold text-foreground">{group.description}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="faq" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto py-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-border bg-card rounded-2xl px-6">
                    <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary transition-colors">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground font-medium text-base pb-6 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function HelpCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
