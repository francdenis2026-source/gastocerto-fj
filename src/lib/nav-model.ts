import {
  ArrowLeftRight,
  BarChart3,
  Car,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Modelo único de navegação da área do cliente.
 *
 * Por que existe: antes cada superfície (sidebar desktop, menu mobile, abas do
 * header) tinha sua própria lista, o que gerava rotas órfãs (acessíveis só por
 * link interno) e classificação incoerente. Centralizando aqui, qualquer rota
 * nova aparece em todas as superfícies que consomem este modelo.
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
    label: "Visão Geral",
    groups: [
      {
        key: "overview",
        label: "VISÃO GERAL",
        to: "/painel",
        icon: LayoutDashboard,
        hint: "Dashboard principal",
        children: [
          { key: "overview.panel", label: "Dashboard", to: "/painel", keywords: "dashboard saldo resumo" },
          { key: "overview.daily", label: "Histórico detalhado", to: "/diario", keywords: "extrato diário" },
          { key: "overview.statements", label: "Extratos Bancários", to: "/extratos", keywords: "extrato banco download pdf csv" },
          { key: "overview.agenda", label: "Agenda de compromissos", to: "/calendario", keywords: "vencimentos lembretes agenda" },
        ],
      },
    ],
  },
  {
    key: "entries",
    label: "Lançamentos",
    groups: [
      {
        key: "entries_group",
        label: "LANÇAMENTOS",
        to: "/lancamentos",
        icon: ArrowLeftRight,
        hint: "Receitas, despesas e extrato",
        children: [
          { key: "entries.list", label: "Movimentações", to: "/lancamentos", keywords: "gastos lançar compras receitas entradas" },
          { key: "entries.recurring", label: "Fixos e assinaturas", to: "/recorrencia", keywords: "recorrente mensalidade" },
          { key: "entries.receipts", label: "Comprovantes", to: "/comprovantes", keywords: "notas recibos anexos" },
        ],
      },
    ],
  },
  {
    key: "vehicles_group",
    label: "Veículos",
    groups: [
      {
        key: "vehicles",
        label: "VEÍCULOS E COMBUSTÍVEL",
        to: "/veiculos",
        icon: Car,
        hint: "Abastecimentos, consumo e custo por km",
        children: [
          {
            key: "vehicles.dashboard",
            label: "Painel de combustível",
            to: "/veiculos",
            keywords: "veículos combustível abastecimento gasolina etanol diesel consumo km/l custo por km gasto médio",
          },
          {
            key: "vehicles.settings",
            label: "Metas e alertas",
            to: "/veiculos-configuracoes",
            keywords: "meta consumo alerta teto mensal combustível média",
          },
          {
            key: "vehicles.audit",
            label: "Auditoria de abastecimentos",
            to: "/veiculos-auditoria",
            keywords: "histórico odômetro abastecimento alertas logs auditoria",
          },
        ],
      },
    ],
  },
  {
    key: "strategy",
    label: "Planejamento",
    groups: [
      {
        key: "planning",
        label: "PLANEJAMENTO",
        to: "/orcamentos",
        icon: Target,
        hint: "Metas e orçamentos",
        children: [
          { key: "planning.budgets", label: "Orçamentos", to: "/orcamentos", keywords: "limite categoria teto" },
          { key: "planning.goals", label: "Metas de poupança", to: "/metas", keywords: "objetivo reserva guardar" },
          { key: "planning.commitments", label: "Dívidas e compromissos", to: "/compromissos", keywords: "parcelas empréstimo boleto" },
          { key: "planning.payoff", label: "Plano de quitação", to: "/pagar-dividas", keywords: "quitar dívida bola de neve juros" },
        ],
      },
    ],
  },
  {
    key: "analysis",
    label: "Análise",
    groups: [
      {
        key: "reports",
        label: "ANÁLISE",
        to: "/relatorios",
        icon: BarChart3,
        hint: "Relatórios e IA",
        children: [
          { key: "reports.view", label: "Relatórios", to: "/relatorios", keywords: "gráficos exportar pdf" },
          { key: "reports.advisor", label: "Inteligência / Insights", to: "/consultor", keywords: "consultor inteligência artificial dicas" },
          { key: "reports.closing", label: "Fechamento mensal", to: "/fechamento", keywords: "fechar mês bloquear" },
          { key: "reports.reconciliation", label: "Reconciliação bancária", to: "/reconciliacao", keywords: "conciliar banco extrato" },
          { key: "reports.annual", label: "Balanço anual", to: "/balanco-anual", keywords: "ano resumo anual" },
        ],
      },
    ],
  },
  {
    key: "family_group",
    label: "Família",
    groups: [
      {
        key: "family",
        label: "FAMÍLIA",
        to: "/filhos",
        icon: Users,
        hint: "Espaço Kids e Perfis",
        children: [
          { key: "family.kids", label: "Espaço Kids", to: "/filhos", keywords: "filho criança cadastro mesada" },
          { key: "family.wallet", label: "Múltiplos Perfis", to: "/kids", keywords: "pin código qr metas" },
        ],
      },
    ],
  },
  {
    key: "settings_group",
    label: "Configurações",
    groups: [
      {
        key: "settings",
        label: "CONFIGURAÇÕES",
        to: "/cadastros",
        icon: Settings2,
        hint: "Contas e categorias",
        children: [
          { key: "settings.records", label: "Contas e Bancos", to: "/cadastros", keywords: "contas dependentes bancos" },
          { key: "settings.categories", label: "Categorias", to: "/categorias", keywords: "categoria ativar desativar" },
          { key: "settings.profile", label: "Perfil e Plano", to: "/perfil", keywords: "conta assinatura senha licença" },
          { key: "settings.cards", label: "Cartões", to: "/cartoes", keywords: "crédito débito limite" },
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
