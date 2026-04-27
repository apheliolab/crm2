"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, GripVertical } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionIntro, StatusBadge } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { leadStatusOptions, type Lead, type LeadStatus } from "@/lib/crm";

export function FunnelPageContent() {
  const { leads, setLeadStatus } = useCrmStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return leadStatusOptions.map((status) => ({
      status,
      leads: leads.filter((lead) => lead.status === status),
    }));
  }, [leads]);

  function handleDrop(status: LeadStatus) {
    if (!draggingId) return;
    setLeadStatus(draggingId, status);
    setDraggingId(null);
  }

  return (
    <div>
      <SectionIntro
        eyebrow="Funil"
        title="Pipeline visual em estilo Kanban"
        description="Arraste os cards entre colunas para refletir a etapa atual do lead ou altere o status direto na tela de detalhes."
      />

      <div className="mb-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <ArrowRightLeft className="h-4 w-4 text-[#ff9d4d]" />
        O funil atualiza o CRM em tempo real com base no status de cada lead.
      </div>

      <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-7">
        {grouped.map((column) => (
          <div
            key={column.status}
            className="min-h-[220px] rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.status)}
          >
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <StatusBadge status={column.status} />
                <p className="mt-2 text-sm text-slate-300">{column.leads.length} lead(s)</p>
              </div>
            </div>

            <div className="space-y-3">
              {column.leads.map((lead) => (
                <FunnelCard key={lead.id} lead={lead} onDragStart={() => setDraggingId(lead.id)} onDragEnd={() => setDraggingId(null)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>Como usar</CardTitle>
              <CardDescription>Uma experiencia simples e comercial para o time não perder velocidade.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Capture o lead com nome, empresa e WhatsApp.",
              "Mova a oportunidade conforme o atendimento evolui.",
              "Abra o detalhe do lead para registrar contexto e observacoes.",
            ].map((text) => (
              <div key={text} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                {text}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FunnelCard({
  lead,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-lg border border-white/10 bg-[#07101a] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-[#ff6a00]/28 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{lead.name}</p>
          <p className="mt-1 text-sm text-slate-400">{lead.company}</p>
        </div>
        <GripVertical className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <p>{lead.interest}</p>
        <p className="text-slate-400">{lead.source}</p>
      </div>
    </div>
  );
}
