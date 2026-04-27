"use client";

import { useMemo } from "react";
import { Activity, Clock3, Gauge, Target } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/skeleton";
import { FunnelBoard } from "@/components/dashboard/funnel-board";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NewLeadDialog } from "@/components/dashboard/new-lead-dialog";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MetricRow } from "@/components/dashboard/shared";
import { leadStages } from "@/lib/data";
import { useLeadStore } from "@/hooks/use-lead-store";
import { formatCurrency } from "@/lib/utils";

export function FunnelPage() {
  const { addLead, leadItems } = useLeadStore();
  const totals = useMemo(() => {
    const converted = leadItems.filter((lead) => lead.status === "Convertido").length;
    const contracts = leadItems.filter((lead) => lead.status === "Contrato").length;
    const active = leadItems.filter((lead) => lead.status !== "Convertido").length;
    const forecast = leadItems.filter((lead) => lead.status !== "Convertido").reduce((sum, lead) => sum + lead.estimatedTicket, 0);
    const conversion = leadItems.length ? Math.round((converted / leadItems.length) * 100) : 0;

    return { converted, contracts, active, forecast, conversion };
  }, [leadItems]);

  return (
    <div>
      <SectionHeader eyebrow="CRM" title="Funil comercial" description="Pipeline visual integrado a lista de leads. Alteracoes de etapa nas informacoes do lead aparecem aqui." action={<NewLeadDialog label="Adicionar lead" onCreate={addLead} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Conversao total" value={`${totals.conversion}%`} change="Convertidos / leads" icon={Gauge} />
        <KpiCard label="Em contrato" value={String(totals.contracts)} change="Aguardando assinatura" icon={Clock3} tone="warning" />
        <KpiCard label="Oportunidades" value={String(totals.active)} change="Pipeline ativo" icon={Target} />
        <KpiCard label="Forecast" value={formatCurrency(totals.forecast)} change="Leads nao convertidos" icon={Activity} tone="neutral" />
      </div>
      <div className="mt-6">
        <FunnelBoard leads={leadItems} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Distribuicao por etapa</CardTitle><CardDescription>Volume atual vindo da lista de leads.</CardDescription></div></CardHeader>
          <div className="space-y-4">
            {leadStages.map((stage) => {
              const count = leadItems.filter((lead) => lead.status === stage).length;
              const progress = leadItems.length ? Math.round((count / leadItems.length) * 100) : 0;

              return <MetricRow key={stage} label={stage} value={String(count)} progress={Math.max(progress, count ? 10 : 0)} />;
            })}
          </div>
        </Card>
        <EmptyState title="CRM conectado aos leads" text="Abra um lead em Informacoes e altere a etapa para reorganizar automaticamente o funil." />
      </div>
    </div>
  );
}
