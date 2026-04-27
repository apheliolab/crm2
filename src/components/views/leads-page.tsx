"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileSignature, Paperclip, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NewLeadDialog } from "@/components/dashboard/new-lead-dialog";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status";
import { DataTable } from "@/components/dashboard/shared";
import { leadStages, leads, type Lead, type LeadStatus } from "@/lib/data";
import { clientFromLead, useClientStore } from "@/hooks/use-client-store";
import { useLeadStore } from "@/hooks/use-lead-store";
import { formatCurrency } from "@/lib/utils";

const services = [
  "Automacao",
  "Social media",
  "Design",
  "Trafego pago",
  "Criacao de sites",
  "Criacao de aplicativos",
  "Outro",
];

type Modal = "details" | "contract" | "convert" | null;

function LeadModal({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar menu">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function LeadsPage() {
  const { addClient } = useClientStore();
  const { addLead, leadItems, updateLead, updateLeadStatus } = useLeadStore();
  const [selectedLead, setSelectedLead] = useState<Lead>(leads[0]);
  const [modal, setModal] = useState<Modal>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [contractValue, setContractValue] = useState(String(leads[0].estimatedTicket));
  const [implementationValue, setImplementationValue] = useState("");
  const [contractTerm, setContractTerm] = useState("6 meses");
  const [paymentDueDay, setPaymentDueDay] = useState("10");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [contractSignedAt, setContractSignedAt] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [contractGenerated, setContractGenerated] = useState(false);
  const [contractFileName, setContractFileName] = useState("");
  const [convertError, setConvertError] = useState("");
  const [converted, setConverted] = useState(false);

  const totals = useMemo(() => {
    return {
      active: leadItems.length,
      contracts: leadItems.filter((lead) => lead.status === "Contrato").length,
      forecast: leadItems.reduce((sum, lead) => sum + lead.estimatedTicket, 0),
      highPriority: leadItems.filter((lead) => lead.priority === "Alta").length,
    };
  }, [leadItems]);

  function openModal(lead: Lead, nextModal: Modal) {
    setSelectedLead(lead);
    setContractValue(String(lead.estimatedTicket));
    setImplementationValue("");
    setPaymentDueDay("10");
    setPaymentMethod("Pix");
    setContractSignedAt("");
    setSelectedServices([]);
    setContractGenerated(false);
    setConvertError("");
    setConverted(false);
    setDetailsSaved(false);
    setModal(nextModal);
  }

  function toggleService(service: string, checked: boolean) {
    setSelectedServices((current) => {
      if (checked) return [...new Set([...current, service])];
      return current.filter((item) => item !== service);
    });
  }

  function handleContract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContractGenerated(true);
  }

  function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contractFileName) {
      setConvertError("Anexe o contrato assinado para converter este lead em cliente.");
      setConverted(false);
      return;
    }
    setConvertError("");
    addClient(clientFromLead(selectedLead, {
      contractFileName,
      contract: {
        number: `APH-${selectedLead.id}`,
        status: "Assinado",
        monthlyValue: Number(contractValue.replace(/\D/g, "")) || selectedLead.estimatedTicket,
        implementationValue: Number(implementationValue.replace(/\D/g, "")) || 0,
        term: contractTerm,
        signedAt: contractSignedAt || "A definir",
        startDate: contractSignedAt || "A definir",
        endDate: "Conforme prazo contratado",
        paymentDueDay,
        paymentMethod,
        billingResponsible: selectedLead.employee,
        services: selectedServices.length ? selectedServices : ["Trafego pago"],
        renewal: "Renovacao sujeita a aceite comercial.",
        cancellationNotice: "Aviso previo de 30 dias.",
        notes: selectedLead.notes,
      },
    }));
    updateLeadStatus(selectedLead.id, "Convertido");
    setSelectedLead((current) => ({ ...current, status: "Convertido" }));
    setConverted(true);
  }

  function handleStageChange(status: LeadStatus) {
    updateLeadStatus(selectedLead.id, status);
    setSelectedLead((current) => ({ ...current, status }));
    setDetailsSaved(false);
  }

  function updateSelectedLead(field: keyof Lead, value: string | number) {
    setSelectedLead((current) => ({ ...current, [field]: value }));
    setDetailsSaved(false);
  }

  function handleLeadDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateLead(selectedLead.id, selectedLead);
    setDetailsSaved(true);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Leads"
        title="Lista de leads"
        description="Acompanhe oportunidades, veja informacoes comerciais e avance para contrato ou conversao em cliente."
        action={<NewLeadDialog label="Adicionar lead" onCreate={addLead} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Leads ativos" value={String(totals.active)} change="Pipeline comercial" icon={UserCheck} />
        <KpiCard label="Em contrato" value={String(totals.contracts)} change="Aguardando assinatura" icon={FileSignature} />
        <KpiCard label="Forecast" value={formatCurrency(totals.forecast)} change="Ticket estimado" icon={Paperclip} />
        <KpiCard label="Prioridade alta" value={String(totals.highPriority)} change="Contato rapido" icon={CheckCircle2} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Oportunidades comerciais</CardTitle>
            <CardDescription>Use os menus flutuantes para consultar dados, gerar contrato e converter leads.</CardDescription>
          </div>
        </CardHeader>
        <DataTable
          headers={["Lead", "Responsavel", "Nicho", "Origem", "Status", "Ticket", "Proximo passo", "Acoes"]}
          rows={leadItems.map((lead) => [
            <div key="lead">
              <p className="font-medium text-white">{lead.company}</p>
              <p className="text-xs text-muted">{lead.id} - {lead.createdAt}</p>
            </div>,
            <div key="owner">
              <p className="text-white">{lead.employee}</p>
              <p className="text-xs text-muted">{lead.role}</p>
            </div>,
            lead.niche ?? "Nao informado",
            lead.source,
            <StatusBadge key="status" status={lead.status} />,
            formatCurrency(lead.estimatedTicket),
            lead.nextStep,
            <div key="actions" className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => openModal(lead, "details")}>Informacoes</Button>
              <Button variant="secondary" size="sm" onClick={() => openModal(lead, "contract")}>Gerar contrato</Button>
              <Button size="sm" onClick={() => openModal(lead, "convert")}>Converter</Button>
            </div>,
          ])}
        />
      </Card>

      <AnimatePresence>
        {modal === "details" ? (
          <LeadModal title={selectedLead.company} eyebrow="Informacoes do lead" onClose={() => setModal(null)}>
            <form onSubmit={handleLeadDetails} className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Nome da empresa
                  <Input value={selectedLead.company} onChange={(event) => updateSelectedLead("company", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Funcionario
                  <Input value={selectedLead.employee} onChange={(event) => updateSelectedLead("employee", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Cargo
                  <Input value={selectedLead.role} onChange={(event) => updateSelectedLead("role", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  WhatsApp
                  <Input value={selectedLead.whatsapp} onChange={(event) => updateSelectedLead("whatsapp", event.target.value)} inputMode="tel" />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Email
                  <Input value={selectedLead.email} onChange={(event) => updateSelectedLead("email", event.target.value)} type="email" />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Nicho
                  <Input value={selectedLead.niche ?? ""} onChange={(event) => updateSelectedLead("niche", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Origem
                  <Select value={selectedLead.source} onChange={(event) => updateSelectedLead("source", event.target.value)}>
                    <option>Google Ads</option>
                    <option>Meta Ads</option>
                    <option>Indicacao</option>
                    <option>WhatsApp</option>
                    <option>Organico</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Etapa do lead
                  <Select value={selectedLead.status} onChange={(event) => handleStageChange(event.target.value as LeadStatus)}>
                    {leadStages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Prioridade
                  <Select value={selectedLead.priority} onChange={(event) => updateSelectedLead("priority", event.target.value as Lead["priority"])}>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baixa</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Ticket estimado
                  <Input value={String(selectedLead.estimatedTicket)} onChange={(event) => updateSelectedLead("estimatedTicket", Number(event.target.value.replace(/\D/g, "")) || 0)} inputMode="numeric" />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea] md:col-span-2">
                  Interesse principal
                  <Input value={selectedLead.interest} onChange={(event) => updateSelectedLead("interest", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea] md:col-span-2">
                  Proximo passo
                  <Input value={selectedLead.nextStep} onChange={(event) => updateSelectedLead("nextStep", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea] md:col-span-2">
                  Observacoes
                  <Textarea value={selectedLead.notes} onChange={(event) => updateSelectedLead("notes", event.target.value)} />
                </label>
              </div>

              {detailsSaved ? (
                <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  Informacoes do lead atualizadas.
                </div>
              ) : null}

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setModal("contract")}>Gerar contrato</Button>
                <Button type="button" variant="secondary" onClick={() => setModal("convert")}>Converter para cliente</Button>
                <Button type="submit">Salvar alteracoes</Button>
              </div>
            </form>
          </LeadModal>
        ) : null}

        {modal === "contract" ? (
          <LeadModal title={`Contrato · ${selectedLead.company}`} eyebrow="Gerar contrato" onClose={() => setModal(null)}>
            <form onSubmit={handleContract} className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Valor do contrato
                  <Input value={contractValue} onChange={(event) => setContractValue(event.target.value)} placeholder="Ex.: 6800" required />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Tempo de contrato
                  <Select value={contractTerm} onChange={(event) => setContractTerm(event.target.value)}>
                    <option>3 meses</option>
                    <option>6 meses</option>
                    <option>12 meses</option>
                    <option>Indeterminado</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Valor de implementacao
                  <Input value={implementationValue} onChange={(event) => setImplementationValue(event.target.value)} placeholder="Ex.: 2500" />
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Dia de vencimento
                  <Select value={paymentDueDay} onChange={(event) => setPaymentDueDay(event.target.value)}>
                    {Array.from({ length: 28 }, (_, index) => String(index + 1)).map((day) => (
                      <option key={day} value={day}>Dia {day}</option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Forma de pagamento
                  <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    <option>Pix</option>
                    <option>Boleto</option>
                    <option>Cartao de credito</option>
                    <option>Transferencia</option>
                    <option>Recorrencia automatica</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Data de assinatura
                  <Input type="date" value={contractSignedAt} onChange={(event) => setContractSignedAt(event.target.value)} />
                </label>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-white">Servicos prestados</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service) => (
                    <label key={service} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.055] p-3 text-sm text-muted">
                      <Checkbox checked={selectedServices.includes(service)} onCheckedChange={(checked) => toggleService(service, Boolean(checked))} />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              {contractGenerated ? (
                <div className="rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                  Contrato preparado para {selectedLead.company}: mensalidade de {formatCurrency(Number(contractValue || 0))}, implementacao de {formatCurrency(Number(implementationValue || 0))}, prazo de {contractTerm}, vencimento todo dia {paymentDueDay}, pagamento via {paymentMethod}, assinatura em {contractSignedAt || "data a definir"}, com {selectedServices.length} servicos no escopo.
                </div>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit"><FileSignature className="h-4 w-4" /> Gerar contrato</Button>
              </div>
            </form>
          </LeadModal>
        ) : null}

        {modal === "convert" ? (
          <LeadModal title={`Converter · ${selectedLead.company}`} eyebrow="Converter para cliente" onClose={() => setModal(null)}>
            <form onSubmit={handleConvert} className="grid gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
                <p className="font-medium text-white">Anexo obrigatorio do contrato</p>
                <p className="mt-2 text-sm leading-6 text-muted">A conversao so sera bem sucedida apos anexar o contrato assinado pelo cliente.</p>
              </div>
              <label className="grid gap-2 text-sm text-[#f4f1ea]">
                Contrato assinado
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    setContractFileName(event.target.files?.[0]?.name ?? "");
                    setConvertError("");
                    setConverted(false);
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm text-[#f4f1ea]">
                Observacao interna
                <Textarea placeholder="Ex.: Contrato validado, inicio previsto para o proximo ciclo." />
              </label>
              {convertError ? (
                <div className="rounded-md border border-[#a63f24]/25 bg-[#a63f24]/10 p-3 text-sm text-[#f4b49b]">{convertError}</div>
              ) : null}
              {converted ? (
                <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  Lead convertido para cliente com contrato anexado: {contractFileName}.
                </div>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit">Converter para cliente</Button>
              </div>
            </form>
          </LeadModal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
