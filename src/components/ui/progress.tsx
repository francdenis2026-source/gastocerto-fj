"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={normalized}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full border border-border/70 bg-muted shadow-inner",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none",
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - normalized}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
