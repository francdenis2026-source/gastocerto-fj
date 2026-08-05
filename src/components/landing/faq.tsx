import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso conectar minha conta bancária?",
    a: "Não. O GastoCerto funciona com lançamentos manuais rápidos e importação de arquivos. Você mantém controle total, sem expor credenciais bancárias.",
  },
  {
    q: "O plano gratuito tem limite de tempo?",
    a: "O plano Essencial é gratuito por 14 dias com acesso às funções principais. Depois você escolhe continuar em um plano pago ou seguir com recursos limitados.",
  },
  {
    q: "Como funciona o Espaço Kids?",
    a: "É um ambiente protegido por PIN onde seus filhos acompanham mesada, metas e recompensas com uma interface simplificada e segura.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Utilizamos criptografia em trânsito e em repouso, isolamento por usuário no banco de dados e conformidade com a LGPD.",
  },
  {
    q: "Consigo usar no celular como um aplicativo?",
    a: "Sim. A interface é otimizada para toque e pode ser instalada na tela inicial, funcionando com a fluidez de um aplicativo nativo.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem burocracia e sem taxas de cancelamento. Você continua com acesso até o fim do período já pago.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-y bg-[#020617] border-t border-white/5">
      <div className="section-shell">
        <Reveal className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-5">
            <HelpCircle className="size-3.5" aria-hidden="true" />
            Perguntas Frequentes
          </div>
          <h2 className="text-3xl md:text-[3rem] font-black tracking-tight text-white leading-tight">
            Tudo o que você precisa saber
          </h2>
        </Reveal>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 40}>
                <div
                  className={cn(
                    "rounded-2xl border bg-slate-900/40 transition-all duration-200",
                    isOpen
                      ? "border-primary/40 shadow-[0_12px_32px_-16px_rgba(31,174,109,0.35)]"
                      : "border-white/5 hover:border-white/15 hover:bg-slate-900/60",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full min-h-14 items-center justify-between gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
                  >
                    <span className="min-w-0 text-[15px] md:text-base font-bold text-white">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                        isOpen ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 text-slate-400",
                      )}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[15px] leading-relaxed text-slate-400">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
