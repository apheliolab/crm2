import { Brain, TrendingUp, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InsightCard({
  title,
  text,
  tone = "neutral",
}: {
  title: string;
  text: string;
  tone?: string;
}) {
  const Icon = tone === "warning" ? TriangleAlert : tone === "positive" ? TrendingUp : Brain;
  return (
    <Card
      className={cn(
        "p-4",
        tone === "warning" && "border-amber-400/20 bg-amber-400/[0.045]",
        tone === "positive" && "border-emerald-400/20 bg-emerald-400/[0.045]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-2">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
        </div>
      </div>
    </Card>
  );
}
