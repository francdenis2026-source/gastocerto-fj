import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/gastocerto-mark.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={markAsset.url}
      alt="GastoCerto"
      className={cn("shrink-0 object-contain cursor-pointer", className)}
    />
  );
}

export function Logo({
  className,
  compact = false,
  onDark = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
  href?: string;
}) {
  const content = (
    <span className={cn("inline-flex min-w-0 items-center gap-2 transition-transform duration-200 group-hover:scale-105 sm:gap-2.5 cursor-pointer", className)}>
      <BrandMark className="size-9 transition-transform duration-200 group-hover:rotate-3 sm:size-11" />
      <span className="hidden min-w-0 flex-col leading-none min-[360px]:flex">
        <span
          className={cn(
            "font-display whitespace-nowrap text-[1.2rem] font-extrabold tracking-tight sm:text-[1.35rem]",
            onDark ? "text-white" : "text-[#F3F6F4]",
          )}
        >
          <span className="text-[#001640] dark:text-[#F3F6F4]">Meu Controle</span>

          <span
            className={cn(
              onDark
                ? "text-[#1FAE6D]"
                : "text-[#1FAE6D]",

            )}
          >
            Financeiro

          </span>
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[8.5px] font-bold uppercase tracking-[0.16em] min-[360px]:block max-w-[200px] leading-tight",
            onDark ? "text-white/60" : "text-[#93A69D]",
          )}
        >
          Controle hoje, tranquilidade sempre
        </span>
      </span>
    </span>
  );

  if (compact) {
    return (
      <Link to={href as any}>
        <BrandMark className={cn("size-9", className)} />
      </Link>
    );
  }

  return (
    <Link to={href as any} className="focus:outline-none">
      {content}
    </Link>
  );
}
