import { 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Target, 
  Wallet, 
  PieChart 
} from "lucide-react";
import { Appear } from "./appear";

const capabilities = [
  {
    icon: BarChart3,
    title: "Análise Preditiva",
    text: "Nossa IA analisa seus gastos passados para prever quanto você terá no final do mês.",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    icon: ShieldCheck,
    title: "Segurança Bancária",
    text: "Seus dados são criptografados com o mesmo padrão dos maiores bancos do mundo.",
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    icon: Zap,
    title: "Lançamento Instantâneo",
    text: "Interface otimizada para que você registre qualquer gasto em menos de 3 segundos.",
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    icon: Target,
    title: "Metas Dinâmicas",
    text: "Defina objetivos e acompanhe o progresso em tempo real com notificações inteligentes.",
    color: "bg-purple-500/10 text-purple-600"
  },
  {
    icon: Wallet,
    title: "Gestão de Ativos",
    text: "Acompanhe não só gastos, mas todo o seu patrimônio em um único lugar consolidado.",
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    icon: PieChart,
    title: "Relatórios Visuais",
    text: "Gráficos limpos e intuitivos que dizem exatamente para onde seu dinheiro está indo.",
    color: "bg-indigo-500/10 text-indigo-600"
  },
];

export function SiteCapabilities() {
  return (
    <section id="plataforma" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="shell">
        <Appear className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-6">
            Recursos Premium
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
            Poder de banco, <br />
            <span className="text-muted-foreground">simplicidade de app.</span>
          </h3>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Eliminamos a complexidade para que você foque no que importa: <br className="hidden md:block" />
            fazer seu dinheiro trabalhar para você.
          </p>
        </Appear>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((item, i) => (
            <Appear key={item.title} delay={i * 50}>
              <div className="group p-8 rounded-[2rem] bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full">
                <div className={`size-14 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon size={28} />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-4">{item.title}</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </section>
  );
}
