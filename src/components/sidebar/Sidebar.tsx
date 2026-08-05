import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Zap, BarChart3, CalendarClock, Baby, Settings2 } from "lucide-react";

export function Sidebar() {
  return (
    <nav className="w-64 bg-[#0B0F14] border-r border-white/5 h-screen flex flex-col p-4">
      <div className="text-emerald-500 font-bold text-xl mb-8 px-2">Meu Controle</div>
      
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2 font-semibold">Geral</div>
          <SidebarItem to="/painel" icon={LayoutDashboard} label="Visão Geral" />
          <SidebarItem to="/lancamentos" icon={ArrowLeftRight} label="Movimentações" />
          <SidebarItem to="/calendario" icon={CalendarClock} label="Agenda" />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2 font-semibold">Planejamento</div>
          <SidebarItem to="/orcamentos" icon={PiggyBank} label="Orçamentos" />
          <SidebarItem to="/gas" icon={Zap} label="Consumo" />
        </div>
      </div>
    </nav>
  );
}

function SidebarItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
      activeProps={{ className: "bg-emerald-500/10 text-emerald-500 font-medium" }}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
