"use client";

import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, FileText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";
import { RevenueAreaChart } from "@/components/dashboard/charts";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DataTable, MetricPill } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/dashboard/status";
import { clients, getClient, reportSections } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

const periodLabels: Record<string, string> = {
  "7d": "Ultimos 7 dias",
  "30d": "Ultimos 30 dias",
  "90d": "Ultimos 90 dias",
  ytd: "Ano atual",
};

const defaultComment =
  "Priorizar campanhas de fundo de funil no Google, manter cadencia comercial abaixo de 24 horas e revisar propostas paradas no CRM.";

export function ReportsPage() {
  const [selectedClientSlug, setSelectedClientSlug] = useState(clients[0].slug);
  const [period, setPeriod] = useState("30d");
  const [includedSections, setIncludedSections] = useState<string[]>(reportSections);
  const [comment, setComment] = useState(defaultComment);
  const [generated, setGenerated] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");

  const client = getClient(selectedClientSlug);

  const bestChannel = useMemo(() => {
    return [...client.channels].sort((a, b) => b.roi - a.roi)[0];
  }, [client.channels]);

  const funnelBottleneck = useMemo(() => {
    return [...client.funnel].sort((a, b) => b.avgTime.localeCompare(a.avgTime))[0];
  }, [client.funnel]);

  function toggleSection(section: string, checked: boolean) {
    setIncludedSections((current) => {
      if (checked) return [...new Set([...current, section])];
      return current.filter((item) => item !== section);
    });
    setGenerated(false);
  }

  function generateReport() {
    setGenerated(true);
    setGeneratedAt(new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date()));
  }

  function exportPdf() {
    if (!generated) generateReport();
    window.print();
  }

  function sectionEnabled(section: string) {
    return includedSections.includes(section);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Relatorios"
        title="Gerador de relatorio de performance"
        description="Monte uma entrega executiva com capa premium, metricas, CRM, vendas, campanhas e comentario estrategico da agencia."
        action={
          <>
            <Button variant="secondary" onClick={generateReport}>
              <RefreshCw className="h-4 w-4" /> Gerar relatorio
            </Button>
            <Button onClick={exportPdf}>
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="form-panel no-print sticky top-28 self-start">
          <CardHeader>
            <div>
              <CardTitle>Configuracao</CardTitle>
              <CardDescription>Defina o escopo antes de gerar o arquivo final.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-3">
            <label className="grid gap-2 text-sm">
              Cliente
              <Select value={selectedClientSlug} onChange={(event) => setSelectedClientSlug(event.target.value)}>
                {clients.map((clientOption) => (
                  <option key={clientOption.slug} value={clientOption.slug}>
                    {clientOption.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2 text-sm">
              Periodo
              <Select value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option value="7d">Ultimos 7 dias</option>
                <option value="30d">Ultimos 30 dias</option>
                <option value="90d">Ultimos 90 dias</option>
                <option value="ytd">Ano atual</option>
              </Select>
            </label>

            <div>
              <p className="mb-3 text-sm font-medium text-white">Secoes incluidas</p>
              <div className="space-y-3">
                {reportSections.map((section) => (
                  <label key={section} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.055] p-3 text-sm text-muted">
                    <Checkbox
                      checked={sectionEnabled(section)}
                      onCheckedChange={(checked) => toggleSection(section, Boolean(checked))}
                    />
                    {section}
                  </label>
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-sm">
              Comentario estrategico da agencia
              <Textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  setGenerated(false);
                }}
                placeholder="Escreva a leitura estrategica que vai no fechamento do relatorio."
              />
            </label>

            <div className="rounded-lg border border-[rgba(206,103,54,0.28)] bg-[rgba(206,103,54,0.16)] p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-white">Status do relatorio</p>
                  <p className="mt-1 text-sm leading-6 text-[#f4f1ea]">
                    {generated ? `Gerado em ${generatedAt}. Pronto para exportar.` : "Aguardando geracao. O preview acompanha suas escolhas em tempo real."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="report-shell overflow-hidden p-0">
          <div className="report-cover relative overflow-hidden border-b border-white/10 p-8">
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full border border-accent/20" />
            <div className="absolute -right-10 top-28 h-40 w-40 rounded-full border border-white/10" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-10 inline-flex items-center gap-2 rounded-md border border-accent/30 bg-[rgba(206,103,54,0.16)] px-3 py-2 text-sm text-[#f4f1ea]">
                  <Image src="/aphelio-logo.png" alt="Aphelio Lab" width={18} height={18} className="h-4.5 w-4.5 object-contain" /> Aphelio Lab
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f4f1ea]/70">Performance Report</p>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {client.name}
                </h2>
                <div className="report-accent-line mt-5 h-px w-72" />
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#f4f1ea]">
                  {periodLabels[period]} com leitura executiva de aquisicao, CRM, vendas e proximos movimentos comerciais.
                </p>
              </div>
              <div className="relative rounded-lg border border-white/10 bg-[rgba(19,19,19,0.68)] p-4 text-right backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Periodo</p>
                <p className="mt-2 text-lg font-semibold text-white">{periodLabels[period]}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Badge>{generated ? "Gerado" : "Preview"}</Badge>
                  <StatusBadge status={client.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="report-paper grid gap-4 border-b border-white/10 p-6 md:grid-cols-4">
            <ReportKpi label="Faturamento" value={formatCurrency(client.metrics.revenue)} detail="Receita rastreada" />
            <ReportKpi label="ROI" value={`${client.metrics.roi}x`} detail="Retorno no periodo" />
            <ReportKpi label="Vendas" value={formatNumber(client.metrics.sales)} detail="Conversoes fechadas" />
            <ReportKpi label="Ticket medio" value={formatCurrency(client.metrics.ticket)} detail="Receita por venda" />
          </div>

          <div className="space-y-6 p-6">
            {sectionEnabled("Resumo executivo") ? (
              <ReportSection title="Resumo executivo" icon={<Eye className="h-4 w-4" />}>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricPill label="Investimento" value={formatCurrency(client.metrics.investment)} />
                  <MetricPill label="Oportunidades" value={formatNumber(client.metrics.opportunities)} />
                  <MetricPill label="Tempo de resposta" value={client.metrics.responseTime} />
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-[#0b0d0f]/70 p-5 text-sm leading-6 text-[#f4f1ea]">
                  {client.name} opera com ROI de {client.metrics.roi}x, {formatNumber(client.metrics.sales)} vendas e faturamento rastreado de {formatCurrency(client.metrics.revenue)} no periodo selecionado.
                </div>
              </ReportSection>
            ) : null}

            {sectionEnabled("Aquisicao") ? (
              <ReportSection title="Aquisicao" icon={<Eye className="h-4 w-4" />}>
                <RevenueAreaChart data={client.revenueSeries} title="Evolucao de receita" description="Curva de receita rastreada no periodo." showLeads={false} />
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <MetricPill label="CPC medio" value={formatCurrency(client.metrics.cpc)} />
                  <MetricPill label="CTR" value={`${client.metrics.ctr}%`} />
                  <MetricPill label="CPM" value={formatCurrency(client.metrics.cpm)} />
                  <MetricPill label="CPL" value={formatCurrency(client.metrics.cpl)} />
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-[#0b0d0f]/70 p-5 text-sm text-[#f4f1ea]">
                  Melhor canal por ROI: <span className="font-medium text-white">{bestChannel.name}</span> com {bestChannel.roi}x.
                </div>
              </ReportSection>
            ) : null}

            {sectionEnabled("CRM e funil") ? (
              <ReportSection title="CRM e funil" icon={<Eye className="h-4 w-4" />}>
                <div className="grid gap-3 md:grid-cols-3">
                  {client.funnel.map((stage) => (
                    <div key={stage.stage} className="rounded-lg border border-white/10 bg-[#0b0d0f]/70 p-4">
                      <p className="text-sm font-medium text-white">{stage.stage}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(stage.value)}</p>
                      <p className="mt-1 text-xs text-muted">{stage.conversion}% conversao - {stage.avgTime}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-[rgba(206,103,54,0.28)] bg-[rgba(206,103,54,0.16)] p-4 text-sm leading-6 text-[#f4f1ea]">
                  Gargalo principal: {funnelBottleneck.stage}. Revisar cadencia e proximo passo comercial nessa etapa.
                </div>
              </ReportSection>
            ) : null}

            {sectionEnabled("Vendas") ? (
              <ReportSection title="Vendas" icon={<Eye className="h-4 w-4" />}>
                <DataTable
                  headers={["Responsavel", "Vendas", "Faturamento", "Participacao"]}
                  rows={client.salesByOwner.map((seller) => [
                    <span key="name" className="font-medium text-white">{seller.name}</span>,
                    seller.sales,
                    formatCurrency(seller.revenue),
                    `${Math.round((seller.revenue / client.metrics.revenue) * 100)}%`,
                  ])}
                />
              </ReportSection>
            ) : null}

            {sectionEnabled("Insights estrategicos") ? (
              <ReportSection title="Insights estrategicos" icon={<Eye className="h-4 w-4" />}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Insight title="Canal com melhor ROI" text={`${bestChannel.name} lidera retorno e deve receber prioridade de verba.`} />
                  <Insight title="Ponto de atencao no CRM" text={`${funnelBottleneck.stage} concentra maior tempo medio no funil.`} />
                  <Insight title="Proximo movimento" text="Ajustar cadencia comercial e manter verba nos canais com ROI acima da meta." />
                  <Insight title="Comentario da agencia" text={comment || "Sem comentario estrategico informado."} />
                </div>
              </ReportSection>
            ) : null}

            {generated ? (
              <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                Relatorio final gerado. Use Exportar PDF para abrir a impressao do navegador.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="report-section rounded-lg border border-white/10 p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-accent/30 bg-accent/10 p-2 text-accent">{icon}</div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="h-px w-20 bg-accent/50" />
      </div>
      {children}
    </section>
  );
}

function ReportKpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0d0f]/72 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-[#f4f1ea]/70">{detail}</p>
    </div>
  );
}

function Insight({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0d0f]/70 p-4">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
