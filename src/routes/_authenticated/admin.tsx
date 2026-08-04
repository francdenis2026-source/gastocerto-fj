import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, Suspense, lazy, useEffect } from "react";
import { useRoles } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  KeyRound, 
  LifeBuoy, 
  Lock, 
  FileClock, 
  Loader2,
  TrendingUp,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AdminConsoleShell } from "@/components/admin/admin-console-shell";
import { AdminOverviewPanel } from "@/components/admin/overview-panel";
import { UsersPanel } from "@/components/admin/users-panel";
import { BusinessDashboard } from "@/components/admin/business-dashboard";
import { SupportTicketsPanel } from "@/components/admin/support-tickets-panel";

// Lazy components
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
const TemporaryAccountsPanel = lazy(() =>
  import("@/components/admin/temporary-accounts-panel").then((m) => ({ default: m.TemporaryAccountsPanel })),
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
const PaymentsAuditPanel = lazy(() =>
  import("@/components/admin/payments-audit-panel").then((m) => ({ default: m.PaymentsAuditPanel })),
);
const IntegrationsPanel = lazy(() =>
  import("@/components/admin/integrations-panel").then((m) => ({ default: m.IntegrationsPanel })),
);
const LogsTable = lazy(() =>
  import("@/components/admin/logs-table").then((m) => ({ default: m.LogsTable })),
);

import { ProfileAuditPanel, RedemptionHistoryPanel } from "@/components/admin/audit-panels";

type AdminSection = {
  id: string;
  label: string;
  hint: string;
  icon: any;
  adminOnly?: boolean;
};

const SECTIONS: AdminSection[] = [
  { id: "overview", label: "Dashboard", hint: "Métricas globais de negócio", icon: LayoutDashboard },
  { id: "users", label: "Contas & Usuários", hint: "Gestão e permissões", icon: Users },
  { id: "financial", label: "Adm. Financeiro", hint: "Planos e receitas", icon: Wallet, adminOnly: true },
  { id: "temporary", label: "Acesso Temporário", hint: "Trials e chaves", icon: KeyRound, adminOnly: true },
  { id: "operations", label: "Operações", hint: "Suporte e catálogo", icon: LifeBuoy, adminOnly: true },
  { id: "security", label: "Segurança", hint: "Acessos e infra", icon: Lock, adminOnly: true },
  { id: "audit", label: "Auditoria", hint: "Histórico de logs", icon: FileClock },
];

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

function AdminPage() {
  const { data: roles, isLoading, isError, error } = useRoles();
  const { user } = useAuth();
  const isAdmin = (roles ?? []).includes("admin");
  const isStaff = isAdmin || (roles ?? []).includes("support");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user) return;
    if (isError) return;
    if (!isStaff) {
      navigate({ to: "/painel", replace: true });
    }
  }, [isLoading, isStaff, isError, error, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-4 p-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

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
        
        {current === "financial" ? (
          <div className="space-y-4">
            <BusinessDashboard />
            <PlanConfigsPanel />
            <SalesPanel globalSearch={search} />
            <PaymentsAuditPanel globalSearch={search} />
            <LicensesPanel globalSearch={search} />
          </div>
        ) : null}

        {current === "temporary" ? (
          <div className="space-y-4">
            <TemporaryAccountsPanel globalSearch={search} />
            <TrialGrantPanel />
            <TrialLicensesPanel />
            <ClientCodesPanel globalSearch={search} />
          </div>
        ) : null}

        {current === "operations" ? (
          <div className="space-y-4">
            <SupportTicketsPanel />
            <AnnouncementsPanel />
            <EmailSetupPanel />
            <CategoriesCatalogPanel />
            <ClosingPolicyPanel />
            <ReopenRequestsPanel />
          </div>
        ) : null}

        {current === "security" ? (
          <div className="space-y-4">
            <MasterCodePanel />
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Gerenciamento Global de Permissões</h3>
              <p className="text-xs text-muted-foreground mb-4 italic">Selecione um usuário no painel de Contas para gerenciar permissões individuais ou use o menu de Auditoria para limpezas globais.</p>
            </div>
            <AdminAccessPanel />
            <BlockedIpsPanel />
            <IntegrationsPanel />
            <AiSettingsPanel />
          </div>
        ) : null}

        {current === "audit" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileAuditPanel />
              <RedemptionHistoryPanel />
            </div>
            <AuditLogsPanelComponent globalSearch={search} />
            <LogsTable globalSearch={search} />
          </div>
        ) : null}
      </Suspense>
    </AdminConsoleShell>
  );
}
