import { Banknote, BriefcaseBusiness, CircleDollarSign, Landmark, Receipt, ShoppingCart, TrendingUp, WalletCards } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, RevenueAreaChart } from "@/components/dashboard/charts";
import { InsightCard } from "@/components/dashboard/insight-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MotionPanel } from "@/components/dashboard/motion-panel";
import { NewLeadDialog } from "@/components/dashboard/new-lead-dialog";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ClientList } from "@/components/dashboard/shared";
import { agencyTotals, aggregateRevenue, clients, companyFinancials, expenseBreakdown, insights } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function AgencyDashboard() {
  const ranking = [...clients].sort((a, b) => b.metrics.roi - a.metrics.roi);

  return (
    <div>
      <SectionHeader
        eyebrow="Central de comando"
        title="Financeiro e carteira de clientes"
        description="Visao da empresa com caixa, receita, lucro, despesas e clientes ativos. Indicadores de aquisicao ficam dentro do dashboard do cliente."
        action={<NewLeadDialog label="Adicionar lead" />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MotionPanel><KpiCard label="Clientes ativos" value={String(agencyTotals.activeClients)} change="+1 contrato em onboarding" icon={BriefcaseBusiness} /></MotionPanel>
        <MotionPanel delay={0.04}><KpiCard label="Saldo em caixa" value={formatCurrency(companyFinancials.cashBalance)} change="Runway saudavel" icon={WalletCards} /></MotionPanel>
        <MotionPanel delay={0.08}><KpiCard label="Receita bruta" value={formatCurrency(companyFinancials.grossRevenue)} change="+3,5% vs periodo" icon={Banknote} /></MotionPanel>
        <MotionPanel delay={0.12}><KpiCard label="Lucro liquido" value={formatCurrency(companyFinancials.netProfit)} change={`${companyFinancials.margin}% margem`} icon={TrendingUp} /></MotionPanel>
        <MotionPanel delay={0.16}><KpiCard label="MRR" value={formatCurrency(companyFinancials.mrr)} change="Contratos ativos" icon={CircleDollarSign} /></MotionPanel>
        <MotionPanel delay={0.2}><KpiCard label="Despesas" value={formatCurrency(companyFinancials.expenses)} change="Dentro do previsto" icon={Receipt} tone="neutral" /></MotionPanel>
        <MotionPanel delay={0.24}><KpiCard label="A receber" value={formatCurrency(companyFinancials.accountsReceivable)} change="Proximos 30 dias" icon={Landmark} /></MotionPanel>
        <MotionPanel delay={0.28}><KpiCard label="Vendas cliente" value={formatNumber(agencyTotals.sales)} change="Consolidado comercial" icon={ShoppingCart} /></MotionPanel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <RevenueAreaChart data={aggregateRevenue} title="Receita da empresa" description="Evolucao financeira da operacao Aphelio Lab." showLeads={false} />
        <DonutChart data={expenseBreakdown} title="Despesas por categoria" description="Composicao do custo operacional." />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cliente ativo</CardTitle>
              <CardDescription>Carteira simplificada com um cliente ficticio para evolucao do produto.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {ranking.map((client) => (
              <div key={client.slug} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-sm font-semibold text-[#f0b08d]">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-sm text-muted">{client.segment}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{client.metrics.roi}x</p>
                  <p className="text-xs text-muted">{formatCurrency(client.metrics.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <ClientList compact />
      </div>
    </div>
  );
}
