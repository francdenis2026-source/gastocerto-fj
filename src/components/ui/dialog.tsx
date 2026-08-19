"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const legacyLongForm = Boolean(
    className?.includes("overflow-y-auto") &&
      (className?.includes("max-h-[90vh]") || className?.includes("max-h-[90dvh]")),
  );

  // O assistente de lançamento (Novo gasto/Nova receita) usa um shell próprio
  // com p-0 + gap-0 + overflow-hidden. Ele precisa de mais largura e de uma
  // área rolável interna. A versão atual do formulário ainda mantém um bloco
  // visual antigo duplicado antes do conteúdo principal; ocultamos somente
  // esse bloco legado para impedir a repetição de campos vista em produção.
  const transactionWizard = Boolean(
    className?.includes("sm:max-w-xl") &&
      className?.includes("p-0") &&
      className?.includes("gap-0") &&
      className?.includes("overflow-hidden"),
  );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        data-long-form={legacyLongForm ? "true" : undefined}
        data-transaction-wizard={transactionWizard ? "true" : undefined}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid max-h-[96dvh] w-[calc(100vw-0.75rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain scroll-pb-32 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus-visible:outline-none motion-reduce:animate-none sm:w-[calc(100vw-2rem)] sm:scroll-pb-28 sm:p-6",
          legacyLongForm &&
            "sm:!max-w-3xl lg:!max-w-4xl xl:!max-w-5xl sm:max-h-[94dvh] lg:px-7 lg:py-6",
          transactionWizard &&
            "!max-h-[96dvh] !w-[calc(100vw-0.75rem)] !max-w-none !overflow-hidden sm:!w-[calc(100vw-2rem)] sm:!max-w-3xl lg:!max-w-4xl xl:!max-w-5xl [&>form]:min-h-0 [&>form]:overflow-y-auto [&>form]:overscroll-contain [&>form]:scroll-pb-32 [&>form>.animate-in]:hidden",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 z-30 inline-flex size-11 items-center justify-center rounded-xl border border-border/70 bg-card/95 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:right-4 sm:top-4">
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Fechar janela</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky top-0 z-20 -mx-4 -mt-4 flex flex-col gap-2 border-b border-border/70 bg-card/95 px-4 pb-4 pr-14 pt-4 text-left backdrop-blur supports-[backdrop-filter]:bg-card/90 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pb-5 sm:pr-16 sm:pt-6 lg:-mx-7 lg:px-7 lg:pr-16",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky bottom-0 z-20 -mx-4 -mb-4 mt-3 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_28px_-22px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-card/90 [&>*]:min-h-11 [&>*]:w-full sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-6 sm:pt-5 sm:[&>*]:w-auto lg:-mx-7 lg:px-7",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold leading-tight tracking-tight sm:text-2xl", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("max-w-3xl text-sm leading-6 text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
