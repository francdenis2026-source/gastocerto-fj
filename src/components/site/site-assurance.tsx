import { Fingerprint, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { Appear } from "./appear";

const items = [
  {
    icon: Lock,
    title: "Criptografia ponta a ponta",
    text: "Dados protegidos em trânsito e em repouso, isolados por conta.",
  },
  {
    icon: KeyRound,
    title: "Meses fechados com senha",
    text: "Períodos encerrados só podem ser alterados com reautenticação.",
  },
  {
    icon: Fingerprint,
    title: "Trilha de auditoria",
    text: "Cada alteração fica registrada com autor, data e valor anterior.",
  },
  {
    icon: ShieldCheck,
    title: "Você é o dono",
    text: "Exportação completa a qualquer momento. Sem venda de dados, nunca.",
  },
];

export function SiteAssurance() {
  return (
    <section id="seguranca" className="band border-t border-border/40 bg-navy-900">
      <div className="shell">
        <Appear className="max-w-2xl">
          <p className="kicker">Segurança</p>
          <h2 className="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] text-bone-100">
            Dinheiro é assunto sério. Tratamos como tal.
          </h2>
        </Appear>

        <div className="mt-14 grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {items.map((item, i) => (
            <Appear key={item.title} delay={i * 40}>
              <div className="flex gap-5 border-t border-border pt-7">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
                <div>
                  <h3 className="font-display text-[16px] font-semibold text-bone-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-bone-100/45">{item.text}</p>
                </div>
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </section>
  );
}
