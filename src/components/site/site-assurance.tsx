import { 
  Fingerprint, 
  KeyRound, 
  Lock, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Appear } from "./appear";

const items = [
  {
    icon: Lock,
    title: "Criptografia Militar",
    text: "Padrão AES-256 para garantir que só você tenha acesso à chave dos seus dados financeiros.",
  },
  {
    icon: KeyRound,
    title: "Autenticação em Duas Etapas",
    text: "Camada extra de proteção via SMS, E-mail ou App Authenticator em cada login.",
  },
  {
    icon: Fingerprint,
    title: "Conformidade LGPD",
    text: "Respeito total à sua privacidade. Seus dados são seus, e você tem controle total sobre eles.",
  },
  {
    icon: ShieldCheck,
    title: "Monitoramento 24/7",
    text: "Nossos sistemas detectam atividades suspeitas e alertam você instantaneamente.",
  },
];

export function SiteAssurance() {
  return (
    <section id="seguranca" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Appear>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-6">
              Privacidade Absoluta
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-8">
              Sua segurança é o nosso <br />
              <span className="text-muted-foreground">maior investimento.</span>
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">
              Não vendemos seus dados para bancos ou seguradoras. Nosso modelo de negócio é baseado na sua confiança, não na sua exposição.
            </p>
            
            <a href="#" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Leia nossa central de segurança
              <ChevronRight size={20} />
            </a>
          </Appear>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <Appear key={item.title} delay={i * 100}>
                <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 hover:bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all">
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <item.icon size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-3">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </Appear>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
