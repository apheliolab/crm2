import { MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status";
import { DataTable, MetricRow } from "@/components/dashboard/shared";
import { clients } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function CampaignsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Campanhas"
        title="Performance de midia por cliente"
        description="Campanhas separadas por cliente, com investimento, vendas, ROI e prioridades de otimizacao."
        action={<Button><MousePointerClick className="h-4 w-4" /> Otimizar verba</Button>}
      />

      <div className="grid gap-5">
        {clients.map((client) => (
          <Card key={client.slug}>
            <CardHeader>
              <div>
                <CardTitle>{client.name}</CardTitle>
                <CardDescription>{client.segment} - responsavel {client.owner}</CardDescription>
              </div>
              <StatusBadge status={client.status} />
            </CardHeader>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
              <DataTable
                headers={["Campanha", "Canal", "Investimento", "Vendas", "ROI", "Status"]}
                rows={client.campaigns.map((campaign) => [
                  <span key="name" className="font-medium text-white">{campaign.name}</span>,
                  campaign.channel,
                  formatCurrency(campaign.spend),
                  campaign.sales,
                  `${campaign.roi}x`,
                  <StatusBadge key="status" status={campaign.status} />,
                ])}
              />

              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm font-semibold text-white">ROI por campanha</p>
                <p className="mt-1 text-sm text-muted">Priorizacao de verba por retorno rastreado.</p>
                <div className="mt-5 space-y-5">
                  {client.campaigns.map((campaign) => (
                    <MetricRow
                      key={campaign.name}
                      label={campaign.name}
                      value={`${campaign.roi}x`}
                      progress={Math.min(campaign.roi * 6, 100)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
