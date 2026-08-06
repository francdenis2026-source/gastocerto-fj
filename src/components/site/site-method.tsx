import { Appear } from "./appear";
import { 
  Zap, 
  Target, 
  Repeat, 
  ArrowRight 
} from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Capture na Hora",
    text: "Gastou? Um toque, um valor, uma categoria. Sem fricção, sem enrolação.",
    tag: "Entrada"
  },
  {
    icon: Target,
    title: "Visualize o Destino",
    text: "Nossos gráficos mostram não só onde você gastou, mas quanto ainda pode gastar.",
    tag: "Planejamento"
  },
  {
    icon: Repeat,
    title: "Automatize a Rotina",
    text: "Deixe que a IA aprenda seus hábitos e automatize previsões e alertas.",
    tag: "Automação"
  },
];

export function SiteMethod() {
  return (
    <section id="metodo" className="py-24 md:py-32 bg-muted/20 relative">
      <div className="shell">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <Appear>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-6">
                O Método GastoCerto
              </h2>
              <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
                Domine sua carteira em <br />
                <span className="text-primary italic">3 etapas simples.</span>
              </h3>
              <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                Não é sobre privação, é sobre clareza. Quando você sabe para onde o dinheiro vai, você decide para onde ele deve ir.
              </p>
              
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <Appear key={step.title} delay={i * 100}>
                    <div className="flex gap-6 items-start p-6 rounded-3xl bg-background border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                        <step.icon size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                          {step.tag}
                        </span>
                        <h4 className="text-xl font-bold text-foreground mb-2">{step.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </Appear>
                ))}
              </div>
            </Appear>
          </div>
          
          <div className="lg:w-1/2 relative">
             <Appear delay={300}>
                <div className="relative aspect-square max-w-lg mx-auto">
                   <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px]" />
                   <div className="relative z-10 w-full h-full rounded-[3rem] border-8 border-background bg-foreground shadow-2xl overflow-hidden flex items-center justify-center p-12">
                      <div className="text-center">
                         <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-8 animate-pulse">
                            <Zap size={48} fill="currentColor" />
                         </div>
                         <p className="text-3xl font-bold text-background mb-4 tracking-tight">Liberdade Financeira</p>
                         <div className="h-2 w-48 bg-background/10 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-primary w-full animate-[progress_3s_infinite]" />
                         </div>
                      </div>
                   </div>
                   
                   {/* Floating indicators */}
                   <div className="absolute -top-6 -left-6 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-border animate-bounce-slow">
                      <div className="text-xs font-bold text-emerald-500">+R$ 450,00</div>
                   </div>
                   <div className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-border animate-bounce-delayed">
                      <div className="text-xs font-bold text-rose-500">-R$ 89,90</div>
                   </div>
                </div>
             </Appear>
          </div>
        </div>
      </div>
    </section>
  );
}
