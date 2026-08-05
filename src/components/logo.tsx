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
    <span className={cn("inline-flex min-w-0 items-center gap-3 transition-all duration-300 group-hover:scale-[1.02] cursor-pointer", className)}>
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <BrandMark className="relative size-10 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 sm:size-12" />
      </div>
      <span className="hidden min-w-0 flex-col leading-tight min-[360px]:flex">
        <span
          className={cn(
            "font-display whitespace-nowrap text-[1.25rem] font-black tracking-[-0.03em] sm:text-[1.4rem] uppercase",
            onDark ? "text-white" : "text-[#F3F6F4]",
          )}
        >
          <span className="text-white">Gasto</span>
          <span className="text-[#1FAE6D] ml-1">Certo</span>
        </span>
        <span
          className={cn(
            "mt-0.5 hidden text-[9px] font-black uppercase tracking-[0.2em] min-[360px]:block max-w-[200px] leading-tight opacity-80",
            onDark ? "text-emerald-400/80" : "text-emerald-400/60",
          )}
        >
          Gestão Inteligente
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
