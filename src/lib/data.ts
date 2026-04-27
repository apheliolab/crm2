export type ClientStatus = "Saudavel" | "Atencao" | "Critico";

export type ClientContract = {
  number: string;
  status: "Assinado" | "Pendente" | "Em revisao";
  monthlyValue: number;
  implementationValue: number;
  term: string;
  signedAt: string;
  startDate: string;
  endDate: string;
  paymentDueDay: string;
  paymentMethod: string;
  billingResponsible: string;
  services: string[];
  renewal: string;
  cancellationNotice: string;
  notes: string;
};

export type Client = {
  slug: string;
  name: string;
  segment: string;
  owner: string;
  status: ClientStatus;
  lastUpdate: string;
  contractFileName?: string;
  document?: string;
  email?: string;
  phone?: string;
  plan?: string;
  contract?: ClientContract;
  metrics: {
    investment: number;
    leads: number;
    conversations: number;
    opportunities: number;
    sales: number;
    revenue: number;
    roi: number;
    responseTime: string;
    cpc: number;
    ctr: number;
    cpm: number;
    cpl: number;
    answerRate: number;
    abandonment: number;
    ticket: number;
  };
  channels: { name: string; leads: number; roi: number; color: string }[];
  campaigns: {
    name: string;
    channel: string;
    spend: number;
    leads: number;
    sales: number;
    roi: number;
    status: "Escalando" | "Otimizar" | "Pausada";
  }[];
  funnel: { stage: string; value: number; conversion: number; avgTime: string }[];
  losses: { reason: string; value: number }[];
  revenueSeries: { month: string; revenue: number; leads: number }[];
  salesByOwner: { name: string; sales: number; revenue: number }[];
};

export type LeadStatus = "Novo" | "Qualificado" | "Proposta" | "Contrato" | "Convertido";

export const leadStages: LeadStatus[] = ["Novo", "Qualificado", "Proposta", "Contrato", "Convertido"];

export type Lead = {
  id: string;
  company: string;
  employee: string;
  role: string;
  whatsapp: string;
  email: string;
  source: string;
  niche: string;
  status: LeadStatus;
  priority: "Alta" | "Media" | "Baixa";
  interest: string;
  estimatedTicket: number;
  createdAt: string;
  nextStep: string;
  notes: string;
};

export type CashFlowTransaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Entrada" | "Saida";
  recurrence: "Fixa" | "Variavel";
  amount: number;
  status: "Pago" | "Pendente" | "Agendado";
  destination: "Planilha" | "Manual";
  paymentMethod: string;
  costCenter: string;
  notes: string;
};

export const clients: Client[] = [
  {
    slug: "clinica-vita-core",
    name: "Clinica Vita Core",
    segment: "Clinica",
    owner: "Marina Lopes",
    status: "Saudavel",
    lastUpdate: "Hoje, 08:17",
    contractFileName: "contrato-clinica-vita-core.pdf",
    document: "32.118.490/0001-77",
    email: "marina@vitacore.com.br",
    phone: "11988447766",
    plan: "Growth Full",
    contract: {
      number: "APH-2026-001",
      status: "Assinado",
      monthlyValue: 42000,
      implementationValue: 6500,
      term: "12 meses",
      signedAt: "2026-01-08",
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      paymentDueDay: "10",
      paymentMethod: "Pix",
      billingResponsible: "Marina Lopes",
      services: ["Automacao", "Social media", "Design", "Trafego pago"],
      renewal: "Renovacao automatica mediante aceite comercial.",
      cancellationNotice: "Aviso previo de 30 dias.",
      notes: "Contrato contempla gestao de campanhas, CRM comercial e acompanhamento mensal de performance.",
    },
    metrics: {
      investment: 21800,
      leads: 934,
      conversations: 706,
      opportunities: 318,
      sales: 74,
      revenue: 286500,
      roi: 13.1,
      responseTime: "3m 04s",
      cpc: 3.42,
      ctr: 3.9,
      cpm: 31,
      cpl: 23.34,
      answerRate: 81,
      abandonment: 12,
      ticket: 3872,
    },
    channels: [
      { name: "Google", leads: 388, roi: 16.2, color: "#ce6736" },
      { name: "Meta Ads", leads: 351, roi: 10.4, color: "#f4f1ea" },
      { name: "Indicacao", leads: 102, roi: 18.8, color: "#22c55e" },
      { name: "Organico", leads: 93, roi: 7.2, color: "#9f9f9f" },
    ],
    campaigns: [
      { name: "Consulta avaliativa premium", channel: "Google", spend: 7600, leads: 246, sales: 31, roi: 15.7, status: "Escalando" },
      { name: "Check-up preventivo", channel: "Meta Ads", spend: 6100, leads: 284, sales: 24, roi: 10.1, status: "Otimizar" },
      { name: "Remarketing pacientes", channel: "Meta Ads", spend: 2100, leads: 91, sales: 12, roi: 13.9, status: "Escalando" },
    ],
    funnel: [
      { stage: "Lead novo", value: 934, conversion: 100, avgTime: "2h" },
      { stage: "Qualificado", value: 528, conversion: 57, avgTime: "8h" },
      { stage: "Proposta", value: 318, conversion: 34, avgTime: "2d" },
      { stage: "Negociacao", value: 169, conversion: 18, avgTime: "3d" },
      { stage: "Venda", value: 74, conversion: 8, avgTime: "1d" },
      { stage: "Perdido", value: 95, conversion: 10, avgTime: "4d" },
    ],
    losses: [
      { reason: "Orcamento", value: 36 },
      { reason: "Sem agenda", value: 18 },
      { reason: "Sem retorno", value: 41 },
    ],
    revenueSeries: [
      { month: "Ago", revenue: 198000, leads: 740 },
      { month: "Set", revenue: 214800, leads: 768 },
      { month: "Out", revenue: 236700, leads: 805 },
      { month: "Nov", revenue: 251300, leads: 842 },
      { month: "Dez", revenue: 269900, leads: 899 },
      { month: "Jan", revenue: 286500, leads: 934 },
    ],
    salesByOwner: [
      { name: "Dra. Ana", sales: 28, revenue: 108416 },
      { name: "Dra. Paula", sales: 24, revenue: 92928 },
      { name: "Unidade Sul", sales: 22, revenue: 85156 },
    ],
  },
];

export const companyFinancials = {
  cashBalance: 428600,
  grossRevenue: 286500,
  netProfit: 86500,
  mrr: 42000,
  expenses: 132400,
  accountsReceivable: 74800,
  margin: 30.2,
  activeContracts: clients.length,
};

export const aggregateRevenue = [
  { month: "Ago", revenue: 214000, leads: 0 },
  { month: "Set", revenue: 228400, leads: 0 },
  { month: "Out", revenue: 241900, leads: 0 },
  { month: "Nov", revenue: 259500, leads: 0 },
  { month: "Dez", revenue: 276800, leads: 0 },
  { month: "Jan", revenue: 286500, leads: 0 },
];

export const expenseBreakdown = [
  { name: "Equipe", value: 64200, color: "#ce6736" },
  { name: "Operacao", value: 28000, color: "#f4f1ea" },
  { name: "Midia", value: 21800, color: "#22c55e" },
  { name: "Ferramentas", value: 18400, color: "#9f9f9f" },
];

export const cashFlowCategories = [
  "Mensalidade cliente",
  "Midia paga",
  "Equipe",
  "Ferramentas",
  "Operacao",
  "Impostos",
  "Comissao",
  "Consultoria",
];

export const cashFlowTransactions: CashFlowTransaction[] = [
  {
    id: "CF-2048",
    date: "2026-04-05",
    description: "Mensalidade Clinica Vita Core",
    category: "Mensalidade cliente",
    type: "Entrada",
    recurrence: "Fixa",
    amount: 42000,
    status: "Pago",
    destination: "Planilha",
    paymentMethod: "Pix",
    costCenter: "Receita recorrente",
    notes: "Contrato principal do mes ja conciliado.",
  },
  {
    id: "CF-2047",
    date: "2026-04-12",
    description: "Contas a receber do periodo",
    category: "Mensalidade cliente",
    type: "Entrada",
    recurrence: "Variavel",
    amount: 74800,
    status: "Agendado",
    destination: "Planilha",
    paymentMethod: "Boleto",
    costCenter: "Receita operacional",
    notes: "Previsao consolidada para os proximos 30 dias.",
  },
  {
    id: "CF-2046",
    date: "2026-04-08",
    description: "Folha e prestadores",
    category: "Equipe",
    type: "Saida",
    recurrence: "Fixa",
    amount: 64200,
    status: "Pago",
    destination: "Planilha",
    paymentMethod: "Transferencia",
    costCenter: "Equipe",
    notes: "Equipe fixa, atendimento comercial e producao.",
  },
  {
    id: "CF-2045",
    date: "2026-04-10",
    description: "Verba de midia paga",
    category: "Midia paga",
    type: "Saida",
    recurrence: "Variavel",
    amount: 21800,
    status: "Pago",
    destination: "Planilha",
    paymentMethod: "Cartao corporativo",
    costCenter: "Aquisicao",
    notes: "Distribuicao Google Ads e Meta Ads.",
  },
  {
    id: "CF-2044",
    date: "2026-04-15",
    description: "Ferramentas SaaS",
    category: "Ferramentas",
    type: "Saida",
    recurrence: "Fixa",
    amount: 18400,
    status: "Pendente",
    destination: "Planilha",
    paymentMethod: "Cartao corporativo",
    costCenter: "Tecnologia",
    notes: "CRM, BI e hospedagem.",
  },
  {
    id: "CF-2043",
    date: "2026-04-22",
    description: "Despesas operacionais variaveis",
    category: "Operacao",
    type: "Saida",
    recurrence: "Variavel",
    amount: 28000,
    status: "Agendado",
    destination: "Manual",
    paymentMethod: "Pix",
    costCenter: "Operacao",
    notes: "Reserva para demandas extras do mes.",
  },
];

export const leads: Lead[] = [
  {
    id: "LD-1042",
    company: "Orion Dental Care",
    employee: "Amanda Ribeiro",
    role: "Diretora comercial",
    whatsapp: "11984562310",
    email: "amanda@oriondental.com",
    source: "Google Ads",
    niche: "Clinica",
    status: "Qualificado",
    priority: "Alta",
    interest: "Gestao de trafego e CRM para agenda de consultas",
    estimatedTicket: 6800,
    createdAt: "Hoje, 09:12",
    nextStep: "Enviar proposta com escopo de 6 meses",
    notes: "Busca melhorar ocupacao da agenda e reduzir dependencia de indicacoes.",
  },
  {
    id: "LD-1041",
    company: "Studio Forma Prime",
    employee: "Renata Prado",
    role: "Socio-administradora",
    whatsapp: "21991234567",
    email: "renata@formaprime.com",
    source: "Meta Ads",
    niche: "Estetica",
    status: "Novo",
    priority: "Media",
    interest: "Campanhas para estetica corporal",
    estimatedTicket: 4200,
    createdAt: "Hoje, 08:33",
    nextStep: "Validar verba mensal disponivel",
    notes: "Quer previsibilidade para lancamento de novo protocolo.",
  },
  {
    id: "LD-1038",
    company: "Vértice Planejados",
    employee: "Carlos Meirelles",
    role: "Gerente de vendas",
    whatsapp: "31988776655",
    email: "carlos@verticeplanejados.com",
    source: "Indicacao",
    niche: "Moveis planejados",
    status: "Proposta",
    priority: "Alta",
    interest: "Funil comercial para moveis planejados",
    estimatedTicket: 9500,
    createdAt: "Ontem, 16:20",
    nextStep: "Revisar contrato e prazo de implantacao",
    notes: "Operacao com ticket alto, precisa de CRM e playbook comercial.",
  },
  {
    id: "LD-1037",
    company: "Pizzaria Brasa Nobre",
    employee: "Felipe Santos",
    role: "Proprietario",
    whatsapp: "11977665544",
    email: "felipe@brasanobre.com",
    source: "WhatsApp",
    niche: "Pizzaria",
    status: "Contrato",
    priority: "Media",
    interest: "Aumento de pedidos recorrentes",
    estimatedTicket: 3100,
    createdAt: "Ontem, 11:04",
    nextStep: "Anexar contrato assinado para conversao",
    notes: "Contrato em negociacao com foco em recorrencia e base local.",
  },
];

export const reportSections = [
  "Resumo executivo",
  "Aquisicao",
  "CRM e funil",
  "Vendas",
  "Insights estrategicos",
];

export function getClient(slug = "clinica-vita-core") {
  return clients.find((client) => client.slug === slug) ?? clients[0];
}

export const agencyTotals = {
  activeClients: clients.length,
  opportunities: clients.reduce((sum, client) => sum + client.metrics.opportunities, 0),
  sales: clients.reduce((sum, client) => sum + client.metrics.sales, 0),
  revenue: clients.reduce((sum, client) => sum + client.metrics.revenue, 0),
  averageRoi: Number((clients.reduce((sum, client) => sum + client.metrics.roi, 0) / clients.length).toFixed(1)),
  avgResponse: "3m 04s",
};

export const insights = [
  {
    title: "Receita recorrente protegida",
    text: "MRR atual cobre 31,7% das despesas mensais e sustenta margem operacional positiva.",
    tone: "positive",
  },
  {
    title: "Contas a receber",
    text: "R$ 74,8 mil previstos para liquidacao no periodo; acompanhar vencimentos acima de 15 dias.",
    tone: "neutral",
  },
  {
    title: "Gargalo principal do CRM",
    text: "A maior perda acontece apos proposta; reduzir tempo de retorno comercial para menos de 24h.",
    tone: "warning",
  },
  {
    title: "Cliente em boa tracao",
    text: "Clinica Vita Core opera com ROI 13,1x e crescimento consistente de faturamento.",
    tone: "positive",
  },
];
