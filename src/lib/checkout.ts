/**
 * Catálogo de planos pagos usado no checkout transparente (Pix).
 * Os preços exibidos aqui são apenas para a interface — o valor cobrado
 * é sempre recalculado no servidor a partir da tabela `plans`.
 */
export type CheckoutCycle = "monthly" | "annual";

export type CheckoutPlan = {
  slug: "free" | "premium" | "premium_ia";
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  highlights: string[];
  details?: {
    title: string;
    description: string;
    items: string[];
  };
  recommended?: boolean;
};

export const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    slug: "free",
    name: "Gratuito",
    tagline: "Para quem está começando a se organizar.",
    monthly: 0,
    annual: 0,
    highlights: [
      "Até 30 lançamentos por mês",
      "Categorias, painel e balancete",
      "Um veículo integrado",
      "Sem custo fixo",
    ],
    details: {
      title: "Comece sua jornada financeira",
      description: "Ideal para quem quer dar o primeiro passo na organização doméstica sem custos fixos.",
      items: [
        "Gestão básica de receitas e despesas",
        "Até 30 lançamentos manuais por mês",
        "Cadastro de 1 veículo para controle de combustível",
        "Acesso ao painel de resumo mensal",
        "Categorias padrão para classificação rápida",
        "Relatório simples de balancete"
      ]
    }
  },
  {
    slug: "premium",
    name: "Premium",
    tagline: "Controle completo, sem limite de lançamentos.",
    monthly: 24.9,
    annual: 249,
    highlights: [
      "Lançamentos ilimitados e até 2 veículos",
      "Orçamentos, metas e compromissos",
      "Combustível com custo por quilômetro",
      "Exportação em CSV e PDF",
    ],
    details: {
      title: "Controle absoluto para sua família",
      description: "Liberdade total para gerenciar cada centavo, com ferramentas avançadas de análise e exportação.",
      items: [
        "Lançamentos e movimentações ilimitadas",
        "Gestão de até 2 veículos simultâneos",
        "Módulo completo de orçamentos e metas",
        "Controle detalhado de cartões de crédito",
        "Monitoramento de gastos com gás e utilidades",
        "Exportação completa para PDF e Planilhas (CSV)",
        "Suporte prioritário via chat"
      ]
    }
  },
  {
    slug: "premium_ia",
    name: "Premium IA",
    tagline: "Tudo do Premium com o Consultor de IA liberado.",
    monthly: 34.9,
    annual: 348,
    recommended: true,
    highlights: [
      "Tudo do Premium, sem cotas",
      "Veículos, metas e links ilimitados",
      "Consultor de IA analisando seus gastos",
      "Créditos mensais de IA inclusos",
      "Recibos e auditoria de cada análise",
    ],
    details: {
      title: "A inteligência a favor do seu bolso",
      description: "O poder da IA para analisar seus padrões de consumo e sugerir economias reais e personalizadas.",
      items: [
        "Tudo o que o plano Premium oferece",
        "Consultor de IA ilimitado para tirar dúvidas",
        "Análise preditiva de dívidas e juros",
        "Sugestões inteligentes baseadas no seu perfil",
        "Relatórios de auditoria gerados por IA",
        "Prioridade máxima no desenvolvimento de novos recursos",
        "Gestão ilimitada de veículos e contas"
      ]
    }
  },
];

export function planBySlug(slug: string) {
  return CHECKOUT_PLANS.find((plan) => plan.slug === slug) ?? CHECKOUT_PLANS[0];
}

export function checkoutPrice(plan: CheckoutPlan, cycle: CheckoutCycle) {
  return cycle === "annual" ? plan.annual : plan.monthly;
}

export const CHECKOUT_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  in_process: "Em análise",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  cancelled: "Pagamento cancelado",
  expired: "Pix expirado",
};
