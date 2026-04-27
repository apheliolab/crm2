"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  cloneMockLeadsForSeed,
  createLeadId,
  createTimelineId,
  leadStatusOptions,
  mockLeads,
  type AppRole,
  type Lead,
  type LeadInput,
  type LeadMeeting,
  type LeadStatus,
  type LeadTimelineItem,
} from "@/lib/crm";

const STORAGE_KEY = "aphelio-crm-leads";

type LeadRow = {
  id: string;
  owner_user_id: string;
  name: string;
  whatsapp: string;
  company: string;
  niche: string;
  interest: Lead["interest"];
  source: Lead["source"];
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  next_meeting: LeadMeeting | null;
};

type TimelineRow = {
  id: string;
  lead_id: string;
  owner_user_id: string;
  type: LeadTimelineItem["type"];
  title: string;
  description: string;
  created_at: string;
};

type CrmContextValue = {
  hydrated: boolean;
  leads: Lead[];
  currentUser: User | null;
  role: AppRole | null;
  usingSupabase: boolean;
  signOut: () => Promise<void>;
  addLead: (input: LeadInput) => Promise<string>;
  updateLead: (id: string, updates: Partial<LeadInput>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getLeadById: (id: string) => Lead | undefined;
  setLeadStatus: (id: string, status: LeadStatus, note?: string) => Promise<void>;
  addLeadNote: (id: string, note: string) => Promise<void>;
  scheduleLeadMeeting: (id: string, meeting: LeadMeeting) => Promise<void>;
};

const CrmContext = createContext<CrmContextValue | null>(null);

function createTimelineItem(item: Omit<LeadTimelineItem, "id">): LeadTimelineItem {
  return {
    id: createTimelineId(),
    ...item,
  };
}

function readLeads() {
  if (typeof window === "undefined") return mockLeads;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockLeads;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return mockLeads;
    return parsed as Lead[];
  } catch {
    return mockLeads;
  }
}

function appendTimeline(lead: Lead, item: Omit<LeadTimelineItem, "id">) {
  return {
    ...lead,
    updatedAt: item.createdAt,
    timeline: [createTimelineItem(item), ...lead.timeline],
  };
}

function mapLeadRows(leadRows: LeadRow[], timelineRows: TimelineRow[]): Lead[] {
  const groupedTimeline = new Map<string, LeadTimelineItem[]>();

  timelineRows.forEach((item) => {
    const items = groupedTimeline.get(item.lead_id) ?? [];
    items.push({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      createdAt: item.created_at,
    });
    groupedTimeline.set(item.lead_id, items);
  });

  return leadRows.map((lead) => ({
    id: lead.id,
    name: lead.name,
    whatsapp: lead.whatsapp,
    company: lead.company,
    niche: lead.niche,
    interest: lead.interest,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
    nextMeeting: lead.next_meeting,
    timeline: (groupedTimeline.get(lead.id) ?? []).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  })).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

function toLeadRow(lead: Lead, ownerUserId: string): LeadRow {
  return {
    id: lead.id,
    owner_user_id: ownerUserId,
    name: lead.name,
    whatsapp: lead.whatsapp,
    company: lead.company,
    niche: lead.niche,
    interest: lead.interest,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
    next_meeting: lead.nextMeeting ?? null,
  };
}

function toTimelineRows(lead: Lead, ownerUserId: string): TimelineRow[] {
  return lead.timeline.map((item) => ({
    id: item.id,
    lead_id: lead.id,
    owner_user_id: ownerUserId,
    type: item.type,
    title: item.title,
    description: item.description,
    created_at: item.createdAt,
  }));
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const usingSupabase = isSupabaseConfigured();
  const [leads, setLeads] = useState<Lead[]>(usingSupabase ? [] : mockLeads);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (!usingSupabase) {
      const timeout = window.setTimeout(() => {
        setLeads(readLeads());
        setHydrated(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const supabase = createSupabaseBrowserClient();

    async function loadRemoteCrmData(user: User) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.name ?? "Usuario Aphelio",
          role: "user",
        });
      }

      const nextRole = (profile?.role === "admin" ? "admin" : "user") as AppRole;
      setRole(nextRole);

      const ownedLeadCheck = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("owner_user_id", user.id);

      if (!ownedLeadCheck.error && !ownedLeadCheck.count) {
        const seededData = cloneMockLeadsForSeed();
        const seededLeads = seededData.map((lead) => toLeadRow(lead, user.id));

        await supabase.from("crm_leads").insert(seededLeads);
        await supabase.from("crm_lead_timeline").insert(
          seededData.flatMap((lead) => toTimelineRows(lead, user.id)),
        );
      }

      const { data: leadRows, error: leadsError } = await supabase
        .from("crm_leads")
        .select("*")
        .order("updated_at", { ascending: false });

      if (leadsError) {
        console.error("Nao foi possivel carregar leads do Supabase.", leadsError);
        setLeads([]);
        setHydrated(true);
        return;
      }

      const leadIds = (leadRows ?? []).map((lead) => lead.id);
      let timelineRows: TimelineRow[] = [];

      if (leadIds.length) {
        const { data: timelineData, error: timelineError } = await supabase
          .from("crm_lead_timeline")
          .select("*")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false });

        if (timelineError) {
          console.error("Nao foi possivel carregar historico do Supabase.", timelineError);
        } else {
          timelineRows = (timelineData ?? []) as TimelineRow[];
        }
      }

      setLeads(mapLeadRows((leadRows ?? []) as LeadRow[], timelineRows));
      setHydrated(true);
    }

    async function bootstrapSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user);

      if (!user) {
        setRole(null);
        setLeads([]);
        setHydrated(true);
        return;
      }

      await loadRemoteCrmData(user);
    }

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);

      if (!session?.user) {
        setRole(null);
        setLeads([]);
        setHydrated(true);
        return;
      }

      void loadRemoteCrmData(session.user);
    });

    return () => subscription.unsubscribe();
  }, [usingSupabase]);

  useEffect(() => {
    if (usingSupabase || !hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [hydrated, leads, usingSupabase]);

  const value = useMemo<CrmContextValue>(() => {
    async function signOut() {
      if (!usingSupabase) return;

      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    async function addLead(input: LeadInput) {
      const createdAt = new Date().toISOString();
      const id = createLeadId();
      const lead: Lead = {
        ...input,
        id,
        createdAt,
        updatedAt: createdAt,
        nextMeeting: null,
        timeline: [
          createTimelineItem({
            type: "lead_created",
            title: "Lead criado",
            description: `Lead cadastrado com interesse em ${input.interest}.`,
            createdAt,
          }),
        ],
      };

      if (!usingSupabase) {
        setLeads((current) => [lead, ...current]);
        return id;
      }

      if (!currentUser) {
        throw new Error("Sessao ausente para criar lead.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: leadError } = await supabase.from("crm_leads").insert(toLeadRow(lead, currentUser.id));

      if (leadError) {
        throw leadError;
      }

      const { error: timelineError } = await supabase.from("crm_lead_timeline").insert(toTimelineRows(lead, currentUser.id));

      if (timelineError) {
        throw timelineError;
      }

      setLeads((current) => [lead, ...current]);
      return id;
    }

    async function updateLead(id: string, updates: Partial<LeadInput>) {
      if (!usingSupabase) {
        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id) return lead;

            const nextStatus = updates.status;
            const currentTime = new Date().toISOString();
            let nextLead: Lead = {
              ...lead,
              ...updates,
              updatedAt: currentTime,
            };

            if (nextStatus && nextStatus !== lead.status && leadStatusOptions.includes(nextStatus)) {
              nextLead = appendTimeline(nextLead, {
                type: "status_changed",
                title: "Status alterado",
                description: `Lead movido de ${lead.status} para ${nextStatus}.`,
                createdAt: currentTime,
              });
            }

            return nextLead;
          }),
        );
        return;
      }

      const currentLead = leads.find((lead) => lead.id === id);
      if (!currentLead) return;
      if (!currentUser) throw new Error("Sessao ausente para atualizar lead.");

      const currentTime = new Date().toISOString();
      const nextStatus = updates.status;
      const statusChanged = Boolean(nextStatus && nextStatus !== currentLead.status && leadStatusOptions.includes(nextStatus));
      const supabase = createSupabaseBrowserClient();

      const patch = {
        ...("name" in updates ? { name: updates.name } : {}),
        ...("whatsapp" in updates ? { whatsapp: updates.whatsapp } : {}),
        ...("company" in updates ? { company: updates.company } : {}),
        ...("niche" in updates ? { niche: updates.niche } : {}),
        ...("interest" in updates ? { interest: updates.interest } : {}),
        ...("source" in updates ? { source: updates.source } : {}),
        ...("status" in updates ? { status: updates.status } : {}),
        ...("notes" in updates ? { notes: updates.notes } : {}),
        updated_at: currentTime,
      };

      const { error: leadError } = await supabase.from("crm_leads").update(patch).eq("id", id);

      if (leadError) {
        throw leadError;
      }

      let timelineItem: LeadTimelineItem | null = null;

      if (statusChanged) {
        timelineItem = createTimelineItem({
          type: "status_changed",
          title: "Status alterado",
          description: `Lead movido de ${currentLead.status} para ${nextStatus}.`,
          createdAt: currentTime,
        });

        const { error: timelineError } = await supabase.from("crm_lead_timeline").insert({
          id: timelineItem.id,
          lead_id: id,
          owner_user_id: currentUser.id,
          type: timelineItem.type,
          title: timelineItem.title,
          description: timelineItem.description,
          created_at: timelineItem.createdAt,
        });

        if (timelineError) {
          throw timelineError;
        }
      }

      setLeads((current) =>
        current.map((lead) => {
          if (lead.id !== id) return lead;

          const nextLead = {
            ...lead,
            ...updates,
            updatedAt: currentTime,
          };

          return timelineItem ? { ...nextLead, timeline: [timelineItem, ...lead.timeline] } : nextLead;
        }),
      );
    }

    async function deleteLead(id: string) {
      if (!usingSupabase) {
        setLeads((current) => current.filter((lead) => lead.id !== id));
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("crm_leads").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setLeads((current) => current.filter((lead) => lead.id !== id));
    }

    function getLeadById(id: string) {
      return leads.find((lead) => lead.id === id);
    }

    async function setLeadStatus(id: string, status: LeadStatus, note?: string) {
      if (!usingSupabase) {
        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id || lead.status === status) return lead;

            const changedAt = new Date().toISOString();
            const nextLead = appendTimeline(
              {
                ...lead,
                status,
              },
              {
                type: "status_changed",
                title: "Status alterado",
                description: note?.trim() || `Lead movido de ${lead.status} para ${status}.`,
                createdAt: changedAt,
              },
            );

            return nextLead;
          }),
        );
        return;
      }

      const currentLead = leads.find((lead) => lead.id === id);
      if (!currentLead || currentLead.status === status) return;
      if (!currentUser) throw new Error("Sessao ausente para alterar status.");

      const changedAt = new Date().toISOString();
      const timelineItem = createTimelineItem({
        type: "status_changed",
        title: "Status alterado",
        description: note?.trim() || `Lead movido de ${currentLead.status} para ${status}.`,
        createdAt: changedAt,
      });
      const supabase = createSupabaseBrowserClient();

      const { error: leadError } = await supabase
        .from("crm_leads")
        .update({ status, updated_at: changedAt })
        .eq("id", id);

      if (leadError) {
        throw leadError;
      }

      const { error: timelineError } = await supabase.from("crm_lead_timeline").insert({
        id: timelineItem.id,
        lead_id: id,
        owner_user_id: currentUser.id,
        type: timelineItem.type,
        title: timelineItem.title,
        description: timelineItem.description,
        created_at: timelineItem.createdAt,
      });

      if (timelineError) {
        throw timelineError;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                status,
                updatedAt: changedAt,
                timeline: [timelineItem, ...lead.timeline],
              }
            : lead,
        ),
      );
    }

    async function addLeadNote(id: string, note: string) {
      const trimmed = note.trim();
      if (!trimmed) return;

      if (!usingSupabase) {
        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id) return lead;

            return appendTimeline(lead, {
              type: "note_added",
              title: "Observacao adicionada",
              description: trimmed,
              createdAt: new Date().toISOString(),
            });
          }),
        );
        return;
      }

      const currentLead = leads.find((lead) => lead.id === id);
      if (!currentLead) return;
      if (!currentUser) throw new Error("Sessao ausente para adicionar observacao.");

      const createdAt = new Date().toISOString();
      const timelineItem = createTimelineItem({
        type: "note_added",
        title: "Observacao adicionada",
        description: trimmed,
        createdAt,
      });
      const supabase = createSupabaseBrowserClient();

      const { error: leadError } = await supabase
        .from("crm_leads")
        .update({ updated_at: createdAt })
        .eq("id", id);

      if (leadError) {
        throw leadError;
      }

      const { error: timelineError } = await supabase.from("crm_lead_timeline").insert({
        id: timelineItem.id,
        lead_id: id,
        owner_user_id: currentUser.id,
        type: timelineItem.type,
        title: timelineItem.title,
        description: timelineItem.description,
        created_at: timelineItem.createdAt,
      });

      if (timelineError) {
        throw timelineError;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                updatedAt: createdAt,
                timeline: [timelineItem, ...lead.timeline],
              }
            : lead,
        ),
      );
    }

    async function scheduleLeadMeeting(id: string, meeting: LeadMeeting) {
      if (!usingSupabase) {
        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id) return lead;

            const scheduledAt = new Date().toISOString();
            const nextStatus = lead.status === "Ganho" || lead.status === "Perdido" ? lead.status : "Call agendada";
            let nextLead: Lead = {
              ...lead,
              nextMeeting: meeting,
              status: nextStatus,
              updatedAt: scheduledAt,
            };

            nextLead = appendTimeline(nextLead, {
              type: "meeting_scheduled",
              title: "Reuniao agendada",
              description: `Reuniao marcada para ${meeting.channel} em ${meeting.location} com ${meeting.owner}.`,
              createdAt: scheduledAt,
            });

            if (lead.status !== nextStatus) {
              nextLead = appendTimeline(nextLead, {
                type: "status_changed",
                title: "Status alterado",
                description: `Lead movido de ${lead.status} para ${nextStatus}.`,
                createdAt: scheduledAt,
              });
            }

            return nextLead;
          }),
        );
        return;
      }

      const currentLead = leads.find((lead) => lead.id === id);
      if (!currentLead) return;
      if (!currentUser) throw new Error("Sessao ausente para agendar reuniao.");

      const scheduledAt = new Date().toISOString();
      const nextStatus = currentLead.status === "Ganho" || currentLead.status === "Perdido" ? currentLead.status : "Call agendada";
      const meetingItem = createTimelineItem({
        type: "meeting_scheduled",
        title: "Reuniao agendada",
        description: `Reuniao marcada para ${meeting.channel} em ${meeting.location} com ${meeting.owner}.`,
        createdAt: scheduledAt,
      });
      const statusItem =
        currentLead.status !== nextStatus
          ? createTimelineItem({
              type: "status_changed",
              title: "Status alterado",
              description: `Lead movido de ${currentLead.status} para ${nextStatus}.`,
              createdAt: scheduledAt,
            })
          : null;
      const supabase = createSupabaseBrowserClient();

      const { error: leadError } = await supabase
        .from("crm_leads")
        .update({
          next_meeting: meeting,
          status: nextStatus,
          updated_at: scheduledAt,
        })
        .eq("id", id);

      if (leadError) {
        throw leadError;
      }

      const rows = [
        {
          id: meetingItem.id,
          lead_id: id,
          owner_user_id: currentUser.id,
          type: meetingItem.type,
          title: meetingItem.title,
          description: meetingItem.description,
          created_at: meetingItem.createdAt,
        },
        ...(statusItem
          ? [
              {
                id: statusItem.id,
                lead_id: id,
                owner_user_id: currentUser.id,
                type: statusItem.type,
                title: statusItem.title,
                description: statusItem.description,
                created_at: statusItem.createdAt,
              },
            ]
          : []),
      ];

      const { error: timelineError } = await supabase.from("crm_lead_timeline").insert(rows);

      if (timelineError) {
        throw timelineError;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                nextMeeting: meeting,
                status: nextStatus,
                updatedAt: scheduledAt,
                timeline: [meetingItem, ...(statusItem ? [statusItem] : []), ...lead.timeline],
              }
            : lead,
        ),
      );
    }

    return {
      hydrated,
      leads,
      currentUser,
      role,
      usingSupabase,
      signOut,
      addLead,
      updateLead,
      deleteLead,
      getLeadById,
      setLeadStatus,
      addLeadNote,
      scheduleLeadMeeting,
    };
  }, [currentUser, hydrated, leads, role, usingSupabase]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrmStore() {
  const context = useContext(CrmContext);

  if (!context) {
    throw new Error("useCrmStore must be used within CrmProvider");
  }

  return context;
}
