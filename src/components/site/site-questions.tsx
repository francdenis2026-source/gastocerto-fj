import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Posso começar gratuitamente?",
    answer: "Sim. O GastoCerto possui um plano gratuito para começar a organizar a rotina financeira e conhecer a plataforma.",
  },
  {
    question: "O sistema funciona no celular?",
    answer: "Sim. A experiência é responsiva e foi organizada para uso tanto no celular quanto no computador.",
  },
  {
    question: "Quais informações posso acompanhar?",
    answer: "Receitas, despesas, cartões, contas, metas e outros recursos disponíveis conforme o plano contratado.",
  },
  {
    question: "Como escolher um plano?",
    answer: "Compare os recursos apresentados na seção de planos e escolha a opção mais adequada à sua rotina.",
  },
];

export function SiteQuestions() {
  return (
    <section id="faq" className="border-t border-white/5 bg-[#000c18] py-12 sm:py-14">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              <Shield className="size-3.5" aria-hidden="true" /> Informações essenciais
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dúvidas frequentes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Respostas rápidas para entender como o GastoCerto funciona antes de começar.</p>
            <Button variant="outline" className="mt-5 h-10 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/recursos">Ver todos os recursos <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Accordion type="single" collapsible className="grid gap-2 sm:grid-cols-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-xl border border-white/8 bg-white/[0.035] px-4 data-[state=open]:border-primary/25 data-[state=open]:bg-white/[0.055]">
                  <AccordionTrigger className="min-h-12 py-3 text-left text-sm font-semibold text-white hover:no-underline">
                    <span className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-6 text-sm leading-5 text-slate-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
