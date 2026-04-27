"use client";

import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ClientCard, ClientList } from "@/components/dashboard/shared";
import { useClientStore } from "@/hooks/use-client-store";

export function ClientsPage() {
  const { clientItems } = useClientStore();

  return (
    <div>
      <SectionHeader
        eyebrow="Portfolio"
        title="Clientes"
        description="Carteira atual da Aphelio Lab com status, volume comercial, vendas e ROI do cliente ativo."
        action={<NewClientDialog label="Cadastrar cliente" />}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientItems.map((client) => (
          <ClientCard key={client.slug} client={client} />
        ))}
      </div>
      <div className="mt-6">
        <ClientList items={clientItems} />
      </div>
    </div>
  );
}
