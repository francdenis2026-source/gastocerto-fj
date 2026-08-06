import { 
  ChevronDown, 
  HelpCircle 
} from "lucide-react";
import { Appear } from "./appear";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O GastoCerto é gratuito?",
    answer: "Sim! Temos um plano gratuito vitalício que permite o controle básico das suas finanças. Para recursos avançados como IA e gestão de cartões, oferecemos planos Pro e Elite."
  },
  {
    question: "Como funciona a IA Consultora?",
    answer: "Nossa inteligência artificial analisa seus padrões de consumo e gera relatórios personalizados com sugestões reais de economia, além de prever seu fluxo de caixa para os próximos meses."
  },
  {
    question: "Posso importar dados de planilhas?",
    answer: "Com certeza. O GastoCerto possui um importador inteligente que aceita arquivos CSV e Excel, mapeando suas categorias automaticamente."
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim, utilizamos criptografia de ponta a ponta e servidores seguros. Além disso, seguimos rigorosamente a LGPD para garantir que sua privacidade seja sempre respeitada."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, não temos fidelidade. Você pode cancelar sua assinatura Pro ou Elite com um clique diretamente nas configurações da sua conta."
  }
];

export function SiteQuestions() {
  return (
    <section id="faq" className="py-16 md:py-20 bg-muted/20">
      <div className="shell max-w-4xl">
        <Appear className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Dúvidas Comuns
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre o GastoCerto.
          </p>
        </Appear>

        <Appear delay={200}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="bg-background border border-border/50 rounded-2xl px-6 overflow-hidden data-[state=open]:border-primary/30 transition-all"
              >
                <AccordionTrigger className="hover:no-underline py-4 text-left text-base font-bold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Appear>

        <Appear delay={400} className="mt-16 text-center">
          <p className="text-muted-foreground">
            Ainda tem dúvidas? <a href="#" className="text-primary font-bold hover:underline">Fale com nosso suporte</a>
          </p>
        </Appear>
      </div>
    </section>
  );
}
