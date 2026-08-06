import { 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  ChevronRight,
  Shield,
  Star,
  Quote
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const faqs = [
  {
    question: "O GastoCerto é gratuito?",
    answer: "Sim! Temos um plano gratuito vitalício para controle básico. Recursos avançados exigem Pro ou Elite."
  },
  {
    question: "Como funciona a IA?",
    answer: "Nossa IA analisa padrões e sugere economias reais e previsões de caixa personalizadas."
  },
  {
    question: "Posso importar dados?",
    answer: "Sim, aceitamos CSV e Excel com mapeamento inteligente e automático de categorias."
  },
  {
    question: "É seguro?",
    answer: "Sim, usamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD."
  }
];

const testimonials = [
  {
    name: "Ricardo Silva",
    role: "Empresário",
    content: "Finalmente consegui organizar minhas contas sem perder horas em planilhas.",
    avatar: "RS"
  },
  {
    name: "Ana Oliveira",
    role: "Designer",
    content: "A interface é impecável. Dá prazer em controlar meus gastos todos os dias.",
    avatar: "AO"
  }
];

export function SiteQuestions() {
  return (
    <section id="faq" className="py-24 bg-[#000c18] relative overflow-hidden border-t border-white/5">
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Coluna 1: FAQ Compacto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              Suporte & Dúvidas
            </div>
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">
              Perguntas <br /> <span className="text-primary">Frequentes</span>
            </h2>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="border border-white/5 bg-white/5 rounded-2xl px-6 overflow-hidden data-[state=open]:border-primary/30 data-[state=open]:bg-white/10 transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-left text-sm font-bold text-white group">
                    <span className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-primary opacity-0 group-data-[state=open]:opacity-100 transition-opacity" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-xs leading-relaxed pb-4 pl-7">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Coluna 2: Depoimentos & Call to Action (Nova Funcionalidade) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="size-32 text-primary" />
              </div>
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <div className="space-y-6">
                  {testimonials.map((t, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium leading-relaxed mb-2">
                          "{t.content}"
                        </p>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {t.name} • {t.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Ainda tem dúvidas?</h3>
                  <p className="text-white/80 text-sm font-medium mb-6">
                    Fale com nosso time de especialistas agora mesmo.
                  </p>
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-black rounded-xl" asChild>
                    <a href="https://wa.me/5568999999999" target="_blank">
                      <MessageSquare className="mr-2 size-4" />
                      Suporte VIP
                    </a>
                  </Button>
                </div>
                <div className="hidden sm:block">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="size-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                  >
                    <Shield className="size-12 text-white" />
                  </motion.div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 size-[400px] bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </section>
  );
}
