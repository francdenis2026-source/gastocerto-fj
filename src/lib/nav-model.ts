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
    key: "main",
    label: "Geral",
    groups: [
      {
        key: "overview",
        label: "Visão geral",
        to: "/painel",
        icon: LayoutDashboard,
        hint: "Resumo e alertas",
        children: [
          { key: "overview.panel", label: "Painel de controle", to: "/painel", keywords: "dashboard saldo resumo" },
          { key: "overview.daily", label: "Histórico detalhado", to: "/diario", keywords: "extrato diário" },
          { key: "overview.statements", label: "Extratos Bancários", to: "/extratos", keywords: "extrato banco download pdf csv" },
        ],
      },
      {
        key: "entries",
        label: "Lançamentos",
        to: "/lancamentos",
        icon: ArrowLeftRight,
        hint: "Receitas e despesas",
        children: [
          { key: "entries.list", label: "Minhas movimentações", to: "/lancamentos", keywords: "gastos lançar compras receitas entradas" },
          { key: "entries.recurring", label: "Fixos e assinaturas", to: "/recorrencia", keywords: "recorrente mensalidade" },
          { key: "entries.receipts", label: "Comprovantes", to: "/comprovantes", keywords: "notas recibos anexos" },
        ],
      },
      {
        key: "agenda",
        label: "Agenda",
        to: "/calendario",
        icon: CalendarClock,
        hint: "Vencimentos e lembretes",
      },
    ],
  },
  {
    key: "strategy",
    label: "Planejamento",
    groups: [
      {
        key: "planning",
        label: "Estratégia",
        to: "/orcamentos",
        icon: PiggyBank,
        hint: "Metas e orçamentos",
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
        hint: "Energia, gás e combustível",
        children: [
          { key: "consumption.gas", label: "Gás de Cozinha", to: "/gas", keywords: "botijão glp" },
          { key: "consumption.fuel", label: "Combustível e Veículos", to: "/veiculos", keywords: "gasolina álcool diesel" },
          { key: "consumption.energy", label: "Energia Elétrica", to: "/energia", keywords: "luz conta" },
        ],
      },
    ],
  },
  {
    key: "analysis",
    label: "Resultados",
    groups: [
      {
        key: "reports",
        label: "Relatórios",
        to: "/relatorios",
        icon: BarChart3,
        hint: "Análise e fechamento",
        children: [
          { key: "reports.view", label: "Visão do período", to: "/relatorios", keywords: "gráficos exportar pdf" },
          { key: "reports.closing", label: "Fechamento mensal", to: "/fechamento", keywords: "fechar mês bloquear" },
          { key: "reports.reconciliation", label: "Reconciliação bancária", to: "/reconciliacao", keywords: "conciliar banco extrato" },
          { key: "reports.annual", label: "Balanço anual", to: "/balanco-anual", keywords: "ano resumo anual" },
          { key: "reports.advisor", label: "Mentor de IA", to: "/consultor", keywords: "consultor inteligência artificial dicas" },
        ],
      },
    ],
  },
  {
    key: "family_settings",
    label: "Família e Ajustes",
    groups: [
      {
        key: "family",
        label: "Família",
        to: "/filhos",
        icon: Baby,
        hint: "Espaço Kids",
        children: [
          { key: "family.kids", label: "Gestão de Filhos", to: "/filhos", keywords: "filho criança cadastro mesada" },
          { key: "family.wallet", label: "Carteiras Kids", to: "/kids", keywords: "pin código qr metas" },
        ],
      },
      {
        key: "settings",
        label: "Configurações",
        to: "/cadastros",
        icon: Settings2,
        hint: "Contas e categorias",
        children: [
          { key: "settings.records", label: "Meus cadastros", to: "/cadastros", keywords: "contas dependentes bancos" },
          { key: "settings.categories", label: "Categorias", to: "/categorias", keywords: "categoria ativar desativar" },
          { key: "settings.profile", label: "Meu perfil e plano", to: "/perfil", keywords: "conta assinatura senha licença" },
        ],
      },
    ],
  },
];

export const adminNavGroups: NavGroup[] = [
  { key: "admin", label: "Administração", to: "/admin", icon: ShieldCheck, hint: "Usuários, licenças e ajustes" },
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
