import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-md border border-white/10 bg-[#252525] px-4 text-sm font-medium text-[#f4f1ea] outline-none transition hover:bg-[#2d2d2d] focus:border-accent/60 focus:bg-[#252525] focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
