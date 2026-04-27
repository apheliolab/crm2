"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({
  className,
  value,
  indicatorClassName,
}: {
  className?: string;
  value: number;
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/[0.08]", className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full bg-accent transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
