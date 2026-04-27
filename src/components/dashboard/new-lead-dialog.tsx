"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, MessageCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { leadStages, type Lead, type LeadStatus } from "@/lib/data";

const initialLead = {
  company: "",
  employee: "",
  whatsapp: "",
  role: "",
  niche: "Clinica",
  source: "Google Ads",
  stage: "Novo",
  priority: "Alta",
  interest: "Consulta avaliativa",
  estimatedTicket: "",
  notes: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function toWhatsAppNumber(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function NewLeadDialog({ label = "Adicionar lead", onCreate }: { label?: string; onCreate?: (lead: Lead) => void }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lead, setLead] = useState(initialLead);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const whatsappUrl = useMemo(() => {
    const phone = toWhatsAppNumber(lead.whatsapp);
    if (!phone) return "";

    const message = [
      `Ola ${lead.employee || "tudo bem"}!`,
      `Aqui e da Aphelio Lab. Recebemos o interesse da empresa ${lead.company || "informada"} em ${lead.interest}.`,
      `Vou te ajudar com os proximos passos pelo WhatsApp.`,
    ].join("\n\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [lead.company, lead.employee, lead.interest, lead.whatsapp]);

  function updateLead(field: keyof typeof lead, value: string) {
    setLead((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate?.({
      id: `LD-${Date.now().toString().slice(-4)}`,
      company: lead.company || "Empresa sem nome",
      employee: lead.employee || "Contato sem nome",
      role: lead.role || "Responsavel comercial",
      whatsapp: lead.whatsapp,
      email: "",
      source: lead.source,
      niche: lead.niche,
      status: lead.stage as LeadStatus,
      priority: lead.priority as Lead["priority"],
      interest: lead.interest,
      estimatedTicket: Number(onlyDigits(lead.estimatedTicket)) || 0,
      createdAt: "Agora",
      nextStep: lead.stage === "Contrato" ? "Anexar contrato assinado para conversao" : "Realizar primeiro contato e qualificar necessidade",
      notes: lead.notes || "Lead criado manualmente no hub.",
    });
    setSaved(true);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,19,19,0.88)] p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-lead-title"
              className="form-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">CRM</p>
                  <h2 id="new-lead-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Cadastrar novo lead
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Registre a oportunidade, qualifique o contato e encaminhe a conversa direto para o WhatsApp.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar formulario">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Nome da empresa
                    <Input
                      value={lead.company}
                      onChange={(event) => updateLead("company", event.target.value)}
                      placeholder="Ex.: Vita Core Odontologia"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Nome do funcionario
                    <Input
                      value={lead.employee}
                      onChange={(event) => updateLead("employee", event.target.value)}
                      placeholder="Ex.: Amanda Ribeiro"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    WhatsApp
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        value={lead.whatsapp}
                        onChange={(event) => updateLead("whatsapp", event.target.value)}
                        placeholder="(11) 99999-9999"
                        inputMode="tel"
                        required
                      />
                      <Button variant="secondary" asChild={Boolean(whatsappUrl)} disabled={!whatsappUrl}>
                        {whatsappUrl ? (
                          <a href={whatsappUrl} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" /> Abrir app
                          </a>
                        ) : (
                          <span>
                            <MessageCircle className="h-4 w-4" /> Abrir app
                          </span>
                        )}
                      </Button>
                    </div>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Cargo / funcao
                    <Input
                      value={lead.role}
                      onChange={(event) => updateLead("role", event.target.value)}
                      placeholder="Ex.: Diretora comercial"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Origem
                    <Select value={lead.source} onChange={(event) => updateLead("source", event.target.value)}>
                      <option>Google Ads</option>
                      <option>Meta Ads</option>
                      <option>Indicacao</option>
                      <option>WhatsApp</option>
                      <option>Organico</option>
                    </Select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Nicho
                    <Input
                      value={lead.niche}
                      onChange={(event) => updateLead("niche", event.target.value)}
                      placeholder="Ex.: Clinica, pizzaria, imobiliaria..."
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Etapa no CRM
                    <Select value={lead.stage} onChange={(event) => updateLead("stage", event.target.value)}>
                      {leadStages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Prioridade
                    <Select value={lead.priority} onChange={(event) => updateLead("priority", event.target.value)}>
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baixa</option>
                    </Select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Ticket estimado
                    <Input
                      value={lead.estimatedTicket}
                      onChange={(event) => updateLead("estimatedTicket", event.target.value)}
                      placeholder="Ex.: R$ 4.500"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Interesse principal
                  <Input
                    value={lead.interest}
                    onChange={(event) => updateLead("interest", event.target.value)}
                    placeholder="Ex.: Consulta avaliativa, campanha, plano mensal"
                  />
                </label>

                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Observacoes comerciais
                  <Textarea
                    value={lead.notes}
                    onChange={(event) => updateLead("notes", event.target.value)}
                    placeholder="Registre contexto, dores, urgencia, objecoes e proximo passo sugerido."
                  />
                </label>

                {saved ? (
                  <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    Lead pre-cadastrado no CRM. Use o WhatsApp para iniciar o contato.
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="ghost" onClick={() => setLead(initialLead)}>
                    Limpar formulario
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" variant="secondary">
                      Salvar lead
                    </Button>
                    <Button asChild={Boolean(whatsappUrl)} disabled={!whatsappUrl}>
                      {whatsappUrl ? (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                          Encaminhar para o app <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span>
                          Encaminhar para o app <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
