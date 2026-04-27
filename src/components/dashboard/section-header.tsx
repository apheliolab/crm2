import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
