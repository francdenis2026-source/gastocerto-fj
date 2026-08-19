import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-muted/80 motion-reduce:animate-none dark:bg-muted/60",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
