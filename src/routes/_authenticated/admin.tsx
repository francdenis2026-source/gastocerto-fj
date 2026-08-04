import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BellRing,
  BrainCircuit,
  ClipboardList,
  CreditCard,
  FileClock,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  Loader2,
  Lock,
  ScrollText,
  ShieldCheck,
  Tags,
  TrendingUp,
  Users,
  Wallet,
  Settings,
  Gift,
} from "lucide-react";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import { AdminConsoleShell, type AdminSection } from "@/components/admin/admin-console-shell";
import { AdminOverviewPanel } from "@/components/admin/overview-panel";
import { UsersPanel } from "@/components/admin/users-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/lib/queries";

/** Painéis pesados carregam sob demanda para a central abrir instantaneamente. */
const BusinessDashboard = lazy(() =>
  import("@/components/admin/business-dashboard").then((m) => ({ default: m.BusinessDashboard })),
);
const SupportTicketsPanel = lazy(() =>
  import("@/components/admin/support-tickets-panel").then((m) => ({ default: m.SupportTicketsPanel })),
);
const EmailSetupPanel = lazy(() =>
  import("@/components/admin/email-setup-panel").then((m) => ({ default: m.EmailSetupPanel })),
);
const AnnouncementsPanel = lazy(() =>
  import("@/components/admin/announcements-panel").then((m) => ({ default: m.AnnouncementsPanel })),
);
const PlanConfigsPanel = lazy(() =>
  import("@/components/admin/plan-configs-panel").then((m) => ({ default: m.PlanConfigsPanel })),
);
const LicensesPanel = lazy(() =>
  import("@/components/admin/licenses-panel").then((m) => ({ default: m.LicensesPanel })),
);
const ClientCodesPanel = lazy(() =>
  import("@/components/admin/client-codes-panel").then((m) => ({ default: m.ClientCodesPanel })),
);
const SalesPanel = lazy(() =>
  import("@/components/admin/sales-panel").then((m) => ({ default: m.SalesPanel })),
);
const AiSettingsPanel = lazy(() =>
  import("@/components/admin/ai-settings-panel").then((m) => ({ default: m.AiSettingsPanel })),
);
const TrialGrantPanel = lazy(() =>
  import("@/components/admin/trial-grant-panel").then((m) => ({ default: m.TrialGrantPanel })),
);
const TrialLicensesPanel = lazy(() =>
  import("@/components/admin/trial-licenses-panel").then((m) => ({ default: m.TrialLicensesPanel })),
);
const AdminAccessPanel = lazy(() =>
  import("@/components/admin/admin-access-panel").then((m) => ({ default: m.AdminAccessPanel })),
);
const BlockedIpsPanel = lazy(() =>
  import("@/components/admin/blocked-ips-panel").then((m) => ({ default: m.BlockedIpsPanel })),
);
const MasterCodePanel = lazy(() =>
  import("@/components/admin/master-code-panel").then((m) => ({ default: m.MasterCodePanel })),
);

const CategoriesCatalogPanel = lazy(() =>
  import("@/components/admin/categories-panel").then((m) => ({ default: m.CategoriesCatalogPanel })),
);
const ClosingPolicyPanel = lazy(() =>
  import("@/components/admin/closing-policy-panel").then((m) => ({ default: m.ClosingPolicyPanel })),
);
const ReopenRequestsPanel = lazy(() =>
  import("@/components/admin/reopen-requests-panel").then((m) => ({ default: m.ReopenRequestsPanel })),
);
const AuditLogsPanelComponent = lazy(() =>
  import("@/components/admin/audit-logs-panel").then((m) => ({ default: m.AuditLogsTable })),
);
const PermissionsPanel = lazy(() =>
  import("@/components/admin/permissions-panel").then((m) => ({ default: m.PermissionsPanel })),
);
const PaymentsAuditPanel = lazy(() =>
  import("@/components/admin/payments-audit-panel").then((m) => ({ default: m.PaymentsAuditPanel })),
);
const IntegrationsPanel = lazy(() =>
  import("@/components/admin/integrations-panel").then((m) => ({ default: m.IntegrationsPanel })),
);
import { ProfileAuditPanel, RedemptionHistoryPanel } from "@/components/admin/audit-panels";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Central administrativa — GastoCerto" },
      {
        name: "description",
        content:
          "Central de controle da plataforma: contas, licenças, vendas, IA, suporte e auditoria.",
      },
      { property: "og:title", content: "Central administrativa — GastoCerto" },
      {
        property: "og:description",
        content:
          "Central de controle da plataforma: contas, licenças, vendas, IA, suporte e auditoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const SECTIONS: AdminSection[] = [
  { id: "overview", label: "Visão geral", hint: "Indicadores e atalhos da operação", icon: LayoutDashboard },
  { id: "users", label: "Contas e Usuários", hint: "Gestão completa de perfis e papéis", icon: Users },
  { id: "temporary", label: "Contas Temporárias", hint: "Gestão de trials e acessos por código", icon: KeyRound, adminOnly: true },
  { id: "business", label: "Negócio e Vendas", hint: "MRR, Churn e faturamento", icon: TrendingUp, adminOnly: true },
  { id: "licenses", label: "Licenças", hint: "Emissão e controle de chaves", icon: ShieldCheck, adminOnly: true },
  { id: "operations", label: "Operações", hint: "Suporte, avisos e catálogo", icon: LifeBuoy, adminOnly: true },
  { id: "security", label: "Segurança", hint: "Infraestrutura e acessos", icon: Lock, adminOnly: true },
  { id: "audit", label: "Auditoria e Logs", hint: "Trilha completa de ações", icon: FileClock },
];

function AdminPage() {
  const { data: roles, isLoading, error } = useRoles();
  const isAdmin = (roles ?? []).includes("admin");
  const isStaff = isAdmin || (roles ?? []).includes("support");
  const navigate = useNavigate();

  // Caso ocorra erro 401/403 ou o usuário não seja staff, redireciona
  useEffect(() => {
    // Se ainda está carregando, não tomamos decisão para evitar loops falsos
    if (isLoading) return;

    if (error) {
      console.error("[admin] falha ao carregar permissões:", error);
      // Se for um erro de rede/rate limit, não redirecionamos imediatamente para evitar loops
      if (error instanceof Error && error.message.includes("429")) return;
      
      navigate({ to: "/painel", replace: true });
      return;
    }
    
    if (!isStaff) {
      console.warn("[admin] acesso negado: usuário não possui papel administrativo");
      // Importante: use replace para não empilhar a rota proibida no histórico
      navigate({ to: "/painel", replace: true });
    }
  }, [isLoading, isStaff, error, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-4 p-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  // Se não carregou e não é staff, redireciona (o useEffect cuida disso, mas o render protege)
  if (!isStaff) return null;

  return <AdminConsole isAdmin={isAdmin} />;
}


function AdminConsole({ isAdmin }: { isAdmin: boolean }) {
  const { user } = useAuth();
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");

  const sections = useMemo(
    () => SECTIONS.filter((section) => isAdmin || !section.adminOnly),
    [isAdmin],
  );

  const current = sections.some((section) => section.id === active) ? active : "overview";

  return (
    <AdminConsoleShell
      sections={sections}
      active={current}
      onSelect={setActive}
      operatorName={user?.email ?? "Operador"}
      role={isAdmin ? "Administrador" : "Suporte"}
      searchTerm={search}
      onSearchChange={setSearch}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        {current === "overview" ? <AdminOverviewPanel isAdmin={isAdmin} onNavigate={setActive} /> : null}
        {current === "users" ? <UsersPanel isAdmin={isAdmin} globalSearch={search} /> : null}
        {current === "business" ? <BusinessDashboard /> : null}
        {current === "sales" ? <SalesPanel globalSearch={search} /> : null}
        {current === "payments-audit" ? <PaymentsAuditPanel globalSearch={search} /> : null}
        {current === "plans" ? <PlanConfigsPanel /> : null}
        {current === "licenses" ? <LicensesPanel globalSearch={search} /> : null}
        {current === "codes" ? <ClientCodesPanel globalSearch={search} /> : null}
        {current === "trials" ? (
          <div className="space-y-4">
            <TrialGrantPanel />
            <TrialLicensesPanel />
          </div>
        ) : null}
        {current === "ai" ? <AiSettingsPanel /> : null}
        {current === "tickets" ? <SupportTicketsPanel /> : null}
        {current === "announcements" ? <AnnouncementsPanel /> : null}
        {current === "emails" ? <EmailSetupPanel /> : null}
        {current === "categories" ? <CategoriesCatalogPanel /> : null}
        {current === "closing" ? (
          <div className="space-y-4">
            <ClosingPolicyPanel />
            <ReopenRequestsPanel />
          </div>
        ) : null}
        {current === "audit" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileAuditPanel />
              <RedemptionHistoryPanel />
            </div>
            <AuditLogsPanelComponent globalSearch={search} />
          </div>
        ) : null}
        {current === "security" ? (
          <div className="space-y-4">
            <MasterCodePanel />
            <AdminAccessPanel />
            <BlockedIpsPanel />

          </div>
        ) : null}
        {current === "integrations" ? <IntegrationsPanel /> : null}
        {current === "logs" ? <LogsTable globalSearch={search} /> : null}
      </Suspense>
    </AdminConsoleShell>
  );
}

const LogsTable = lazy(() =>
  import("@/components/admin/logs-table").then((m) => ({ default: m.LogsTable })),
);

