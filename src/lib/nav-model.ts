import {
  ArrowLeftRight,
  BarChart3,
  Baby,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  PiggyBank,
  Settings2,
  ShieldCheck,
  User2,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Modelo único de navegação da área do cliente.
 *
 * Por que existe: antes cada superfície (sidebar desktop, menu mobile, abas do
 * header) tinha sua própria lista, o que gerava rotas órfãs (acessíveis só por
 * link interno) e classificação incoerente (ex.: Agenda dentro de "Ajuda").
 * Centralizando aqui, qualquer rota nova aparece em todas as superfícies.
 */

export type NavChild = {
  key: string;
  label: string;
  to: string;
  /** Palavras extras para a busca rápida (Ctrl+K). */
  keywords?: string;
  /** Rota interna de detalhe: não polui o menu, mas é encontrável na busca. */
  hidden?: boolean;
  highlight?: boolean;
};

export type NavGroup = {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /** Resumo curto exibido no menu mobile e na busca. */
  hint?: string;
  children?: NavChild[];
};

export type NavSection = {
  key: string;
  label: string;
  groups: NavGroup[];
};

export const navSections: NavSection[] = [
  {
    key: "daily",
    label: "Dia a dia",
    groups: [
      {
        key: "overview",
        label: "Visão geral",
        to: "/painel",
        icon: LayoutDashboard,
        hint: "Saldo, alertas e resumo do mês",
        children: [
          { key: "overview.panel", label: "Painel de controle", to: "/painel", keywords: "dashboard saldo resumo" },
          { key: "overview.daily", label: "Histórico detalhado", to: "/diario", keywords: "extrato diário" },
        ],
      },
      {
        key: "entries",
        label: "Movimentações",
        to: "/lancamentos",
        icon: ArrowLeftRight,
        hint: "Despesas, receitas, fixos e cartões",
        children: [
          { key: "entries.expenses", label: "Despesas", to: "/lancamentos", keywords: "gastos lançar compras" },
          { key: "entries.incomes", label: "Receitas", to: "/receitas", keywords: "salário entradas ganhos" },
          { key: "entries.recurring", label: "Fixos e assinaturas", to: "/recorrencia", keywords: "recorrente mensalidade" },
          { key: "entries.cards", label: "Cartões", to: "/cartoes", keywords: "crédito débito fatura parcelas" },
          { key: "entries.receipts", label: "Comprovantes", to: "/comprovantes", keywords: "notas recibos anexos" },
        ],
      },
      {
        key: "agenda",
        label: "Agenda",
        to: "/calendario",
        icon: CalendarClock,
        hint: "Vencimentos e lembretes do mês",
        children: [
          { key: "agenda.calendar", label: "Calendário e alertas", to: "/calendario", keywords: "vencimento lembrete" },
        ],
      },
    ],
  },
  {
    key: "plan",
    label: "Planejar",
    groups: [
      {
        key: "planning",
        label: "Planejamento",
        to: "/orcamentos",
        icon: PiggyBank,
        hint: "Orçamentos, metas e dívidas",
        children: [
          { key: "planning.budgets", label: "Orçamentos", to: "/orcamentos", keywords: "limite categoria teto" },
          { key: "planning.goals", label: "Metas de poupança", to: "/metas", keywords: "objetivo reserva guardar" },
          { key: "planning.commitments", label: "Dívidas e compromissos", to: "/compromissos", keywords: "parcelas empréstimo boleto" },
          { key: "planning.payoff", label: "Plano de quitação", to: "/pagar-dividas", keywords: "quitar dívida bola de neve juros" },
        ],
      },
      {
        key: "consumption",
        label: "Consumo",
        to: "/gas",
        icon: Zap,
        hint: "Serviços e gastos mensais",
        children: [
          { key: "consumption.gas", label: "Gás de Cozinha", to: "/gas", keywords: "botijão glp" },
          { key: "consumption.fuel", label: "Combustível", to: "/veiculos", keywords: "gasolina álcool diesel" },
          { key: "consumption.energy", label: "Energia Elétrica", to: "/energia", keywords: "luz conta" },
          { key: "consumption.water", label: "Água e Esgoto", to: "/consumo/agua", keywords: "sanepar sabesp casan conta" },
          { key: "consumption.internet", label: "Internet e TV", to: "/consumo/internet", keywords: "wifi fibra cabo" },
          { key: "consumption.rent", label: "Aluguel e Moradia", to: "/consumo/moradia", keywords: "casa condomínio" },
          { key: "consumption.food", label: "Açougue e Feira", to: "/consumo/acougue", keywords: "carne frutas legumes" },
          { key: "consumption.personal", label: "Barbeiro e Estética", to: "/consumo/barbeiro", keywords: "cabelo barba salão" },
          { key: "consumption.gym", label: "Academia e Saúde", to: "/consumo/academia", keywords: "treino fitness crossfit" },
          { key: "consumption.recharge", label: "Celular e Recargas", to: "/consumo/celular", keywords: "telefone créditos" },
          { key: "consumption.clothing", label: "Vestuário e Moda", to: "/consumo/vestuario", keywords: "roupa calçado" },
          { key: "consumption.leisure", label: "Churrascos e Lazer", to: "/consumo/lazer", keywords: "fim de semana festa" },
          { key: "consumption.kids", label: "Mesadas e Filhos", to: "/kids", keywords: "dependentes escola" },
          { key: "consumption.others", label: "Outros Serviços", to: "/consumo/outros", keywords: "diversos variados" },
        ],
      },
    ],
  },
  {
    key: "analyze",
    label: "Analisar",
    groups: [
      {
        key: "analytics",
        label: "Inteligência",
        to: "/relatorios",
        icon: BarChart3,
        hint: "Relatórios e mentor de IA",
        children: [
          { key: "analytics.reports", label: "Relatórios avançados", to: "/relatorios", keywords: "gráficos exportar pdf" },
          { key: "analytics.advisor", label: "Mentor de IA", to: "/consultor", keywords: "consultor inteligência artificial dicas" },
        ],
      },
      {
        key: "closing",
        label: "Fechamento",
        to: "/fechamento",
        icon: ClipboardCheck,
        hint: "Conferência mensal e anual",
        children: [
          { key: "closing.month", label: "Fechamento mensal", to: "/fechamento", keywords: "fechar mês bloquear" },
          { key: "closing.reconciliation", label: "Reconciliação bancária", to: "/reconciliacao", keywords: "conciliar banco extrato" },
          { key: "closing.annual", label: "Balanço anual", to: "/balanco-anual", keywords: "ano resumo anual" },
        ],
      },
    ],
  },
  {
    key: "account",
    label: "Família e conta",
    groups: [
      {
        key: "kids",
        label: "Espaço Kids",
        to: "/filhos",
        icon: Baby,
        hint: "Filhos, mesadas, acessos e métricas",
        children: [
          { key: "kids.hub", label: "Central da Família", to: "/filhos", highlight: true, keywords: "filho criança cadastro mesada acesso métricas" },
          { key: "kids.panel", label: "Códigos e metas", to: "/kids", keywords: "pin código qr metas" },
          { key: "kids.audit", label: "Auditoria Kids", to: "/kids-auditoria", keywords: "histórico criança" },
        ],
      },

      {
        key: "settings",
        label: "Configurações",
        to: "/cadastros",
        icon: Settings2,
        hint: "Cadastros, categorias, perfil e ajuda",
        children: [
          { key: "settings.records", label: "Meus cadastros", to: "/cadastros", keywords: "contas dependentes bancos" },
          { key: "settings.categories", label: "Categorias", to: "/categorias", keywords: "categoria ativar desativar" },
          { key: "settings.profile", label: "Meu perfil e plano", to: "/perfil", keywords: "conta assinatura senha licença" },
          { key: "settings.help", label: "Central de ajuda", to: "/ajuda", keywords: "suporte dúvida faq contato" },
        ],
      },
    ],
  },
];

export const adminNavGroups: NavGroup[] = [
  { key: "admin", label: "Administração", to: "/admin", icon: ShieldCheck, hint: "Usuários, licenças e ajustes" },
  { key: "profile", label: "Minha conta", to: "/perfil", icon: User2 },
];

export const staffNavGroup: NavGroup = {
  key: "admin",
  label: "Administração",
  to: "/admin",
  icon: ShieldCheck,
  hint: "Área da equipe",
};

/** Lista plana dos grupos, na ordem das seções. */
export function flattenGroups(sections: NavSection[]): NavGroup[] {
  return sections.flatMap((section) => section.groups);
}

/** Todos os destinos navegáveis (inclui rotas internas) para a busca rápida. */
export function allNavTargets(sections: NavSection[]) {
  return sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      (group.children ?? [{ key: group.key, label: group.label, to: group.to }]).map((child) => ({
        ...child,
        section: section.label,
        group: group.label,
        icon: group.icon,
      })),
    ),
  );
}

/** Atalhos do menu inferior no mobile. */
export const mobilePrimary = ["/painel", "/lancamentos", "/orcamentos", "/relatorios"];
