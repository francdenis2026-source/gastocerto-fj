import heroFinance from "@/assets/hero-finance.jpg";
import heroWorkspace from "@/assets/hero-workspace.jpg";
import heroDeskNight from "@/assets/hero-desk-night.jpg";
import kidsHero from "@/assets/kids-login-hero.jpg";
import adminConsole from "@/assets/admin-console-bg.jpg";

export type FeatureAction = { label: string; to: string; search?: Record<string, string> };

export type FeatureDetail = {
  title: string;
  tag?: string;
  summary: string;
  overview: string[];
  howItWorks: string[];
  benefits: string[];
  actions: FeatureAction[];
  screenshot: string;
  screenshotAlt: string;
};

const screenshots = {
  painel: heroFinance,
  veiculo: heroWorkspace,
  casa: heroDeskNight,
  kids: kidsHero,
  ia: adminConsole,
} as const;

type Overrides = Partial<Omit<FeatureDetail, "title">> & { screenshotKey?: keyof typeof screenshots };

/**
 * Conteúdo detalhado por recurso. O que não tiver texto próprio recebe
 * um roteiro genérico coerente com o módulo, para nunca abrir modal vazio.
 */
const overrides: Record<string, Overrides> = {
  "Lançamentos em 10s": {
    screenshotKey: "painel",
    overview: [
      "Registre uma despesa ou receita em poucos toques, com categoria, data, valor e anexo do comprovante.",
      "Aceita data retroativa, parcelas e lançamento em lote para quando você quiser colocar a semana em dia.",
    ],
    howItWorks: [
      "Abra Lançamentos e escolha entre despesa, receita ou recorrente.",
      "Informe valor, categoria e data — o sistema sugere a categoria mais usada.",
      "Anexe a nota ou o comprovante e salve: o painel do mês atualiza na hora.",
    ],
    benefits: [
      "Menos esquecimento: o registro leva segundos e cabe na rotina.",
      "Comprovante junto do lançamento, pronto para conferência.",
      "Parcelas controladas sem planilha paralela.",
    ],
    actions: [
      { label: "Abrir lançamentos", to: "/lancamentos" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Gás de cozinha": {
    screenshotKey: "casa",
    overview: [
      "Controle cada botijão comprado, quanto tempo durou e quando o próximo deve acabar.",
      "A troca entra automaticamente como despesa da casa, sem lançamento manual.",
    ],
    howItWorks: [
      "Cadastre a compra do botijão com data e valor.",
      "O sistema calcula a duração média entre as trocas.",
      "Você recebe aviso quando a previsão indicar que está acabando.",
    ],
    benefits: [
      "Fim da surpresa de ficar sem gás no meio da semana.",
      "Comparação de preço entre revendas ao longo do ano.",
      "Custo mensal real da cozinha no relatório.",
    ],
    actions: [
      { label: "Abrir controle de gás", to: "/gas" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  Abastecimentos: {
    screenshotKey: "veiculo",
    overview: [
      "Cada abastecimento guarda litros, preço por litro e odômetro, com validação de coerência.",
      "Registros incoerentes geram alerta em vez de contaminar o consumo médio.",
    ],
    howItWorks: [
      "Cadastre o veículo e o combustível usado (incluindo flex).",
      "Lance o abastecimento com litros, valor e quilometragem.",
      "O consumo médio e o custo por km são recalculados a cada registro.",
    ],
    benefits: [
      "Consumo médio confiável por veículo.",
      "Detecção de anomalia de odômetro e de preço.",
      "Base sólida para negociar frete, corrida ou reembolso.",
    ],
    actions: [
      { label: "Abrir veículos", to: "/veiculos" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Espaço Kids": {
    screenshotKey: "kids",
    overview: [
      "Um painel simplificado por criança, com PIN próprio, avatar, tema visual e saldo disponível.",
      "Os pais escolhem o que cada criança vê e recebem resumo no painel principal.",
    ],
    howItWorks: [
      "Cadastre a criança no Espaço Kids e defina código e PIN.",
      "Configure visibilidade, mesada e metas de poupança.",
      "A criança entra pela homepage com o próprio código e vê apenas o painel dela.",
    ],
    benefits: [
      "Educação financeira com autonomia segura.",
      "Mesada e presentes registrados como despesa com filhos, automaticamente.",
      "Bloqueio temporário após tentativas de PIN incorretas.",
    ],
    actions: [
      { label: "Abrir Espaço Kids", to: "/kids" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  PIX: {
    screenshotKey: "kids",
    overview: [
      "Envie valores por PIX para a conta de uma criança ou de outro usuário do sistema.",
      "Cada envio gera histórico, comprovante e aviso imediato para quem recebeu.",
    ],
    howItWorks: [
      "Escolha o destinatário e o valor no painel de transferências.",
      "Confirme o envio: a cobrança PIX é gerada automaticamente.",
      "Ao aprovar, os dois painéis atualizam em tempo real com comprovante.",
    ],
    benefits: [
      "Mesada sem dinheiro em espécie.",
      "Histórico exportável em CSV e PDF.",
      "Lançamento automático nas duas pontas, sem digitar duas vezes.",
    ],
    actions: [
      { label: "Ver transferências", to: "/kids" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Consultor financeiro com IA": {
    screenshotKey: "ia",
    overview: [
      "Diagnóstico do mês em linguagem simples, com plano de saída de dívidas e prioridades.",
      "Disponível nos planos pagos, com consumo de créditos registrado em auditoria.",
    ],
    howItWorks: [
      "A IA lê seus lançamentos do período selecionado.",
      "Ela aponta os maiores vazamentos e sugere um plano de corte realista.",
      "Cada consulta fica no histórico, com créditos consumidos visíveis.",
    ],
    benefits: [
      "Orientação objetiva sem contratar consultoria.",
      "Plano de dívidas ordenado por juros e prazo.",
      "Transparência total de uso de créditos.",
    ],
    actions: [
      { label: "Ver planos", to: "/#planos" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Cartões de crédito e débito": {
    screenshotKey: "painel",
    actions: [
      { label: "Abrir cartões", to: "/cartoes" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Balanço anual e relatórios": {
    screenshotKey: "painel",
    actions: [
      { label: "Abrir balanço anual", to: "/balanco-anual" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Fechamento e conciliação": {
    screenshotKey: "painel",
    actions: [
      { label: "Abrir conciliação", to: "/reconciliacao" },
      { label: "Criar conta grátis", to: "/auth" },
    ],
  },
  "Plano Gratuito": {
    screenshotKey: "painel",
    summary: "Para conhecer o sistema sem pagar nada e começar sua jornada financeira.",
    overview: [
      "Até 30 lançamentos por mês, categorias completas e painel mensal.",
      "Teste completo de todos os recursos (Premium IA) por 14 dias liberado no cadastro.",
    ],
    howItWorks: [
      "Crie sua conta em segundos usando apenas CPF e senha.",
      "Comece a lançar seus gastos e veja o painel ser montado.",
      "Não pede cartão de crédito para o período de teste.",
    ],
    benefits: [
      "Controle inicial básico sem custo fixo.",
      "Liberdade para exportar seus dados se decidir não assinar.",
      "Acesso à comunidade e suporte via FAQ.",
    ],
    actions: [{ label: "Começar Grátis", to: "/auth?mode=signup" }],
  },
  "Plano Premium": {
    screenshotKey: "veiculo",
    summary: "Controle total, previsões e relatórios detalhados para quem quer organização séria.",
    overview: [
      "Lançamentos ilimitados, controle de combustível, gás e orçamentos por categoria.",
      "Gestão de múltiplos veículos, metas de poupança e links de compartilhamento seguro.",
    ],
    howItWorks: [
      "Assine via Pix com liberação imediata.",
      "Configure seus veículos, cartões e metas de orçamento.",
      "Exporte relatórios em PDF/Excel para sua contabilidade ou arquivo.",
    ],
    benefits: [
      "Visão completa do patrimônio e tendências de gastos.",
      "Economia real detectando desperdícios em veículos e casa.",
      "Segurança jurídica com auditoria e exportação ilimitada.",
    ],
    actions: [{ label: "Assinar Premium", to: "/auth?mode=signup" }],
  },
  "Plano Premium IA": {
    screenshotKey: "ia",
    summary: "A experiência definitiva com inteligência artificial analisando suas finanças.",
    overview: [
      "Tudo do Premium liberado, agora sem qualquer cota ou limite.",
      "Consultor de IA integrado que dá dicas, faz planos de dívidas e diagnósticos.",
    ],
    howItWorks: [
      "Assine o plano IA via Pix.",
      "Clique em 'Consultor IA' no painel: a IA analisa seu comportamento financeiro.",
      "Receba orientações personalizadas baseadas em dados reais, não apenas genéricas.",
    ],
    benefits: [
      "Coach financeiro 24h por dia por uma fração do custo.",
      "Identificação rápida de padrões de gastos nocivos.",
      "Créditos mensais inclusos para uma análise profunda recorrente.",
    ],
    actions: [{ label: "Assinar Premium IA", to: "/auth?mode=signup" }],
  },
};

function pickScreenshot(title: string, tag?: string): keyof typeof screenshots {
  const key = `${title} ${tag ?? ""}`.toLowerCase();
  if (key.includes("kid") || key.includes("pix") || key.includes("mesada")) return "kids";
  if (key.includes("ia") || key.includes("segur") || key.includes("lgpd")) return "ia";
  if (key.includes("veíc") || key.includes("combust") || key.includes("km") || key.includes("odô"))
    return "veiculo";
  if (key.includes("gás") || key.includes("casa") || key.includes("mercado")) return "casa";
  return "painel";
}

/** Monta o detalhamento completo de um recurso, com fallback coerente. */
export function getFeatureDetail(input: { title: string; text: string; tag?: string }): FeatureDetail {
  const custom = overrides[input.title] ?? {};
  const screenshotKey = custom.screenshotKey ?? pickScreenshot(input.title, input.tag);

  return {
    title: input.title,
    tag: input.tag,
    summary: custom.summary ?? input.text,
    overview:
      custom.overview ?? [
        input.text,
        "Tudo fica integrado ao painel do mês: o que você registra aqui aparece nos relatórios, nos orçamentos e no balanço anual.",
      ],
    howItWorks:
      custom.howItWorks ?? [
        "Abra o módulo correspondente no painel do cliente.",
        "Preencha os dados pedidos — o sistema valida datas e valores incoerentes.",
        "Acompanhe o resultado nos gráficos e relatórios do período.",
      ],
    benefits:
      custom.benefits ?? [
        "Menos tempo organizando, mais clareza sobre o mês.",
        "Histórico auditável, com exportação em CSV e PDF.",
        "Dados isolados por conta, seguindo a LGPD.",
      ],
    actions: custom.actions ?? [
      { label: "Criar conta grátis", to: "/auth" },
      { label: "Ver planos", to: "/#planos" },
    ],
    screenshot: screenshots[screenshotKey],
    screenshotAlt: `Tela do GastoCerto ilustrando ${input.title}`,
  };
}
