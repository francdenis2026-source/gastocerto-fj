import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isPdfPath, useReceiptUrl } from "@/lib/storage";

/** Modal de visualização de comprovante (imagem ou PDF) com URL assinada. */
export function ReceiptViewer({
  path,
  open,
  onOpenChange,
}: {
  path: string | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const url = useReceiptUrl(open ? path : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comprovante</DialogTitle>
          <DialogDescription>
            O arquivo fica em armazenamento privado e o link temporário expira em 1 hora.
          </DialogDescription>
        </DialogHeader>

        {!path ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum comprovante anexado.</p>
          </div>
        ) : !url ? (
          <div
            className="flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/20 px-4 py-10 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Carregando arquivo…
          </div>
        ) : isPdfPath(path) ? (
          <div className="space-y-3">
            <iframe
              title="Visualização do comprovante em PDF"
              src={url}
              className="h-[58dvh] min-h-80 w-full rounded-2xl border border-border bg-background"
            />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Abrir PDF em nova aba
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/20 p-2">
              <img
                src={url}
                alt="Imagem do comprovante"
                className="max-h-[58dvh] w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={url} download>
                  <Download className="size-4" aria-hidden="true" />
                  Baixar comprovante
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Abrir em nova aba
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
