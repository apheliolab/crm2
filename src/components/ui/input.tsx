import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-md border border-white/10 bg-white/[0.075] px-4 text-sm text-[#f4f1ea] outline-none transition placeholder:text-[#9f9f9f] hover:bg-white/[0.09] focus:border-accent/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-accent/20 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-none rounded-md border border-white/10 bg-white/[0.075] px-4 py-3 text-sm text-[#f4f1ea] outline-none transition placeholder:text-[#9f9f9f] hover:bg-white/[0.09] focus:border-accent/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}
