import {
  Banknote,
  CreditCard,
  Fuel,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
import { Appear } from "./appear";

const capabilities = [
  {
    icon: LineChart,
    title: "Painel unificado",
    text: "Receitas, despesas, saldo e projeção do mês em uma leitura só — sem planilhas paralelas.",
  },
  {
    icon: CreditCard,
    title: "Cartões e parcelas",
    text: "Faturas, parcelamentos e vencimentos organizados até a última prestação.",
  },
  {
    icon: Fuel,
    title: "Combustível e gás",
    text: "Consumo do veículo e troca do botijão acompanhados por média real de uso.",
  },
  {
    icon: Banknote,
    title: "Contas fixas",
    text: "Energia, água, internet e assinaturas com aviso antes de virar juros.",
  },
  {
    icon: Users,
    title: "Espaço Kids",
    text: "Mesada automática, metas e recompensas para ensinar dinheiro na prática.",
  },
  {
    icon: Sparkles,
    title: "Análise inteligente",
    text: "Leitura dos seus números com sugestões objetivas de onde economizar.",
  },
];

export function SiteCapabilities() {
  return (
    <section id="plataforma" className="band bg-navy-800">
      <div className="shell">
        <Appear className="max-w-2xl">
          <p className="kicker">A plataforma</p>
          <h2 className="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.1] text-bone-100">
            Tudo o que a sua vida financeira exige — em um só lugar
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-bone-100/50">
            Recursos pensados para o dia a dia de quem quer clareza, não complexidade.
          </p>
        </Appear>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, i) => (
            <Appear key={item.title} delay={i * 40}>
              <div className="group h-full rounded-2xl border border-border/50 bg-navy-700 p-8 transition-all duration-300 hover:bg-navy-600 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.99] focus-within:ring-2 focus-within:ring-primary/20">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-500/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="size-5" strokeWidth={2} />
                </div>
                <h3 className="mt-6 font-display text-[18px] font-semibold text-bone-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-bone-100/50">{item.text}</p>
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </section>
  );
}
