"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  MessageCircleMore,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  formatLeadDate,
  formatPhoneForWhatsapp,
  leadInterestOptions,
  leadSourceOptions,
  leadStatusOptions,
  matchesLeadQuery,
  statusAccentMap,
  type Lead,
  type LeadInput,
  type LeadInterest,
  type LeadSource,
  type LeadStatus,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

const emptyLeadForm: LeadInput = {
  name: "",
  whatsapp: "",
  company: "",
  niche: "",
  interest: "Automacao",
  source: "Instagram",
  status: "Novo",
  notes: "",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1", statusAccentMap[status])}>
      {status}
    </span>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[#ffca87]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  help,
  icon,
}: {
  label: string;
  value: string;
  help: string;
  icon: ReactNode;
}) {
  return (
    <Card className="rounded-xl p-0">
      <div className="rounded-xl border border-[#ff6a00]/12 bg-[linear-gradient(180deg,rgba(11,18,28,0.98),rgba(6,11,19,0.96))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-300">{help}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#ff6a00]/24 bg-[#ff6a00]/10 text-[#ffb36b]">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ModalFrame({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#08111a] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function LeadForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
}: {
  value: LeadInput;
  onChange: (value: LeadInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-200">
          Nome
          <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} required />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          WhatsApp
          <Input value={value.whatsapp} onChange={(event) => onChange({ ...value, whatsapp: event.target.value })} required />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          Empresa
          <Input value={value.company} onChange={(event) => onChange({ ...value, company: event.target.value })} required />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          Nicho
          <Input value={value.niche} onChange={(event) => onChange({ ...value, niche: event.target.value })} required />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          Interesse
          <Select value={value.interest} onChange={(event) => onChange({ ...value, interest: event.target.value as LeadInterest })}>
            {leadInterestOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          Origem
          <Select value={value.source} onChange={(event) => onChange({ ...value, source: event.target.value as LeadSource })}>
            {leadSourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
          Status
          <Select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as LeadStatus })}>
            {leadStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
          Observacoes
          <Textarea value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} />
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export function LeadModal({
  open,
  initialValue,
  title,
  description,
  submitLabel,
  onClose,
  onSave,
}: {
  open: boolean;
  initialValue?: Lead;
  title: string;
  description: string;
  submitLabel: string;
  onClose: () => void;
  onSave: (value: LeadInput) => void;
}) {
  return (
    <ModalFrame open={open} title={title} description={description} onClose={onClose}>
      {open ? (
        <LeadModalBody
          key={initialValue?.id ?? "new"}
          initialValue={initialValue}
          submitLabel={submitLabel}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </ModalFrame>
  );
}

function LeadModalBody({
  initialValue,
  submitLabel,
  onClose,
  onSave,
}: {
  initialValue?: Lead;
  submitLabel: string;
  onClose: () => void;
  onSave: (value: LeadInput) => void;
}) {
  const [formValue, setFormValue] = useState<LeadInput>(initialValue ? toLeadInput(initialValue) : emptyLeadForm);

  return (
    <LeadForm
      value={formValue}
      onChange={setFormValue}
      submitLabel={submitLabel}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(formValue);
        onClose();
      }}
    />
  );
}

function toLeadInput(lead: Lead): LeadInput {
  return {
    name: lead.name,
    whatsapp: lead.whatsapp,
    company: lead.company,
    niche: lead.niche,
    interest: lead.interest,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
  };
}

export function LeadsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  interest,
  onInterestChange,
  onCreateClick,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  interest: string;
  onInterestChange: (value: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_160px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input className="pl-11" placeholder="Buscar por nome, empresa ou WhatsApp" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </div>
      <Select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="Todos">Todos os status</option>
        {leadStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select value={interest} onChange={(event) => onInterestChange(event.target.value)}>
        <option value="Todos">Todos os interesses</option>
        {leadInterestOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Button size="lg" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        Novo Lead
      </Button>
    </div>
  );
}

export function EmptyLeadsState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 bg-white/4 px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border border-[#ff6a00]/24 bg-[#ff6a00]/10 text-[#ffb36b]">
        <CalendarClock className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-white">Nenhum lead encontrado</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
        Comece com um novo contato para visualizar o dashboard, preencher o funil e acompanhar a jornada comercial.
      </p>
      <div className="mt-6">
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Cadastrar primeiro lead
        </Button>
      </div>
    </div>
  );
}

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
}: {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,28,0.98),rgba(6,11,19,0.96))]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
            <tr>
              {["Lead", "Empresa", "Interesse", "Origem", "Status", "Criado em", "Acoes"].map((header) => (
                <th key={header} className="px-5 py-4 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/6 last:border-b-0 hover:bg-white/4">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{lead.whatsapp}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-200">{lead.company}</td>
                <td className="px-5 py-4 text-slate-300">{lead.interest}</td>
                <td className="px-5 py-4 text-slate-300">{lead.source}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4 text-slate-400">{formatLeadDate(lead.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/leads/${lead.id}`}>
                      <Button variant="secondary" size="sm">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Abrir
                      </Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => onEdit(lead)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <a
                        href={`https://wa.me/55${formatPhoneForWhatsapp(lead.whatsapp)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircleMore className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(lead)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function useFilteredLeads(leads: Lead[], query: string, status: string, interest: string) {
  return useMemo(() => {
    return leads.filter((lead) => {
      const matchesQuery = matchesLeadQuery(lead, query);
      const matchesStatus = status === "Todos" || lead.status === status;
      const matchesInterest = interest === "Todos" || lead.interest === interest;

      return matchesQuery && matchesStatus && matchesInterest;
    });
  }, [interest, leads, query, status]);
}
