import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Trash2, 
  RotateCcw, 
  Trash, 
  Search, 
  Calendar, 
  AlertCircle,
  Loader2,
  Clock,
  History
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format-utils";
import { getTrashItems, restoreFromTrash, permanentDeleteFromTrash } from "@/functions/admin-trash.functions";
import { useServerFn } from "@tanstack/react-start";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  user: { label: "Usuário", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  license: { label: "Licença", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  transaction: { label: "Lançamento", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  category: { label: "Categoria", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  other: { label: "Outro", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

export function TrashPanel() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  const getItemsFn = useServerFn(getTrashItems);
  const restoreFn = useServerFn(restoreFromTrash);
  const deleteFn = useServerFn(permanentDeleteFromTrash);

  const trashQuery = useQuery({
    queryKey: ["admin", "trash"],
    queryFn: () => getItemsFn(),
    staleTime: 30000,
  });

  const restoreMutation = useMutation({
    mutationFn: (logId: string) => restoreFn({ data: { logId } }),
    onSuccess: (res) => {
      toast.success("Item restaurado com sucesso! Note: os dados originais foram recuperados para auditoria.");
      queryClient.invalidateQueries({ queryKey: ["admin", "trash"] });
    },
    onError: (err) => {
      toast.error("Erro ao restaurar: " + (err as any).message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (logId: string) => deleteFn({ data: { logId } }),
    onSuccess: () => {
      toast.success("Exclusão permanente realizada");
      queryClient.invalidateQueries({ queryKey: ["admin", "trash"] });
    },
    onError: (err) => {
      toast.error("Erro ao excluir: " + (err as any).message);
    }
  });

  const filteredItems = useMemo(() => {
    const items = trashQuery.data || [];
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(item => {
      const details = item.details as any;
      const type = TYPE_LABELS[details.itemType]?.label.toLowerCase() || "";
      const reason = (details.reason || "").toLowerCase();
      return type.includes(term) || reason.includes(term);
    });
  }, [trashQuery.data, search]);

  const handleRestore = (id: string) => {
    confirm({
      title: "Restaurar Item",
      description: "Esta ação requer confirmação reforçada. Digite RESTAURAR para reverter a exclusão deste item. Ele sairá da quarentena e voltará a ser visível.",
      input: {
        label: "Digite a palavra de segurança",
        expected: "RESTAURAR",
        placeholder: "RESTAURAR"
      },
      onConfirm: () => restoreMutation.mutate(id),
    });
  };

  const handlePermanentDelete = (id: string) => {
    confirm({
      title: "Exclusão Permanente",
      description: "ESTA AÇÃO É IRREVERSÍVEL. O item será removido definitivamente. Digite EXCLUIR para confirmar.",
      type: "warning",
      input: {
        label: "Confirmação Crítica",
        expected: "EXCLUIR",
        placeholder: "EXCLUIR"
      },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            Sistema de Quarentena
          </h2>
          <p className="text-xs text-muted-foreground">
            Itens excluídos permanecem aqui por 30 dias antes da purga automática.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por tipo ou motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px] font-bold text-[10px] uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Motivo / Detalhes</TableHead>
              <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-wider">Data Exclusão</TableHead>
              <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-wider">Expira em</TableHead>
              <TableHead className="w-[120px] text-right font-bold text-[10px] uppercase tracking-wider">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trashQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">Carregando lixeira...</p>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <Trash className="size-10 mb-2" />
                    <p className="text-sm">Nenhum item em quarentena</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const details = item.details as any;
                const expiresAt = new Date(details.expires_at);
                const isExpiringSoon = (expiresAt.getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000);

                return (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", TYPE_LABELS[details.itemType]?.color)}>
                        {TYPE_LABELS[details.itemType]?.label || details.itemType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {details.reason || "Sem motivo informado"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ID Original: {details.itemId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {formatDateTime(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className={cn(
                        "flex items-center gap-1.5",
                        isExpiringSoon ? "text-destructive font-bold" : "text-muted-foreground"
                      )}>
                        <Calendar className="size-3" />
                        {formatDateTime(details.expires_at)}
                        {isExpiringSoon && <AlertCircle className="size-3 animate-pulse" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-8 hover:text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => handleRestore(item.id)}
                          title="Restaurar"
                          disabled={restoreMutation.isPending}
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-8 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handlePermanentDelete(item.id)}
                          title="Excluir Permanentemente"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Atenção Administrativa</p>
          <p className="text-[11px] text-amber-600 leading-relaxed">
            A restauração recupera os dados para fins de auditoria. Caso o recurso tenha sido deletado fisicamente do banco de dados (cascade), 
            a recriação manual pode ser necessária utilizando o "ID Original" e os metadados salvos no log.
          </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
