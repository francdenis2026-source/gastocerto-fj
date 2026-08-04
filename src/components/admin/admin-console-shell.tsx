import type { LucideIcon } from "lucide-react";
import { 
  Search, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut, 
  FileDown, 
  FileText, 
  Menu, 
  RefreshCcw,
  Bell,
  Command,
  Plus,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clearBrowserCredentials } from "@/lib/local-session";
import { useState } from "react";
import { MobileAdminTabBar } from "./mobile-admin-tab-bar";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
      title: "Encerrar Sessão",
      description: "Deseja sair do sistema completamente?",
      type: "warning",
      confirmLabel: "Sair agora",
      onConfirm: async () => {
        const toastId = toast.loading("Finalizando acesso...", { icon: <RefreshCcw className="size-4 animate-spin text-primary" /> });
        try {
          await supabase.auth.signOut();
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          toast.success("Até logo!");
          setTimeout(() => window.location.replace("/"), 800);
        } catch (error) {
          toast.error("Erro ao encerrar sessão", { id: toastId });
          window.location.replace("/");
        }
      }
    });
  }

  const exportSearchPdf = () => {
    if (!searchTerm) return;
    const doc = new jsPDF();
    doc.text(`GameCarto — Central Administrativa: "${searchTerm}"`, 14, 15);
    doc.save(`admin-export-${searchTerm}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex text-foreground antialiased selection:bg-primary/20">
      {/* Redesigned Enterprise Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-border/50 bg-[#09090B] sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
             <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">G</div>
             <span className="font-bold text-base tracking-tight">GameCarto Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto mt-4">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">Central de Controle</p>
             {sections.map(section => {
               const Icon = section.icon;
               const isActive = section.id === active;
               return (
                 <button
                   key={section.id}
                   onClick={() => onSelect(section.id)}
                   className={cn(
                     "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[14px] cursor-pointer group",
                     isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                   )}
                 >
                   <Icon size={18} className={cn(isActive && "text-primary")} />
                   <span className="flex-1 text-left">{section.label}</span>
                   {isActive && <div className="size-1.5 rounded-full bg-primary" />}
                 </button>
               )
             })}
           </div>
        </nav>

        <div className="p-4 border-t border-border/50 bg-[#0C0C0E]">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-destructive transition-colors text-[13px] cursor-pointer">
              <LogOut size={16} />
              <span>Encerrar Sessão</span>
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Glass Header */}
        <header className="h-16 border-b border-border/50 flex items-center px-8 gap-6 bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-50">
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              <span className="opacity-30">/</span>
              <span className="text-foreground font-medium">{current?.label}</span>
           </div>

           <div className="flex-1 max-w-xl mx-auto hidden md:block">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={searchTerm}
                   onChange={(e) => onSearchChange(e.target.value)}
                   placeholder="Busca global em toda a central..." 
                   className="h-10 pl-10 bg-white/5 border-border/40 focus:border-primary/50 transition-all rounded-xl text-sm"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border/50 text-[10px] bg-muted font-sans font-medium text-muted-foreground flex items-center gap-1">
                       <Command size={10} /> K
                    </kbd>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 transition-colors">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/5 transition-colors relative">
                 <Bell size={18} />
                 <span className="absolute top-2.5 right-2.5 size-1.5 bg-primary rounded-full" />
              </button>
              <div className="h-6 w-px bg-border/50 mx-2" />
              <div className="flex items-center gap-3">
                 <div className="hidden text-right lg:block">
                    <p className="text-[13px] font-semibold leading-none">{operatorName}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{role}</p>
                 </div>
                 <Avatar className="size-9 rounded-xl border border-border/50 shadow-lg">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[13px]">OP</AvatarFallback>
                 </Avatar>
              </div>
           </div>
        </header>

        <main className="flex-1 p-8 bg-[#05070B]">
           <div className="max-w-[1400px] mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{current?.label}</h1>
                    <p className="text-muted-foreground text-[15px]">{current?.hint}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl px-4 text-xs font-semibold uppercase tracking-wider h-10 border-border/50 hover:bg-white/5 transition-all">
                       <FileDown size={14} className="mr-2" /> Exportar
                    </Button>
                    <Button className="rounded-xl px-4 text-xs font-semibold uppercase tracking-wider h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                       <Plus size={16} className="mr-2" /> Novo Acesso
                    </Button>
                 </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
           </div>
        </main>
      </div>

      <MobileAdminTabBar 
        sections={sections} 
        active={current?.id || active} 
        onSelect={onSelect} 
      />
      <ConfirmDialog />
    </div>
  );
}
