import type { LucideIcon } from "lucide-react";
import { FileText, LogOut, Moon, RefreshCcw, Search, ShieldCheck, Sun } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

import { MobileAdminTabBar } from "./mobile-admin-tab-bar";
import consoleBg from "@/assets/admin-console-bg.jpg";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { clearBrowserCredentials } from "@/lib/local-session";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type AdminSection = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export function AdminConsoleShell({
  sections,
  active,
  onSelect,
  operatorName,
  role,
  searchTerm,
  onSearchChange,
  children,
}: {
  sections: AdminSection[];
  active: string;
  onSelect: (id: string) => void;
  operatorName: string;
  role: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const current = sections.find((section) => section.id === active);
  const { confirm, ConfirmDialog } = useConfirm();

  function handleLogout() {
    confirm({
      title: "Encerrar sessão",
      description:
        "Deseja sair do sistema completamente? Você será desconectado da administração e da área do cliente.",
      type: "warning",
      confirmLabel: "Sair agora",
      onConfirm: async () => {
        const toastId = toast.loading("Finalizando acesso administrativo...", {
          description: "Encerrando sessão com segurança.",
          icon: <RefreshCcw className="size-4 animate-spin text-primary" />,
        });

        try {
          await supabase.auth.signOut();
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          toast.success("Sessão encerrada", {
            id: toastId,
            description: "Seu acesso administrativo foi finalizado com segurança.",
          });
          window.location.replace("/");
        } catch (error) {
          console.error("Erro no logout admin:", error);
          toast.error("Erro ao encerrar sessão", { id: toastId });
          window.location.replace("/");
        }
      },
    });
  }

  const exportSearchPdf = () => {
    if (!searchTerm.trim()) {
      toast.error("Insira um termo de busca para exportar os resultados globais.");
      return;
    }
    const doc = new jsPDF();
    doc.text(`GastoCerto — Resultados da busca global: "${searchTerm}"`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 22);
    doc.text("Nota: este PDF contém uma captura dos dados filtrados na sessão atual.", 14, 28);
    doc.save(`busca-global-${searchTerm}.pdf`);
    toast.success("PDF da busca gerado.");
  };

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50">
        <img
          src={consoleBg}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-[0.18] dark:opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-background/88" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_10%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]" />
      </div>

      <a href="#admin-content" className="skip-link sr-only focus:not-sr-only">
        Pular para o conteúdo administrativo
      </a>

      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
        <header className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm backdrop-blur">
          <div className="relative p-4 sm:p-6">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_55%)]" />
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background/80 shadow-sm">
                  <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Central de controle
                  </p>
                  <h1 className="text-balance text-xl font-bold leading-tight sm:text-2xl">
                    GastoCerto — Administração
                  </h1>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {operatorName} · {role}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2 xl:ml-auto xl:max-w-2xl">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    aria-label="Busca global administrativa"
                    placeholder="Buscar usuários, chaves, logs..."
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-11 bg-background/70 pl-9 pr-12"
                  />
                  {searchTerm ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 size-10 -translate-y-1/2"
                      onClick={exportSearchPdf}
                      aria-label="Exportar resultados da busca para PDF"
                    >
                      <FileText className="size-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 shrink-0 bg-background/70"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
                >
                  {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 shrink-0 bg-background/70 text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                  aria-label="Encerrar sessão administrativa"
                >
                  <LogOut className="size-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
          <nav
            aria-label="Seções administrativas"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/90 p-2 shadow-sm backdrop-blur [scrollbar-width:none] lg:sticky lg:top-4 lg:h-fit lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === active;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelect(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${section.label}: ${section.hint}`}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap lg:whitespace-normal">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <main
            id="admin-content"
            tabIndex={-1}
            className="min-w-0 rounded-2xl border border-border bg-card/90 p-3 shadow-sm backdrop-blur focus:outline-none sm:p-5"
          >
            <div className="mb-4 border-b border-border pb-3">
              <h2 className="text-lg font-semibold">{current?.label}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{current?.hint}</p>
            </div>
            {children}
          </main>
        </div>
      </div>

      <MobileAdminTabBar sections={sections} active={current?.id || active} onSelect={onSelect} />
      <ConfirmDialog />
    </div>
  );
}
