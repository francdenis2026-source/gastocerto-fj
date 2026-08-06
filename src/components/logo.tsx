import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/gastocerto-mark.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={markAsset.url}
      alt="GastoCerto"
      loading="eager"
      width={56}
      height={56}
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
    <span className={cn("inline-flex min-w-0 items-center gap-4 transition-all duration-500 group-hover:scale-[1.05] cursor-pointer", className)}>
      <div className="relative">
        <div className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-md opacity-0 transition-all duration-500 group-hover:opacity-100" />
        <BrandMark className="relative size-12 transition-all duration-700 ease-out group-hover:scale-110 sm:size-14" />
      </div>
      <span className="hidden min-w-0 flex-col leading-tight min-[360px]:flex">
        <span
          className={cn(
            "font-display whitespace-nowrap text-[1.25rem] font-bold tracking-[-0.03em] sm:text-[1.4rem]",
            onDark ? "text-white" : "text-foreground",
          )}
        >
           <span className={cn(onDark ? "text-white" : "text-foreground")}>Gasto</span>
           <span className="text-primary ml-0.5">Certo</span>
        </span>
        <span
          className={cn(
            "mt-0.5 hidden text-[9px] font-bold uppercase tracking-[0.1em] min-[360px]:block max-w-[200px] leading-tight opacity-70",
            onDark ? "text-primary/80" : "text-primary/60",
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
