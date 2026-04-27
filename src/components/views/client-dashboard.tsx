"use client";

import { type FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Download, FileText, Info, MousePointerClick, Plus, ReceiptText, ShoppingCart, Target, TrendingUp, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DonutChart, PerformanceLineChart } from "@/components/dashboard/charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status";
import { CampaignTable, DataTable, MetricPill } from "@/components/dashboard/shared";
import { clients, getClient, type Client } from "@/lib/data";
import { useClientStore } from "@/hooks/use-client-store";
import { formatCurrency, formatNumber } from "@/lib/utils";

type InfoMode = "metrics" | "campaign" | "sale" | null;

const initialInfoForm = {
  investment: "",
  leads: "",
  conversations: "",
  opportunities: "",
  sales: "",
  revenue: "",
  roi: "",
  responseTime: "",
  campaignName: "",
  campaignChannel: "Google Ads",
  campaignSpend: "",
  campaignLeads: "",
  campaignSales: "",
  campaignRoi: "",
  sellerName: "",
  sellerSales: "",
  sellerRevenue: "",
};

function toNumber(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function platformKey(channel: string) {
  const normalized = channel.toLowerCase();
  if (normalized.includes("meta") || normalized.includes("facebook") || normalized.includes("instagram")) return "meta";
  if (normalized.includes("google")) return "google";
  return "other";
}

function buildPlatformData(client: Client) {
  const metaCampaigns = client.campaigns.filter((campaign) => platformKey(campaign.channel) === "meta");
  const googleCampaigns = client.campaigns.filter((campaign) => platformKey(campaign.channel) === "google");
  const otherCampaigns = client.campaigns.filter((campaign) => platformKey(campaign.channel) === "other");

  function campaignTotals(campaigns: Client["campaigns"], fallbackCpc = client.metrics.cpc) {
    const investment = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    const leads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
    const conversions = campaigns.reduce((sum, campaign) => sum + campaign.sales, 0);
    const revenue = conversions * client.metrics.ticket;
    const clicks = fallbackCpc ? Math.round(investment / fallbackCpc) : leads * 3;

    return { investment, leads, conversions, revenue, clicks };
  }

  const meta = campaignTotals(metaCampaigns, Math.max(client.metrics.cpc * 0.9, 1));
  const google = campaignTotals(googleCampaigns, client.metrics.cpc);
  const other = campaignTotals(otherCampaigns, client.metrics.cpc);
  const systemRevenue = Math.max(client.metrics.revenue - meta.revenue - google.revenue - other.revenue, 0);

  return [
    {
      api: "Meta Ads API",
      platform: "META Facebook / Instagram Ads",
      color: "#ce6736",
      metrics: [
        ["Investimento", formatCurrency(meta.investment)],
        ["Leads", formatNumber(meta.leads)],
        ["Conversas", formatNumber(Math.round(meta.leads * 0.52))],
        ["CPC / CPM", `${formatCurrency(meta.leads ? meta.investment / meta.leads : 0)} / ${formatCurrency(client.metrics.cpm)}`],
        ["Conversoes", formatNumber(meta.conversions)],
      ],
      table: {
        investment: meta.investment,
        leads: meta.leads,
        conversations: Math.round(meta.leads * 0.52),
        clicks: 0,
        conversions: meta.conversions,
        opportunities: 0,
        sales: meta.conversions,
        revenue: meta.revenue,
        responseTime: "-",
      },
    },
    {
      api: "Google Ads API",
      platform: "GOOGLE Google Ads",
      color: "#f4f1ea",
      metrics: [
        ["Investimento", formatCurrency(google.investment)],
        ["Leads via conversao", formatNumber(google.leads)],
        ["Cliques", formatNumber(google.clicks)],
        ["Conversoes", formatNumber(google.conversions)],
        ["Receita atribuida", formatCurrency(google.revenue)],
      ],
      table: {
        investment: google.investment,
        leads: google.leads,
        conversations: 0,
        clicks: google.clicks,
        conversions: google.conversions,
        opportunities: 0,
        sales: google.conversions,
        revenue: google.revenue,
        responseTime: "-",
      },
    },
    {
      api: "WhatsApp / Sistema proprio",
      platform: "WHATSAPP / SISTEMA",
      color: "#22c55e",
      metrics: [
        ["Conversas reais", formatNumber(client.metrics.conversations)],
        ["Oportunidades", formatNumber(client.metrics.opportunities)],
        ["Vendas", formatNumber(client.metrics.sales)],
        ["Tempo de resposta", client.metrics.responseTime],
        ["Receita comercial", formatCurrency(systemRevenue)],
      ],
      table: {
        investment: other.investment,
        leads: other.leads,
        conversations: client.metrics.conversations,
        clicks: 0,
        conversions: client.metrics.sales,
        opportunities: client.metrics.opportunities,
        sales: client.metrics.sales,
        revenue: systemRevenue,
        responseTime: client.metrics.responseTime,
      },
    },
  ];
}

export function ClientDashboard({ slug }: { slug?: string }) {
  const { clientItems, hydrated, updateClient } = useClientStore();
  const storedClient = clientItems.find((item) => item.slug === slug);
  const staticClient = clients.find((item) => item.slug === slug);
  const client = storedClient ?? staticClient ?? (!slug && hydrated ? getClient(slug) : undefined);
  const [infoMode, setInfoMode] = useState<InfoMode>(null);
  const [infoForm, setInfoForm] = useState(initialInfoForm);
  const [savedInfo, setSavedInfo] = useState(false);
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [contractFileName, setContractFileName] = useState("");

  if (!client) {
    return <Card>Carregando dashboard do cliente...</Card>;
  }

  const platforms = buildPlatformData(client);
  const totals = platforms.reduce(
    (acc, platform) => ({
      investment: acc.investment + platform.table.investment,
      leads: acc.leads + platform.table.leads,
      conversations: acc.conversations + platform.table.conversations,
      clicks: acc.clicks + platform.table.clicks,
      conversions: acc.conversions + platform.table.conversions,
      opportunities: acc.opportunities + platform.table.opportunities,
      sales: acc.sales + platform.table.sales,
      revenue: acc.revenue + platform.table.revenue,
    }),
    { investment: 0, leads: 0, conversations: 0, clicks: 0, conversions: 0, opportunities: 0, sales: 0, revenue: 0 },
  );
  const platformChart = platforms.map((platform) => ({ name: platform.platform.split(" ")[0], value: Math.max(platform.table.leads + platform.table.conversations, 1), color: platform.color }));

  function updateForm(field: keyof typeof infoForm, value: string) {
    setInfoForm((current) => ({ ...current, [field]: value }));
    setSavedInfo(false);
  }

  function openInfo(mode: InfoMode) {
    setInfoMode(mode);
    setInfoForm(initialInfoForm);
    setSavedInfo(false);
  }

  function closeInfo() {
    setInfoMode(null);
    setSavedInfo(false);
  }

  function openClientInfo() {
    if (!client) return;
    setContractFileName(client.contractFileName ?? "");
    setClientInfoOpen(true);
  }

  function saveContractFile(fileName: string) {
    if (!client) return;
    setContractFileName(fileName);
    updateClient(client.slug, { contractFileName: fileName });
  }

  function handleInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeClient = client;
    if (!infoMode || !activeClient) return;

    if (infoMode === "metrics") {
      const sales = toNumber(infoForm.sales) || activeClient.metrics.sales;
      const revenue = toNumber(infoForm.revenue) || activeClient.metrics.revenue;

      updateClient(activeClient.slug, {
        metrics: {
          ...activeClient.metrics,
          investment: toNumber(infoForm.investment) || activeClient.metrics.investment,
          leads: toNumber(infoForm.leads) || activeClient.metrics.leads,
          conversations: toNumber(infoForm.conversations) || activeClient.metrics.conversations,
          opportunities: toNumber(infoForm.opportunities) || activeClient.metrics.opportunities,
          sales,
          revenue,
          roi: toNumber(infoForm.roi) || activeClient.metrics.roi,
          responseTime: infoForm.responseTime || activeClient.metrics.responseTime,
          ticket: sales ? Math.round(revenue / sales) : activeClient.metrics.ticket,
        },
      });
    }

    if (infoMode === "campaign") {
      const campaign = {
        name: infoForm.campaignName || "Nova campanha",
        channel: infoForm.campaignChannel,
        spend: toNumber(infoForm.campaignSpend),
        leads: toNumber(infoForm.campaignLeads),
        sales: toNumber(infoForm.campaignSales),
        roi: toNumber(infoForm.campaignRoi),
        status: "Otimizar" as const,
      };

      updateClient(activeClient.slug, {
        campaigns: [campaign, ...activeClient.campaigns],
        channels: [
          { name: campaign.channel, leads: campaign.leads, roi: campaign.roi, color: "#ce6736" },
          ...activeClient.channels,
        ],
      });
    }

    if (infoMode === "sale") {
      const seller = {
        name: infoForm.sellerName || "Comercial",
        sales: toNumber(infoForm.sellerSales),
        revenue: toNumber(infoForm.sellerRevenue),
      };
      const sales = activeClient.metrics.sales + seller.sales;
      const revenue = activeClient.metrics.revenue + seller.revenue;

      updateClient(activeClient.slug, {
        metrics: {
          ...activeClient.metrics,
          sales,
          revenue,
          ticket: sales ? Math.round(revenue / sales) : activeClient.metrics.ticket,
        },
        salesByOwner: [seller, ...activeClient.salesByOwner],
      });
    }

    setSavedInfo(true);
  }

  return (
    <div>
      <SectionHeader
        eyebrow={client.segment}
        title={client.name}
        description={`Responsavel: ${client.owner}.`}
        action={
          <>
            <StatusBadge status={client.status} />
            <Button variant="secondary" size="icon" onClick={openClientInfo} aria-label="Informacoes do cliente">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => openInfo("sale")}><Plus className="h-4 w-4" /> Venda</Button>
            <Button><Download className="h-4 w-4" /> Relatorio PDF</Button>
          </>
        }
      />

      <SectionHeader className="mt-2" eyebrow="Geral" title="Todas as plataformas somadas" description="Consolidado executivo das APIs conectadas e da operacao comercial do cliente." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Investimento" value={formatCurrency(totals.investment || client.metrics.investment)} change="Meta + Google" icon={ReceiptText} />
        <KpiCard label="Leads" value={formatNumber(totals.leads || client.metrics.leads)} change="Conversoes de campanhas" icon={UsersRound} />
        <KpiCard label="Cliques" value={formatNumber(totals.clicks)} change="Google Ads API" icon={MousePointerClick} tone="neutral" />
        <KpiCard label="Conversas" value={formatNumber(totals.conversations || client.metrics.conversations)} change="Meta + WhatsApp" icon={Target} />
        <KpiCard label="Conversoes" value={formatNumber(totals.conversions)} change="Eventos rastreados" icon={TrendingUp} />
        <KpiCard label="Oportunidades" value={formatNumber(totals.opportunities || client.metrics.opportunities)} change="Sistema comercial" icon={Target} />
        <KpiCard label="Vendas" value={formatNumber(client.metrics.sales)} change={`${formatCurrency(client.metrics.ticket)} ticket`} icon={ShoppingCart} />
        <KpiCard label="Faturamento" value={formatCurrency(client.metrics.revenue || totals.revenue)} change={`${client.metrics.roi}x ROI`} icon={Banknote} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <PerformanceLineChart data={client.revenueSeries} />
        <DonutChart data={platformChart} title="Volume por API" description="Leads e conversas distribuidos por integracao." />
      </div>

      <SectionHeader
        className="mt-8"
        eyebrow="APIs"
        title="Dados discriminados por plataforma"
        description="Cada bloco representa uma origem automatizada de dados para o cliente."
        action={<Button variant="secondary" onClick={() => openInfo("metrics")}><Plus className="h-4 w-4" /> Metricas</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.api}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: platform.color }}>{platform.api}</p>
                <CardTitle className="mt-2">{platform.platform}</CardTitle>
              </div>
              <span className="h-3 w-3 rounded-full" style={{ background: platform.color }} />
            </div>
            <div className="grid gap-3">
              {platform.metrics.map(([label, value]) => (
                <MetricPill key={label} label={label} value={value} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader
        className="mt-8"
        eyebrow="Aquisicao"
        title="Campanhas por plataforma"
        description="Aquisicao concentrada em campanhas conectadas por API."
        action={<Button variant="secondary" onClick={() => openInfo("campaign")}><Plus className="h-4 w-4" /> Campanha</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <CampaignTable client={client} />
        <DataTable
          headers={["API", "Investimento", "Leads", "Conversas", "Cliques", "Conversoes", "Vendas", "Receita"]}
          rows={platforms.map((platform) => [
            <span key="api" className="font-medium text-white">{platform.api}</span>,
            formatCurrency(platform.table.investment),
            formatNumber(platform.table.leads),
            formatNumber(platform.table.conversations),
            platform.table.clicks ? formatNumber(platform.table.clicks) : "-",
            formatNumber(platform.table.conversions),
            formatNumber(platform.table.sales),
            formatCurrency(platform.table.revenue),
          ])}
        />
      </div>
      <ClientInfoDialog
        client={client}
        form={infoForm}
        mode={infoMode}
        saved={savedInfo}
        onChange={updateForm}
        onClose={closeInfo}
        onSubmit={handleInfoSubmit}
      />
      <ClientProfileDialog
        client={client}
        contractFileName={contractFileName}
        open={clientInfoOpen}
        onClose={() => setClientInfoOpen(false)}
        onContractChange={saveContractFile}
      />
    </div>
  );
}

function ClientProfileDialog({
  client,
  contractFileName,
  open,
  onClose,
  onContractChange,
}: {
  client: Client;
  contractFileName: string;
  open: boolean;
  onClose: () => void;
  onContractChange: (fileName: string) => void;
}) {
  const contract = client.contract;
  const attachedContract = contractFileName || client.contractFileName;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,19,19,0.88)] p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="form-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Informacoes do cliente</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{client.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Dados cadastrais, status operacional e contrato anexado.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoItem label="Empresa" value={client.name} />
              <InfoItem label="Nicho" value={client.segment} />
              <InfoItem label="Responsavel" value={client.owner} />
              <InfoItem label="Status" value={client.status} />
              <InfoItem label="CNPJ / Documento" value={client.document || "Nao informado"} />
              <InfoItem label="Email" value={client.email || "Nao informado"} />
              <InfoItem label="WhatsApp" value={client.phone || "Nao informado"} />
              <InfoItem label="Plano" value={client.plan || "Performance"} />
              <InfoItem label="Ultima atualizacao" value={client.lastUpdate} />
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.055] p-4">
              <div className="mb-4 flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-white">Contrato</p>
                  <p className="mt-1 text-sm text-muted">Informacoes comerciais, vigencia, cobranca, escopo contratado e anexo assinado.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <InfoItem label="Numero" value={contract?.number || "A definir"} />
                <InfoItem label="Status" value={contract?.status || (attachedContract ? "Assinado" : "Pendente")} />
                <InfoItem label="Arquivo anexado" value={attachedContract || "Nenhum contrato anexado ainda."} />
                <InfoItem label="Mensalidade" value={formatCurrency(contract?.monthlyValue ?? 0)} />
                <InfoItem label="Implementacao" value={formatCurrency(contract?.implementationValue ?? 0)} />
                <InfoItem label="Prazo" value={contract?.term || "A definir"} />
                <InfoItem label="Assinatura" value={contract?.signedAt || "A definir"} />
                <InfoItem label="Inicio" value={contract?.startDate || "A definir"} />
                <InfoItem label="Termino" value={contract?.endDate || "A definir"} />
                <InfoItem label="Vencimento" value={contract?.paymentDueDay ? `Dia ${contract.paymentDueDay}` : "A definir"} />
                <InfoItem label="Pagamento" value={contract?.paymentMethod || "A definir"} />
                <InfoItem label="Responsavel financeiro" value={contract?.billingResponsible || client.owner} />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoItem label="Servicos contratados" value={contract?.services?.length ? contract.services.join(", ") : "Nao informado"} />
                <InfoItem label="Renovacao" value={contract?.renewal || "A definir"} />
                <InfoItem label="Cancelamento" value={contract?.cancellationNotice || "A definir"} />
                <InfoItem label="Observacoes" value={contract?.notes || "Nenhuma observacao registrada."} />
              </div>

              <label className="mt-4 grid gap-2 text-sm text-[#f4f1ea]">
                Atualizar contrato assinado
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(event) => onContractChange(event.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={onClose}>Fechar</Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ClientInfoDialog({
  client,
  form,
  mode,
  saved,
  onChange,
  onClose,
  onSubmit,
}: {
  client: Client;
  form: typeof initialInfoForm;
  mode: InfoMode;
  saved: boolean;
  onChange: (field: keyof typeof initialInfoForm, value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const title = mode === "metrics" ? "Adicionar metricas" : mode === "campaign" ? "Adicionar campanha" : "Adicionar venda";

  return (
    <AnimatePresence>
      {mode ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,19,19,0.88)] p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.form
            onSubmit={onSubmit}
            className="form-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{client.name}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Complete os dados do dashboard conforme a operacao do cliente evoluir.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {mode === "metrics" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Investimento" value={form.investment} onChange={(value) => onChange("investment", value)} placeholder="21800" />
                <Field label="Leads" value={form.leads} onChange={(value) => onChange("leads", value)} placeholder="934" />
                <Field label="Conversas" value={form.conversations} onChange={(value) => onChange("conversations", value)} placeholder="706" />
                <Field label="Oportunidades" value={form.opportunities} onChange={(value) => onChange("opportunities", value)} placeholder="318" />
                <Field label="Vendas" value={form.sales} onChange={(value) => onChange("sales", value)} placeholder="74" />
                <Field label="Faturamento" value={form.revenue} onChange={(value) => onChange("revenue", value)} placeholder="286500" />
                <Field label="ROI" value={form.roi} onChange={(value) => onChange("roi", value)} placeholder="13,1" />
                <Field label="Tempo de resposta" value={form.responseTime} onChange={(value) => onChange("responseTime", value)} placeholder="3m 04s" />
              </div>
            ) : null}

            {mode === "campaign" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nome da campanha" value={form.campaignName} onChange={(value) => onChange("campaignName", value)} placeholder="Campanha de aquisicao" />
                <label className="grid gap-2 text-sm">
                  Canal
                  <Select value={form.campaignChannel} onChange={(event) => onChange("campaignChannel", event.target.value)}>
                    <option>Google Ads</option>
                    <option>Meta Ads</option>
                    <option>Indicacao</option>
                    <option>Organico</option>
                    <option>WhatsApp</option>
                  </Select>
                </label>
                <Field label="Investimento" value={form.campaignSpend} onChange={(value) => onChange("campaignSpend", value)} placeholder="7600" />
                <Field label="Leads gerados" value={form.campaignLeads} onChange={(value) => onChange("campaignLeads", value)} placeholder="246" />
                <Field label="Vendas" value={form.campaignSales} onChange={(value) => onChange("campaignSales", value)} placeholder="31" />
                <Field label="ROI" value={form.campaignRoi} onChange={(value) => onChange("campaignRoi", value)} placeholder="15,7" />
              </div>
            ) : null}

            {mode === "sale" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Vendedor / unidade" value={form.sellerName} onChange={(value) => onChange("sellerName", value)} placeholder="Comercial interno" />
                <Field label="Vendas" value={form.sellerSales} onChange={(value) => onChange("sellerSales", value)} placeholder="12" />
                <Field label="Faturamento" value={form.sellerRevenue} onChange={(value) => onChange("sellerRevenue", value)} placeholder="48000" />
              </div>
            ) : null}

            {saved ? (
              <div className="mt-4 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                Informacoes adicionadas ao dashboard do cliente.
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
              <Button type="submit">Salvar informacoes</Button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
