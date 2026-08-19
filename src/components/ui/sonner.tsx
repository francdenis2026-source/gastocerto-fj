import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-2xl border border-border bg-background text-foreground shadow-2xl",
          title: "text-sm font-semibold tracking-tight",
          description: "text-sm leading-relaxed text-muted-foreground",
          actionButton:
            "min-h-9 rounded-lg bg-primary px-3 font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          cancelButton:
            "min-h-9 rounded-lg bg-muted px-3 font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          closeButton:
            "border-border bg-background text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
