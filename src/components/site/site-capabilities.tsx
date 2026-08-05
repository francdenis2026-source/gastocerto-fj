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
          <p className="mt-5 text-[16px] leading-relaxed text-bone-100/50">
            Recursos pensados para o dia a dia de quem quer clareza, não complexidade.
          </p>
        </Appear>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, i) => (
            <Appear key={item.title} delay={i * 40}>
              <div className="group h-full bg-navy-700 p-8 transition-colors duration-200 hover:bg-navy-600">
                <item.icon className="size-5 text-primary" strokeWidth={1.75} />
                <h3 className="mt-6 font-display text-[17px] font-semibold text-bone-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-bone-100/45">{item.text}</p>
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </section>
  );
}
