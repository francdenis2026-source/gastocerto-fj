import {
  Baby,
  Beef,
  Droplets,
  Dumbbell,
  Home,
  PartyPopper,
  Scissors,
  Shirt,
  Smartphone,
  Wifi,
  Boxes,
  type LucideIcon,
} from "lucide-react";

/**
 * Áreas dedicadas de consumo (`/consumo/$slug`).
 *
 * Cada serviço acompanhado mês a mês ganha uma página própria com resumo,
 * histórico de 6 meses e lançamento rápido. Antes todos apontavam para
 * `/lancamentos`, o que confundia o usuário ao clicar em "Água" ou "Açougue".
 */
export type ServiceArea = {
  slug: string;
  label: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  /** Palavras usadas para casar categoria e descrição do lançamento. */
  match: string[];
};

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "agua",
    label: "Água e Esgoto",
    eyebrow: "Consumo",
    description: "Acompanhe a conta de água mês a mês e compare o consumo.",
    icon: Droplets,
    match: ["água", "agua", "esgoto", "saneamento", "sanepar", "sabesp", "casan", "caesb", "cagece"],
  },
  {
    slug: "internet",
    label: "Internet e TV",
    eyebrow: "Consumo",
    description: "Planos de internet, TV e streaming registrados no mês.",
    icon: Wifi,
    match: ["internet", "wifi", "wi-fi", "fibra", "tv", "streaming", "netflix", "banda larga"],
  },
  {
    slug: "moradia",
    label: "Aluguel e Moradia",
    eyebrow: "Consumo",
    description: "Aluguel, condomínio, IPTU e manutenção da casa.",
    icon: Home,
    match: ["aluguel", "moradia", "condomínio", "condominio", "iptu", "casa", "imóvel", "imovel"],
  },
  {
    slug: "acougue",
    label: "Açougue e Feira",
    eyebrow: "Alimentação",
    description: "Carnes, frutas, legumes e compras da feira.",
    icon: Beef,
    match: ["açougue", "acougue", "carne", "feira", "frutas", "legumes", "hortifruti", "peixaria"],
  },
  {
    slug: "barbeiro",
    label: "Barbeiro e Estética",
    eyebrow: "Cuidados",
    description: "Cabelo, barba, salão e cuidados pessoais.",
    icon: Scissors,
    match: ["barbeiro", "barbearia", "cabelo", "barba", "salão", "salao", "estética", "estetica", "manicure"],
  },
  {
    slug: "academia",
    label: "Academia e Saúde",
    eyebrow: "Bem-estar",
    description: "Mensalidade da academia, treinos e saúde preventiva.",
    icon: Dumbbell,
    match: ["academia", "treino", "fitness", "crossfit", "pilates", "personal", "saúde", "saude"],
  },
  {
    slug: "celular",
    label: "Celular e Recargas",
    eyebrow: "Consumo",
    description: "Planos de telefonia, recargas e créditos.",
    icon: Smartphone,
    match: ["celular", "recarga", "telefone", "telefonia", "crédito", "credito", "chip", "vivo", "claro", "tim"],
  },
  {
    slug: "vestuario",
    label: "Vestuário e Moda",
    eyebrow: "Compras",
    description: "Roupas, calçados e acessórios do período.",
    icon: Shirt,
    match: ["vestuário", "vestuario", "roupa", "calçado", "calcado", "sapato", "moda", "tênis", "tenis"],
  },
  {
    slug: "lazer",
    label: "Churrascos e Lazer",
    eyebrow: "Lazer",
    description: "Churrascos, saídas de fim de semana e entretenimento.",
    icon: PartyPopper,
    match: ["churrasco", "lazer", "festa", "bar", "cinema", "passeio", "viagem", "restaurante"],
  },
  {
    slug: "mesadas",
    label: "Mesadas e Filhos",
    eyebrow: "Família",
    description: "Mesadas, escola e gastos com os filhos.",
    icon: Baby,
    match: ["mesada", "filho", "criança", "crianca", "escola", "dependente", "brinquedo"],
  },
  {
    slug: "outros",
    label: "Outros Serviços",
    eyebrow: "Consumo",
    description: "Serviços variados que não têm área própria.",
    icon: Boxes,
    match: ["outros", "diversos", "serviço", "servico", "variados"],
  },
];

export function findServiceArea(slug: string | undefined) {
  return SERVICE_AREAS.find((area) => area.slug === slug);
}

/** Normaliza texto para comparação sem acento e sem caixa. */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesArea(area: ServiceArea, text: string) {
  const haystack = normalize(text);
  return area.match.some((needle) => haystack.includes(normalize(needle)));
}
