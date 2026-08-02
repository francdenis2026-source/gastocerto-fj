import { useState, useEffect } from "react";
import { 
  Settings2, 
  Check, 
  Phone, 
  Car, 
  ShoppingBasket, 
  HelpCircle,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, FileText, FileCode } from "lucide-react";
import { useRecurrentExpenses } from "@/lib/recurrent-metrics.functions";
import { exportRecurrentSpendPdf, exportRecurrentSpendCsv } from "@/lib/recurrent-export";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export type SidebarMetric = {
  id: string;
  label: string;
  icon: any;
  enabled: boolean;
  defaultAmount: number;
};

const DEFAULT_METRICS: SidebarMetric[] = [
  { id: "recargas", label: "Recargas Celular", icon: Phone, enabled: true, defaultAmount: 50 },
  { id: "acougue", label: "Açougue", icon: ShoppingBasket, enabled: true, defaultAmount: 200 },
  { id: "veiculos", label: "Combustível", icon: Car, enabled: true, defaultAmount: 300 },
  { id: "outros", label: "Outros Fixos", icon: HelpCircle, enabled: false, defaultAmount: 0 },
];

export function SidebarConfig() {
  const { data: recurrentData } = useRecurrentExpenses();
  const [metrics, setMetrics] = useState<SidebarMetric[]>(DEFAULT_METRICS);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-metrics-config");
    if (saved) {
      try {
        setMetrics(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configurações da barra lateral", e);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem("sidebar-metrics-config", JSON.stringify(metrics));
    toast.success("Configurações da barra lateral salvas com sucesso!");
    // Forçar recarregamento para atualizar a barra lateral
    window.dispatchEvent(new Event("sidebar-config-updated"));
  };

  const toggleMetric = (id: string) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const updateAmount = (id: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, defaultAmount: val } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          <h3 className="font-bold text-lg">Métricas da Barra Lateral</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Download className="size-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => recurrentData && exportRecurrentSpendPdf(recurrentData, [])} className="gap-2">
              <FileText className="size-4" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => recurrentData && exportRecurrentSpendCsv(recurrentData)} className="gap-2">
              <FileCode className="size-4" />
              Exportar CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Escolha quais gastos recorrentes aparecem nos widgets da barra lateral e defina um valor mensal padrão para comparação.
      </p>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-background flex items-center justify-center border border-border">
                  <metric.icon className="size-4 text-muted-foreground" />
                </div>
                <Label htmlFor={`switch-${metric.id}`} className="font-semibold cursor-pointer">
                  {metric.label}
                </Label>
              </div>
              <Switch 
                id={`switch-${metric.id}`} 
                checked={metric.enabled} 
                onCheckedChange={() => toggleMetric(metric.id)}
              />
            </div>
            
            {metric.enabled && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                    Valor Mensal Padrão (R$)
                  </Label>
                  <Input 
                    type="number" 
                    value={metric.defaultAmount} 
                    onChange={(e) => updateAmount(metric.id, e.target.value)}
                    className="h-9 text-sm rounded-lg"
                    placeholder="0,00"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={saveConfig} className="w-full mt-4 gap-2 rounded-xl">
        <Save className="size-4" />
        Salvar Configurações
      </Button>
    </div>
  );
}
