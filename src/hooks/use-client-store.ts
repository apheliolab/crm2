"use client";

import { useEffect, useState } from "react";
import { clients, type Client, type ClientContract, type Lead } from "@/lib/data";

const STORAGE_KEY = "aphelio-performance-hub-clients";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readStoredClients() {
  if (typeof window === "undefined") return clients;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return clients;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as Client[] : clients;
  } catch {
    return clients;
  }
}

export function clientFromLead(
  lead: Lead,
  contractInput?: {
    contractFileName?: string;
    contract?: Partial<ClientContract>;
  },
): Client {
  const projectedRevenue = Math.max(lead.estimatedTicket, 0);
  const contract: ClientContract = {
    number: contractInput?.contract?.number ?? `APH-${lead.id}`,
    status: contractInput?.contract?.status ?? "Assinado",
    monthlyValue: contractInput?.contract?.monthlyValue ?? projectedRevenue,
    implementationValue: contractInput?.contract?.implementationValue ?? 0,
    term: contractInput?.contract?.term ?? "A definir",
    signedAt: contractInput?.contract?.signedAt ?? "A definir",
    startDate: contractInput?.contract?.startDate ?? "A definir",
    endDate: contractInput?.contract?.endDate ?? "A definir",
    paymentDueDay: contractInput?.contract?.paymentDueDay ?? "A definir",
    paymentMethod: contractInput?.contract?.paymentMethod ?? "A definir",
    billingResponsible: contractInput?.contract?.billingResponsible ?? lead.employee,
    services: contractInput?.contract?.services ?? ["Trafego pago"],
    renewal: contractInput?.contract?.renewal ?? "A definir",
    cancellationNotice: contractInput?.contract?.cancellationNotice ?? "A definir",
    notes: contractInput?.contract?.notes ?? lead.notes,
  };

  return {
    slug: slugify(lead.company || lead.id),
    name: lead.company,
    segment: lead.niche || "Cliente convertido",
    owner: lead.employee,
    status: "Atencao",
    lastUpdate: "Agora",
    contractFileName: contractInput?.contractFileName ?? "",
    email: lead.email,
    phone: lead.whatsapp,
    plan: "Performance",
    contract,
    metrics: {
      investment: 0,
      leads: 0,
      conversations: 0,
      opportunities: 1,
      sales: 0,
      revenue: projectedRevenue,
      roi: 0,
      responseTime: "A iniciar",
      cpc: 0,
      ctr: 0,
      cpm: 0,
      cpl: 0,
      answerRate: 0,
      abandonment: 0,
      ticket: projectedRevenue,
    },
    channels: [
      { name: lead.source, leads: 1, roi: 0, color: "#ce6736" },
    ],
    campaigns: [
      { name: "Onboarding comercial", channel: lead.source, spend: 0, leads: 1, sales: 0, roi: 0, status: "Otimizar" },
    ],
    funnel: [
      { stage: "Lead novo", value: 1, conversion: 100, avgTime: "Agora" },
      { stage: "Qualificado", value: 0, conversion: 0, avgTime: "-" },
      { stage: "Proposta", value: 0, conversion: 0, avgTime: "-" },
      { stage: "Negociacao", value: 0, conversion: 0, avgTime: "-" },
      { stage: "Venda", value: 0, conversion: 0, avgTime: "-" },
      { stage: "Perdido", value: 0, conversion: 0, avgTime: "-" },
    ],
    losses: [
      { reason: "Sem historico", value: 0 },
    ],
    revenueSeries: [
      { month: "Atual", revenue: projectedRevenue, leads: 1 },
    ],
    salesByOwner: [
      { name: lead.employee, sales: 0, revenue: projectedRevenue },
    ],
  };
}

export function useClientStore() {
  const [clientItems, setClientItems] = useState<Client[]>(clients);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setClientItems(readStoredClients());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clientItems));
  }, [clientItems, hydrated]);

  function addClient(client: Client) {
    setClientItems((current) => {
      const exists = current.some((item) => item.slug === client.slug);
      if (exists) {
        return current.map((item) => (item.slug === client.slug ? { ...item, ...client, lastUpdate: "Agora" } : item));
      }

      return [client, ...current];
    });
  }

  function updateClient(slug: string, updates: Partial<Client>) {
    setClientItems((current) => current.map((client) => (client.slug === slug ? { ...client, ...updates, lastUpdate: "Agora" } : client)));
  }

  return {
    addClient,
    clientItems,
    hydrated,
    updateClient,
  };
}
