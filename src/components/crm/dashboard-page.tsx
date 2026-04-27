"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, CheckCircle2, CircleDashed, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadModal, MetricCard, SectionIntro, StatusBadge } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { formatMeetingDateTime, type LeadInput, leadStatusOptions } from "@/lib/crm";

export function DashboardPageContent() {
  const { addLead, leads } = useCrmStore();
  const [modalOpen, setModalOpen] = useState(false);

  const totals = {
    total: leads.length,
    novos: leads.filter((lead) => lead.status === "Novo").length,
    calls: leads.filter((lead) => lead.status === "Call agendada").length,
    propostas: leads.filter((lead) => lead.status === "Proposta enviada").length,
    ganhos: leads.filter((lead) => lead.status === "Ganho").length,
    perdidos: leads.filter((lead) => lead.status === "Perdido").length,
  };

  const recentLeads = [...leads]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);
  const nextMeetings = [...leads]
    .filter((lead) => lead.nextMeeting)
    .sort((a, b) => +new Date(a.nextMeeting!.scheduledAt) - +new Date(b.nextMeeting!.scheduledAt))
    .slice(0, 5);

  return (
    <div>
      <SectionIntro
        eyebrow="Dashboard"
        title="Visao comercial da Aphelio"
        description="Acompanhe os leads mais quentes, veja o funil evoluindo e identifique rapidamente gargalos entre atendimento, calls e propostas."
        actions={
          <Button size="lg" onClick={() => setModalOpen(true)}>
            Novo Lead
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total de leads" value={String(totals.total)} help="Base ativa de oportunidades" icon={<CircleDashed className="h-5 w-5" />} />
        <MetricCard label="Leads novos" value={String(totals.novos)} help="Entradas recentes aguardando resposta" icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard label="Calls agendadas" value={String(totals.calls)} help="Conversas ja encaminhadas para reuniao" icon={<CalendarClock className="h-5 w-5" />} />
        <MetricCard label="Propostas enviadas" value={String(totals.propostas)} help="Momento critico de follow-up comercial" icon={<FileText className="h-5 w-5" />} />
        <MetricCard label="Leads ganhos" value={String(totals.ganhos)} help="Negocios fechados no CRM" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Leads perdidos" value={String(totals.perdidos)} help="Oportunidades que pedem revisao de processo" icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>Leads com atividade recente</CardTitle>
              <CardDescription>Os ultimos movimentos do time comercial da Aphelio.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-sm text-slate-300">{lead.company}</p>
                    <p className="mt-2 text-xs text-slate-400">{lead.timeline[0]?.description}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>Mapa do funil</CardTitle>
              <CardDescription>Volume atual em cada etapa da jornada comercial.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {leadStatusOptions.map((status) => {
              const total = leads.filter((lead) => lead.status === status).length;
              const percentage = leads.length ? Math.round((total / leads.length) * 100) : 0;

              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <span className="text-sm text-slate-300">{status}</span>
                    </div>
                    <span className="text-sm text-slate-400">{total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ff6a00,#ff9d4d)]"
                      style={{ width: `${Math.max(percentage, total ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>Proximas reunioes agendadas</CardTitle>
              <CardDescription>Agenda comercial puxada direto dos agendamentos feitos no detalhe de cada lead.</CardDescription>
            </div>
          </CardHeader>
          {nextMeetings.length ? (
            <div className="space-y-3">
              {nextMeetings.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="block rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/7"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{lead.company}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatMeetingDateTime(lead.nextMeeting!.scheduledAt)} via {lead.nextMeeting!.channel}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-white">{lead.nextMeeting!.owner}</p>
                      <p className="mt-1 text-xs text-slate-400">{lead.nextMeeting!.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center">
              <p className="text-lg font-semibold text-white">Nenhuma reuniao futura</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Agende uma reuniao dentro do detalhe do lead para que ela apareca aqui automaticamente.
              </p>
            </div>
          )}
        </Card>
      </div>

      <LeadModal
        open={modalOpen}
        title="Novo lead"
        description="Cadastre um novo lead sem sair do dashboard."
        submitLabel="Criar lead"
        onClose={() => setModalOpen(false)}
        onSave={(value: LeadInput) => addLead(value)}
      />
    </div>
  );
}
