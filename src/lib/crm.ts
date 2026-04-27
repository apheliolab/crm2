export const leadInterestOptions = [
  "Automacao",
  "Social Media",
  "Design",
  "Trafego Pago",
  "Criacao de Sites",
  "Criacao de Apps",
  "Outro",
] as const;

export const leadSourceOptions = [
  "Instagram",
  "WhatsApp",
  "Site",
  "Indicacao",
  "Prospeccao Ativa",
  "Outro",
] as const;

export const leadStatusOptions = [
  "Novo",
  "Em atendimento",
  "Qualificado",
  "Call agendada",
  "Proposta enviada",
  "Ganho",
  "Perdido",
] as const;

export type LeadInterest = (typeof leadInterestOptions)[number];
export type LeadSource = (typeof leadSourceOptions)[number];
export type LeadStatus = (typeof leadStatusOptions)[number];
export type AppRole = "admin" | "user";

export type LeadTimelineType = "lead_created" | "status_changed" | "note_added" | "meeting_scheduled";

export type LeadTimelineItem = {
  id: string;
  type: LeadTimelineType;
  title: string;
  description: string;
  createdAt: string;
};

export type LeadMeeting = {
  scheduledAt: string;
  channel: "Google Meet" | "WhatsApp" | "Zoom" | "Telefone" | "Presencial";
  owner: string;
  location: string;
  durationMinutes: number;
  notes: string;
};

export type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  company: string;
  niche: string;
  interest: LeadInterest;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  nextMeeting?: LeadMeeting | null;
  timeline: LeadTimelineItem[];
};

export type LeadInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "timeline" | "nextMeeting">;

const now = (date: string) => date;

function makeTimelineItem(
  id: string,
  type: LeadTimelineType,
  title: string,
  description: string,
  createdAt: string,
): LeadTimelineItem {
  return { id, type, title, description, createdAt };
}

function makeLead(base: Omit<Lead, "timeline"> & { timeline?: LeadTimelineItem[] }): Lead {
  return {
    ...base,
    timeline: base.timeline ?? [
      makeTimelineItem(`${base.id}-created`, "lead_created", "Lead criado", `Lead entrou via ${base.source}.`, base.createdAt),
    ],
  };
}

export const mockLeads: Lead[] = [
  makeLead({
    id: "lead-001",
    name: "Mariana Alves",
    whatsapp: "11984351234",
    company: "CliniPrime Odontologia",
    niche: "Saude",
    interest: "Automacao",
    source: "Instagram",
    status: "Qualificado",
    notes: "Quer reduzir tempo de resposta e estruturar o comercial via WhatsApp.",
    createdAt: now("2026-04-24T09:15:00.000Z"),
    updatedAt: now("2026-04-25T13:40:00.000Z"),
    timeline: [
      makeTimelineItem("lead-001-created", "lead_created", "Lead criado", "Chegou pelo Instagram apos ver a oferta de CRM.", "2026-04-24T09:15:00.000Z"),
      makeTimelineItem("lead-001-status", "status_changed", "Status alterado", "Movido para Qualificado apos triagem comercial.", "2026-04-25T13:40:00.000Z"),
    ],
  }),
  makeLead({
    id: "lead-002",
    name: "Guilherme Prado",
    whatsapp: "21991234567",
    company: "Prado Estetica Avancada",
    niche: "Estetica",
    interest: "Trafego Pago",
    source: "Site",
    status: "Call agendada",
    notes: "Call marcada para alinhar funil e campanhas de captacao.",
    createdAt: now("2026-04-23T15:10:00.000Z"),
    updatedAt: now("2026-04-25T10:05:00.000Z"),
    nextMeeting: {
      scheduledAt: "2026-04-28T17:00:00.000Z",
      channel: "Google Meet",
      owner: "Vinicius Duque",
      location: "https://meet.google.com/aphelio-prado",
      durationMinutes: 45,
      notes: "Diagnostico comercial e definicao do escopo de captacao.",
    },
    timeline: [
      makeTimelineItem("lead-002-created", "lead_created", "Lead criado", "Formulario do site convertido na landing da Aphelio.", "2026-04-23T15:10:00.000Z"),
      makeTimelineItem("lead-002-status", "status_changed", "Status alterado", "Call de diagnostico agendada para sexta-feira.", "2026-04-25T10:05:00.000Z"),
      makeTimelineItem("lead-002-meeting", "meeting_scheduled", "Reuniao agendada", "Reuniao marcada via Google Meet com responsavel comercial da Aphelio.", "2026-04-25T10:05:00.000Z"),
    ],
  }),
  makeLead({
    id: "lead-003",
    name: "Felipe Moura",
    whatsapp: "31988776655",
    company: "Moura Imoveis Premium",
    niche: "Imobiliario",
    interest: "Criacao de Sites",
    source: "Indicacao",
    status: "Proposta enviada",
    notes: "Proposta com site, automacao e CRM enviada ontem.",
    createdAt: now("2026-04-21T11:30:00.000Z"),
    updatedAt: now("2026-04-25T18:20:00.000Z"),
    timeline: [
      makeTimelineItem("lead-003-created", "lead_created", "Lead criado", "Indicacao de parceiro comercial da Aphelio.", "2026-04-21T11:30:00.000Z"),
      makeTimelineItem("lead-003-status", "status_changed", "Status alterado", "Proposta premium enviada com implantacao em 10 dias.", "2026-04-25T18:20:00.000Z"),
    ],
  }),
  makeLead({
    id: "lead-004",
    name: "Larissa Costa",
    whatsapp: "11977665544",
    company: "Costa Fit Studio",
    niche: "Fitness",
    interest: "Social Media",
    source: "WhatsApp",
    status: "Em atendimento",
    notes: "Precisa organizar respostas, agenda e ofertas do studio.",
    createdAt: now("2026-04-25T08:05:00.000Z"),
    updatedAt: now("2026-04-25T08:05:00.000Z"),
  }),
  makeLead({
    id: "lead-005",
    name: "Rodrigo Nunes",
    whatsapp: "41993445566",
    company: "Nunes Solar",
    niche: "Energia solar",
    interest: "Criacao de Apps",
    source: "Prospeccao Ativa",
    status: "Novo",
    notes: "Lead frio com potencial para app comercial e automacao do atendimento.",
    createdAt: now("2026-04-26T12:00:00.000Z"),
    updatedAt: now("2026-04-26T12:00:00.000Z"),
  }),
  makeLead({
    id: "lead-006",
    name: "Patricia Mendes",
    whatsapp: "11999887766",
    company: "Mendes Arquitetura",
    niche: "Arquitetura",
    interest: "Design",
    source: "Instagram",
    status: "Ganho",
    notes: "Fechou pacote de design comercial e automacoes de captação.",
    createdAt: now("2026-04-18T14:00:00.000Z"),
    updatedAt: now("2026-04-24T17:45:00.000Z"),
    timeline: [
      makeTimelineItem("lead-006-created", "lead_created", "Lead criado", "Lead organico vindo da pauta de branding da Aphelio.", "2026-04-18T14:00:00.000Z"),
      makeTimelineItem("lead-006-status", "status_changed", "Status alterado", "Cliente ganhou proposta e iniciou onboarding.", "2026-04-24T17:45:00.000Z"),
    ],
  }),
];

export const statusAccentMap: Record<LeadStatus, string> = {
  Novo: "bg-slate-400/12 text-slate-200 ring-slate-300/15",
  "Em atendimento": "bg-sky-500/12 text-sky-200 ring-sky-300/15",
  Qualificado: "bg-violet-500/12 text-violet-200 ring-violet-300/15",
  "Call agendada": "bg-[#ff6a00]/14 text-[#ffbe84] ring-[#ff6a00]/25",
  "Proposta enviada": "bg-[#ff6a00]/18 text-[#ffd0a8] ring-[#ff6a00]/28",
  Ganho: "bg-emerald-500/12 text-emerald-100 ring-emerald-300/15",
  Perdido: "bg-rose-500/12 text-rose-100 ring-rose-300/15",
};

export function formatLeadDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: options?.timeStyle,
    ...options,
  }).format(new Date(date));
}

export function formatMeetingDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatPhoneForWhatsapp(phone: string) {
  return phone.replace(/\D/g, "");
}

export function matchesLeadQuery(lead: Lead, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [lead.name, lead.company, lead.whatsapp]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export function createLeadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `lead-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `lead-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTimelineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `timeline-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `timeline-${Math.random().toString(36).slice(2, 10)}`;
}

export function cloneMockLeadsForSeed() {
  return mockLeads.map((lead) => {
    const id = createLeadId();

    return {
      ...lead,
      id,
      timeline: lead.timeline.map((item) => ({
        ...item,
        id: createTimelineId(),
      })),
    };
  });
}
