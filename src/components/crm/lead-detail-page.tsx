"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarPlus2, MessageCircleMore, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { formatLeadDate, formatMeetingDateTime, formatPhoneForWhatsapp, leadStatusOptions, type LeadMeeting } from "@/lib/crm";

export function LeadDetailPageContent({ leadId }: { leadId: string }) {
  const { addLeadNote, getLeadById, scheduleLeadMeeting, setLeadStatus, updateLead } = useCrmStore();
  const lead = getLeadById(leadId);
  const [note, setNote] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    date: "",
    time: "",
    channel: "Google Meet" as LeadMeeting["channel"],
    owner: "Vinicius Duque",
    location: "",
    durationMinutes: "45",
    notes: "",
  });

  const interactions = useMemo(() => lead?.timeline ?? [], [lead]);

  if (!lead) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8">
        <p className="text-lg font-semibold text-white">Lead nao encontrado</p>
        <p className="mt-3 text-sm text-slate-300">Esse registro pode ter sido removido da base local.</p>
        <div className="mt-5">
          <Link href="/leads">
            <Button variant="secondary">Voltar para leads</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/leads">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <a href={`https://wa.me/55${formatPhoneForWhatsapp(lead.whatsapp)}`} target="_blank" rel="noreferrer">
          <Button>
            <MessageCircleMore className="h-4 w-4" />
            Abrir WhatsApp
          </Button>
        </a>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>{lead.name}</CardTitle>
              <CardDescription>{lead.company}</CardDescription>
            </div>
            <StatusBadge status={lead.status} />
          </CardHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem label="WhatsApp" value={lead.whatsapp} />
            <InfoItem label="Nicho" value={lead.niche} />
            <InfoItem label="Interesse" value={lead.interest} />
            <InfoItem label="Origem" value={lead.source} />
            <InfoItem label="Criado em" value={formatLeadDate(lead.createdAt, { timeStyle: "short" })} />
            <InfoItem label="Ultima atualizacao" value={formatLeadDate(lead.updatedAt, { timeStyle: "short" })} />
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-200">
              Alterar status
              <Select
                value={lead.status}
                onChange={(event) => setLeadStatus(lead.id, event.target.value as (typeof leadStatusOptions)[number])}
              >
                {leadStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Observacoes principais
              <Textarea
                value={lead.notes}
                onChange={(event) => updateLead(lead.id, { notes: event.target.value })}
              />
            </label>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-xl">
            <CardHeader>
              <div>
                <CardTitle>Nova observacao</CardTitle>
                <CardDescription>Registre contexto relevante para o proximo contato.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3">
              <Textarea
                placeholder="Ex.: Cliente pediu retorno na segunda com escopo de automacao."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    addLeadNote(lead.id, note);
                    setNote("");
                  }}
                >
                  <NotebookPen className="h-4 w-4" />
                  Adicionar observacao
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <div>
                <CardTitle>Agendar reuniao</CardTitle>
                <CardDescription>Defina data, formato, responsavel e contexto para a proxima conversa comercial.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Data
                  <Input
                    type="date"
                    value={meetingForm.date}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, date: event.target.value }))}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Horario
                  <Input
                    type="time"
                    value={meetingForm.time}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, time: event.target.value }))}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Formato
                  <Select
                    value={meetingForm.channel}
                    onChange={(event) =>
                      setMeetingForm((current) => ({ ...current, channel: event.target.value as LeadMeeting["channel"] }))
                    }
                  >
                    <option>Google Meet</option>
                    <option>WhatsApp</option>
                    <option>Zoom</option>
                    <option>Telefone</option>
                    <option>Presencial</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Responsavel
                  <Input
                    value={meetingForm.owner}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, owner: event.target.value }))}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                  Link ou local
                  <Input
                    placeholder="Ex.: https://meet.google.com/... ou Endereco do escritorio"
                    value={meetingForm.location}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Duracao
                  <Input
                    type="number"
                    min="15"
                    step="15"
                    value={meetingForm.durationMinutes}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                  Pauta
                  <Textarea
                    placeholder="Ex.: Diagnostico do funil, budget, escopo e proximo passo."
                    value={meetingForm.notes}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!meetingForm.date || !meetingForm.time || !meetingForm.location.trim()) return;

                    scheduleLeadMeeting(lead.id, {
                      scheduledAt: new Date(`${meetingForm.date}T${meetingForm.time}:00`).toISOString(),
                      channel: meetingForm.channel,
                      owner: meetingForm.owner.trim() || "Responsavel comercial",
                      location: meetingForm.location.trim(),
                      durationMinutes: Number(meetingForm.durationMinutes) || 45,
                      notes: meetingForm.notes.trim(),
                    });
                    setMeetingForm({
                      date: "",
                      time: "",
                      channel: "Google Meet",
                      owner: "Vinicius Duque",
                      location: "",
                      durationMinutes: "45",
                      notes: "",
                    });
                  }}
                >
                  <CalendarPlus2 className="h-4 w-4" />
                  Agendar reuniao
                </Button>
              </div>
              {lead.nextMeeting ? (
                <div className="rounded-lg border border-[#ff6a00]/18 bg-[#ff6a00]/8 p-4">
                  <p className="text-sm font-medium text-white">Proxima reuniao marcada</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {formatMeetingDateTime(lead.nextMeeting.scheduledAt)} via {lead.nextMeeting.channel} com {lead.nextMeeting.owner}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{lead.nextMeeting.location}</p>
                  {lead.nextMeeting.notes ? <p className="mt-3 text-xs text-slate-300">{lead.nextMeeting.notes}</p> : null}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <div>
                <CardTitle>Historico de interacoes</CardTitle>
                <CardDescription>Criacao, mudancas de status e notas internas.</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-3">
              {interactions.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatLeadDate(item.createdAt, { timeStyle: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm text-white">{value}</p>
    </div>
  );
}
