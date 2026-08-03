import markAsset from "@/assets/gastocerto-mark.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={markAsset.url}
      alt="GastoCerto"
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  if (compact) {
    return <BrandMark className={cn("size-9", className)} />;
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 sm:gap-2.5", className)}>
      <BrandMark className="size-9 sm:size-11" />
      <span className="hidden min-w-0 flex-col leading-none min-[360px]:flex">
        <span
          className={cn(
            "font-display whitespace-nowrap text-[1.2rem] font-extrabold tracking-tight sm:text-[1.35rem]",
            onDark ? "text-hero-fg" : "text-[oklch(0.25_0.04_259)] dark:text-white",
          )}
        >
          Gasto
          <span
            className={cn(
              onDark
                ? "text-[oklch(0.78_0.17_152)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]"
                : "text-[oklch(0.52_0.15_150)] dark:text-[oklch(0.78_0.17_152)]",
            )}
          >
            Certo
          </span>
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[8.5px] font-bold uppercase tracking-[0.16em] min-[360px]:block",
            onDark ? "text-white" : "text-[oklch(0.25_0.04_259)] dark:text-white/60",
          )}
        >
          Controle hoje, tranquilidade sempre
        </span>
      </span>
    </span>

  );
}
