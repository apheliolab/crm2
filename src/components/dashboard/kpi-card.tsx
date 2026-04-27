import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "positive",
}: {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  tone?: "positive" | "warning" | "neutral";
}) {
  const isPositive = tone === "positive";
  return (
    <Card className="min-h-32 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className="rounded-md border border-accent/20 bg-accent/10 p-2 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change ? (
        <div
          className={cn(
            "mt-5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
            isPositive
              ? "bg-emerald-400/10 text-emerald-200"
              : tone === "warning"
                ? "bg-amber-400/10 text-amber-200"
                : "bg-white/[0.06] text-muted",
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {change}
        </div>
      ) : null}
    </Card>
  );
}
