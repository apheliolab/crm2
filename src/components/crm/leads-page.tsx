"use client";

import { useState } from "react";
import { EmptyLeadsState, LeadModal, LeadsTable, LeadsToolbar, SectionIntro, useFilteredLeads } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { type Lead, type LeadInput } from "@/lib/crm";

export function LeadsPageContent() {
  const { addLead, deleteLead, leads, updateLead } = useCrmStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [interest, setInterest] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  const filteredLeads = useFilteredLeads(leads, query, status, interest);

  function handleSave(value: LeadInput) {
    if (editingLead) {
      updateLead(editingLead.id, value);
      return;
    }

    addLead(value);
  }

  return (
    <div>
      <SectionIntro
        eyebrow="Leads"
        title="Cadastro, busca e acompanhamento"
        description="Cadastre novos contatos em poucos cliques, filtre por interesse ou status e avance cada oportunidade sem perder contexto."
      />

      <LeadsToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        interest={interest}
        onInterestChange={setInterest}
        onCreateClick={() => {
          setEditingLead(undefined);
          setModalOpen(true);
        }}
      />

      {filteredLeads.length ? (
        <LeadsTable
          leads={filteredLeads}
          onEdit={(lead) => {
            setEditingLead(lead);
            setModalOpen(true);
          }}
          onDelete={(lead) => deleteLead(lead.id)}
        />
      ) : (
        <EmptyLeadsState
          onCreateClick={() => {
            setEditingLead(undefined);
            setModalOpen(true);
          }}
        />
      )}

      <LeadModal
        open={modalOpen}
        initialValue={editingLead}
        title={editingLead ? "Editar lead" : "Novo lead"}
        description={editingLead ? "Atualize os dados do lead selecionado." : "Preencha os campos essenciais para colocar o lead na operacao."}
        submitLabel={editingLead ? "Salvar alteracoes" : "Criar lead"}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

