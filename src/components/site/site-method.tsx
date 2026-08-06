import { Appear } from "./appear";

const steps = [
  {
    n: "01",
    title: "Registre em segundos",
    text: "Lançamentos rápidos por categoria, com repetição automática para o que acontece todo mês.",
  },
  {
    n: "02",
    title: "Enxergue o mês inteiro",
    text: "Saldo real, comprometido e projetado. Você sabe o que sobra antes do dia 30 chegar.",
  },
  {
    n: "03",
    title: "Feche e compare",
    text: "Reconciliação mensal, balanço anual e exportação em CSV ou PDF quando precisar provar.",
  },
];

export function SiteMethod() {
  return (
    <section id="metodo" className="band border-t border-border bg-navy-700">
      <div className="shell grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <Appear>
          <p className="kicker">O método</p>
          <h2 className="mt-5 max-w-sm font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] text-bone-100">
            Três passos, repetidos todo mês
          </h2>
          <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-bone-100/50">
            Sem curva de aprendizado. A disciplina vem da rotina, não da ferramenta.
          </p>
        </Appear>

        <div>
          {steps.map((step, i) => (
            <Appear key={step.n} delay={i * 60}>
              <div className="group flex gap-8 border-t border-border py-9 last:border-b transition-colors duration-300 hover:bg-navy-800/30">
                <span className="numeric shrink-0 text-[14px] font-bold text-primary">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-[20px] font-semibold text-bone-100 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-lg text-[16px] leading-relaxed text-bone-100/50">
                    {step.text}
                  </p>
                </div>
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </section>
  );
}
