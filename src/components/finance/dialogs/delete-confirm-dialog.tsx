import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/** Ilustração vetorial (SVG inline) usada nas confirmações de exclusão. */
function DeleteEmblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Aviso de exclusão"
      className="size-12 shrink-0"
    >
      <circle cx="32" cy="32" r="30" className="fill-destructive/10" />
      <circle
        cx="32"
        cy="32"
        r="30"
        className="fill-none stroke-destructive/30"
        strokeWidth="1.5"
      />
      <path
        d="M22 25h20l-1.6 21a3 3 0 0 1-3 2.8H26.6a3 3 0 0 1-3-2.8L22 25Z"
        className="fill-none stroke-destructive"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M19 25h26M27 25v-3.5a2.5 2.5 0 0 1 2.5-2.5h5a2.5 2.5 0 0 1 2.5 2.5V25"
        className="fill-none stroke-destructive"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M28.5 31v12M35.5 31v12"
        className="fill-none stroke-destructive/70"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Confirmação de exclusão padronizada: mensagem profissional, emblema em SVG,
 * botão desabilitado durante o processamento e foco acessível no cancelar.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Excluir registro?",
  description,
  itemLabel,
  amountLabel,
  confirmLabel = "Excluir definitivamente",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  itemLabel?: string | null;
  amountLabel?: string | null;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(value) => (pending ? null : onOpenChange(value))}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
          <DeleteEmblem />
          <div className="min-w-0 space-y-1">
            <AlertDialogTitle className="text-base leading-tight">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {itemLabel || amountLabel ? (
          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5">
            {itemLabel ? (
              <p className="truncate text-sm font-medium" title={itemLabel}>
                {itemLabel}
              </p>
            ) : null}
            {amountLabel ? (
              <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-muted-foreground">
                {amountLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={cn(
              "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              pending && "pointer-events-none opacity-70",
            )}
          >
            {pending ? "Excluindo..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
