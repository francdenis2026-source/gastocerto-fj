
import { Link } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("shrink-0 flex items-center justify-center bg-primary rounded-xl text-primary-foreground transition-transform duration-300 group-hover:rotate-6", className)}>
      <Bot className="size-2/3" />
    </div>
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
    <span className={cn("inline-flex min-w-0 items-center gap-3 transition-transform duration-200 group-hover:scale-105 cursor-pointer", className)}>
      <BrandMark className="size-10 lg:size-12" />
      <span className="hidden min-w-0 flex-col leading-none min-[360px]:flex">
        <span
          className={cn(
            "font-display whitespace-nowrap text-[1.4rem] font-black tracking-tighter lg:text-[1.6rem]",
            onDark ? "text-white" : "text-foreground",
          )}
        >
          Game<span className="text-primary italic">Carto</span>
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[9px] font-bold uppercase tracking-[0.3em] min-[360px]:block leading-tight",
            onDark ? "text-white/60" : "text-muted-foreground",
          )}
        >
          AI Financial Mastery
        </span>
      </span>
    </span>
  );

  if (compact) {
    return (
      <Link to={href as any}>
        <BrandMark className={cn("size-10", className)} />
      </Link>
    );
  }

  return (
    <Link to={href as any} className="focus:outline-none group">
      {content}
    </Link>
  );
}
