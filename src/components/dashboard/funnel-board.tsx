"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { leadStages, type Client, type Lead } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function FunnelBoard({ client, leads }: { client?: Client; leads?: Lead[] }) {
  if (leads) {
    const total = Math.max(leads.length, 1);

    return (
      <div className="grid gap-3 xl:grid-cols-5">
        {leadStages.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.status === stage);
          const forecast = stageLeads.reduce((sum, lead) => sum + lead.estimatedTicket, 0);
          const conversion = Math.round((stageLeads.length / total) * 100);

          return (
            <Card key={stage} className="min-h-64 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{stage}</p>
                  <p className="mt-1 text-xs text-muted">{stageLeads.length} oportunidades</p>
                </div>
                <Badge variant={stage === "Convertido" ? "success" : stage === "Contrato" ? "default" : "neutral"}>{conversion}%</Badge>
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-white">{formatCurrency(forecast)}</p>
              <Progress className="mt-4" value={Math.max(conversion, stageLeads.length ? 10 : 4)} indicatorClassName={stage === "Convertido" ? "bg-emerald-300" : "bg-accent"} />
              <div className="mt-5 space-y-2">
                {stageLeads.length ? (
                  stageLeads.map((lead) => (
                    <div key={lead.id} className="rounded-md border border-white/10 bg-white/[0.055] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">{lead.company}</p>
                          <p className="mt-1 text-xs text-muted">{lead.employee} - {lead.source}</p>
                        </div>
                        <Badge variant={lead.priority === "Alta" ? "warning" : "neutral"}>{lead.priority}</Badge>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-muted">{lead.nextStep}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-muted">
                    Nenhum lead nesta etapa.
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="grid gap-3 xl:grid-cols-6">
      {client.funnel.map((stage, index) => (
        <Card key={stage.stage} className="min-h-48 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{stage.stage}</p>
              <p className="mt-1 text-xs text-muted">{stage.avgTime} medio</p>
            </div>
            <Badge variant={index === 5 ? "danger" : "neutral"}>{stage.conversion}%</Badge>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{formatNumber(stage.value)}</p>
          <Progress className="mt-4" value={Math.max(stage.conversion, 8)} indicatorClassName={index === 5 ? "bg-red-300" : "bg-accent"} />
          <div className="mt-5 space-y-2">
            {Array.from({ length: Math.min(4, Math.max(1, Math.round((stage.value / client.metrics.leads) * 5))) }).map((_, cardIndex) => (
              <div key={cardIndex} className="rounded-md border border-white/10 bg-white/[0.045] p-2 text-xs text-muted">
                Lead #{index + 1}{cardIndex + 1}0 - {stage.stage}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
