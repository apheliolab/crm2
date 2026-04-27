import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.08]", className)} />;
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
