"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { StatusBadge } from "@/components/dashboard/status";
import { clients, type Client } from "@/lib/data";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";

export function ClientLogo({ client }: { client: Client }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.07] text-xs font-semibold text-white">
      {initials(client.name)}
    </div>
  );
}

export function MetricRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

export function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr key={index} className="bg-card/40 transition hover:bg-white/[0.035]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 text-muted">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientDashboardAction({ client }: { client: Client }) {
  return (
    <Button variant="secondary" size="sm" asChild>
      <Link href={`/clientes/${client.slug}`}>Abrir dashboard</Link>
    </Button>
  );
}

export function ClientList({ compact = false, items = clients }: { compact?: boolean; items?: Client[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Clientes monitorados</CardTitle>
        <CardDescription>Status operacional, volume comercial e ultima sincronizacao.</CardDescription>
        </div>
        {!compact ? <NewClientDialog label="Cadastrar cliente" /> : null}
      </CardHeader>
      <DataTable
        headers={["Cliente", "Segmento", "Status", "Vendas", "Faturamento", "ROI", "Atualizacao", ""]}
        rows={items.map((client) => [
          <div key="client" className="flex items-center gap-3">
            <ClientLogo client={client} />
            <div>
              <p className="font-medium text-white">{client.name}</p>
              <p className="text-xs text-muted">{client.owner}</p>
            </div>
          </div>,
          client.segment,
          <StatusBadge key="status" status={client.status} />,
          formatNumber(client.metrics.sales),
          formatCurrency(client.metrics.revenue),
          <span key="roi" className="font-medium text-white">{client.metrics.roi}x</span>,
          client.lastUpdate,
          <ClientDashboardAction key="action" client={client} />,
        ])}
      />
    </Card>
  );
}

export function ClientCard({ client }: { client: Client }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClientLogo client={client} />
          <div>
            <p className="font-semibold text-white">{client.name}</p>
            <p className="text-sm text-muted">{client.segment}</p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricPill label="Vendas" value={formatNumber(client.metrics.sales)} />
        <MetricPill label="Receita" value={formatCurrency(client.metrics.revenue)} />
        <MetricPill label="ROI" value={`${client.metrics.roi}x`} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted">
        <span>{client.lastUpdate}</span>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/clientes/${client.slug}`}>Abrir dashboard <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    </Card>
  );
}

export function CampaignTable({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top campanhas</CardTitle>
          <CardDescription>Investimento, vendas e ROI por iniciativa.</CardDescription>
        </div>
      </CardHeader>
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
    </Card>
  );
}
