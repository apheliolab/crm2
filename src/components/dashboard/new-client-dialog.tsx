"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialClient = {
  company: "",
  segment: "Clinica",
  responsible: "",
  role: "",
  whatsapp: "",
  email: "",
  document: "",
  plan: "Performance",
  monthlyValue: "",
  startDate: "",
  notes: "",
};

export function NewClientDialog({ label = "Cadastrar cliente" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [client, setClient] = useState(initialClient);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function updateClient(field: keyof typeof client, value: string) {
    setClient((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Building2 className="h-4 w-4" /> {label}
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
              aria-labelledby="new-client-title"
              className="form-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Clientes</p>
                  <h2 id="new-client-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Cadastro de cliente
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Registre dados comerciais, contato principal e configuracao inicial do contrato.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar cadastro">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Nome da empresa
                    <Input value={client.company} onChange={(event) => updateClient("company", event.target.value)} placeholder="Ex.: Orion Dental Care" required />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Segmento
                    <Select value={client.segment} onChange={(event) => updateClient("segment", event.target.value)}>
                      <option>Clinica</option>
                      <option>Estetica</option>
                      <option>Barbearia</option>
                      <option>Pizzaria</option>
                      <option>Moveis planejados</option>
                      <option>Imobiliaria</option>
                      <option>Outro</option>
                    </Select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Responsavel principal
                    <Input value={client.responsible} onChange={(event) => updateClient("responsible", event.target.value)} placeholder="Ex.: Amanda Ribeiro" required />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Cargo
                    <Input value={client.role} onChange={(event) => updateClient("role", event.target.value)} placeholder="Ex.: Diretora comercial" />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    WhatsApp
                    <Input value={client.whatsapp} onChange={(event) => updateClient("whatsapp", event.target.value)} placeholder="(11) 99999-9999" inputMode="tel" required />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Email
                    <Input value={client.email} onChange={(event) => updateClient("email", event.target.value)} placeholder="financeiro@empresa.com" type="email" />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    CNPJ / Documento
                    <Input value={client.document} onChange={(event) => updateClient("document", event.target.value)} placeholder="00.000.000/0001-00" />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Plano inicial
                    <Select value={client.plan} onChange={(event) => updateClient("plan", event.target.value)}>
                      <option>Performance</option>
                      <option>CRM Comercial</option>
                      <option>Growth Full</option>
                      <option>Consultoria</option>
                    </Select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Mensalidade prevista
                    <Input value={client.monthlyValue} onChange={(event) => updateClient("monthlyValue", event.target.value)} placeholder="Ex.: R$ 6.800" />
                  </label>
                  <label className="grid gap-2 text-sm text-[#f4f1ea]">
                    Inicio previsto
                    <Input value={client.startDate} onChange={(event) => updateClient("startDate", event.target.value)} type="date" />
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[#f4f1ea]">
                  Observacoes de onboarding
                  <Textarea value={client.notes} onChange={(event) => updateClient("notes", event.target.value)} placeholder="Contexto do cliente, metas iniciais, acessos pendentes e observacoes do contrato." />
                </label>

                {saved ? (
                  <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/25 bg-[#22c55e]/10 p-3 text-sm text-[#d8ffe5]">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    Cliente pre-cadastrado. Proximo passo: anexar contrato e ativar workspace.
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="ghost" onClick={() => setClient(initialClient)}>
                    Limpar formulario
                  </Button>
                  <Button type="submit">Salvar cadastro</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
