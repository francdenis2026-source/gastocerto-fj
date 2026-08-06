import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Appear } from "./appear";

const questions = [
  {
    q: "Preciso conectar meu banco?",
    a: "Não. O GastoCerto funciona com lançamentos que você controla, o que mantém seus dados bancários fora da plataforma. Você registra em segundos e as repetições acontecem automaticamente.",
  },
  {
    q: "Funciona bem no celular?",
    a: "Sim. A interface foi construída para uso móvel: lançamento rápido, navegação por abas e leitura confortável em qualquer tela.",
  },
  {
    q: "Como funciona o teste de 14 dias?",
    a: "Ao criar a conta gratuita você usa todos os recursos pagos por 14 dias. Se não assinar, o plano Essencial continua ativo e nada é cobrado.",
  },
  {
    q: "Consigo levar meus dados embora?",
    a: "Sempre. Exportação em CSV e PDF de lançamentos, balanço mensal e anual, sem bloqueios.",
  },
  {
    q: "Serve para a família toda?",
    a: "Sim. O plano Família permite múltiplas contas na mesma casa e o Espaço Kids, com mesada automática, metas e recompensas para as crianças.",
  },
];

export function SiteQuestions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="band border-t border-border bg-navy-800">
      <div className="shell grid gap-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-24">
        <Appear>
          <p className="kicker">Dúvidas</p>
          <h2 className="mt-5 font-display text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold leading-[1.12] text-bone-100">
            Respostas diretas
          </h2>
        </Appear>

        <div>
          {questions.map((item, i) => {
            const active = open === i;
            return (
              <div key={item.q} className="border-t border-border last:border-b">
                <button
                  type="button"
                  onClick={() => setOpen(active ? null : i)}
                  aria-expanded={active}
                  aria-controls={`q-panel-${i}`}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left outline-none transition-colors duration-200 hover:text-primary focus-visible:text-primary"
                >
                  <span className="font-display text-[16px] font-semibold text-bone-100">
                    {item.q}
                  </span>
                  <Plus
                    className={cn(
                      "size-4 shrink-0 text-primary transition-transform duration-200",
                      active && "rotate-45",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      id={`q-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-7 text-[15px] leading-relaxed text-bone-100/50">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
