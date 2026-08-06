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
      <span className="flex items-baseline font-display text-[1.5rem] font-bold tracking-[-0.03em] sm:text-[1.75rem]">
        <span className={cn(onDark ? "text-white" : "text-foreground")}>GASTO</span>
        <span className="text-primary italic ml-2">CERTO</span>
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
