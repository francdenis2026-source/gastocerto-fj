import { ArrowRightLeft, CheckCircle2, Clock, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import {
  kidEntryFlow,
  kidEntryKind,
  kidEntryLabel,
  kidEntryTone,
  kidSendTypeLabel,
  syncStatusFor,
} from "@/lib/kids-labels";
import { cn } from "@/lib/utils";

type KidEntry = {
  id: string;
  description: string;
  amount: number | string;
  transaction_date: string;
  transaction_type?: string | null;
  tags?: string[] | null;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-medium">{value}</p>
    </div>
  );
}

/** Detalhes de um lançamento do Espaço Kids, com status de sincronização. */
export function KidEntryDetailsDialog({
  entry,
  kidName,
  open,
  onOpenChange,
}: {
  entry: KidEntry | null;
  kidName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;
  const kind = kidEntryKind(entry);
  const sync = syncStatusFor(entry);
  const sendType = kidSendTypeLabel(entry.tags);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-md">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base leading-tight">{kidEntryLabel(entry)}</DialogTitle>
          <DialogDescription className="text-xs">
            {formatDate(entry.transaction_date)} · {kidEntryFlow(kind, kidName)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2.5">
          <span className={cn("text-2xl font-semibold tabular-nums", kidEntryTone(kind))}>
            {kind === "received" ? "+" : "−"} {formatCurrency(Number(entry.amount))}
          </span>
          <Badge variant={sync.ok ? "secondary" : "outline"} className="gap-1">
            {sync.ok ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
            {sync.label}
          </Badge>
        </div>

        <div className="grid gap-1.5 sm:grid-cols-2">
          <Row label="Categoria" value={sendType ?? (kind === "kidExpense" ? "Gasto pessoal" : "Transferência")} />
          <Row label="De / para" value={kidEntryFlow(kind, kidName)} />
          <Row label="Descrição" value={entry.description || "—"} />
          <Row
            label="Impacto no orçamento"
            value={kind === "kidExpense" ? "Informativo (não soma)" : "Entra nos cálculos"}
          />
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ArrowRightLeft className="size-3.5" /> Sincronização
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{sync.description}</p>
        </div>

        {entry.tags?.length ? (
          <div className="flex flex-wrap items-center gap-1">
            <Tag className="size-3 text-muted-foreground" aria-hidden="true" />
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
