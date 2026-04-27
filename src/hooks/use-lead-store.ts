"use client";

import { useEffect, useState } from "react";
import { leads, type Lead, type LeadStatus } from "@/lib/data";

const STORAGE_KEY = "aphelio-performance-hub-leads";

function readStoredLeads() {
  if (typeof window === "undefined") return leads;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return leads;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as Lead[] : leads;
  } catch {
    return leads;
  }
}

export function useLeadStore() {
  const [leadItems, setLeadItems] = useState<Lead[]>(leads);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLeadItems(readStoredLeads());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leadItems));
  }, [hydrated, leadItems]);

  function updateLead(leadId: string, updates: Partial<Lead>) {
    setLeadItems((current) => current.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead)));
  }

  function addLead(lead: Lead) {
    setLeadItems((current) => [lead, ...current]);
  }

  function updateLeadStatus(leadId: string, status: LeadStatus) {
    updateLead(leadId, { status });
  }

  return {
    addLead,
    leadItems,
    updateLead,
    updateLeadStatus,
  };
}
