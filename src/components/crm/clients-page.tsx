"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, MessageCircleMore, UserRound } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard, SectionIntro, StatusBadge } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { formatLeadDate, formatPhoneForWhatsapp } from "@/lib/crm";

export function ClientsPageContent() {
  const { leads } = useCrmStore();
  const clients = leads.filter((lead) => lead.status === "Ganho");

  return (
    <div>
      <SectionIntro
        eyebrow="Clientes"
        title="Leads convertidos em clientes"
        description="Tudo o que foi marcado como ganho aparece aqui para a Aphelio acompanhar carteira ativa, origem e contexto comercial."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Clientes ativos"
          value={String(clients.length)}
          help="Operacoes que ja viraram contrato"
          icon={<Building2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Contatos principais"
          value={String(clients.length)}
          help="Responsaveis comerciais na carteira"
          icon={<UserRound className="h-5 w-5" />}
        />
        <MetricCard
          label="Ganhos no CRM"
          value={String(clients.length)}
          help="Base puxada automaticamente do status ganho"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <Card className="mt-6 rounded-xl">
        <CardHeader>
          <div>
            <CardTitle>Carteira de clientes</CardTitle>
            <CardDescription>Clientes entram aqui automaticamente quando um lead recebe o status `Ganho`.</CardDescription>
          </div>
        </CardHeader>

        {clients.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  {["Cliente", "Empresa", "Origem", "Interesse", "Ultima atualizacao", "Acoes"].map((header) => (
                    <th key={header} className="px-1 py-4 font-medium first:pl-0 last:pr-0">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-white/6 last:border-b-0">
                    <td className="px-1 py-4 first:pl-0">
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{client.whatsapp}</p>
                      </div>
                    </td>
                    <td className="px-1 py-4 text-slate-200">{client.company}</td>
                    <td className="px-1 py-4 text-slate-300">{client.source}</td>
                    <td className="px-1 py-4">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={client.status} />
                        <span className="text-slate-300">{client.interest}</span>
                      </div>
                    </td>
                    <td className="px-1 py-4 text-slate-400">{formatLeadDate(client.updatedAt)}</td>
                    <td className="px-1 py-4 pr-0">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/leads/${client.id}`}>
                          <Button variant="secondary" size="sm">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Abrir
                          </Button>
                        </Link>
                        <Button asChild variant="secondary" size="sm">
                          <a href={`https://wa.me/55${formatPhoneForWhatsapp(client.whatsapp)}`} target="_blank" rel="noreferrer">
                            <MessageCircleMore className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <h3 className="text-xl font-semibold text-white">Nenhum cliente ganho ainda</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Quando um lead for marcado como `Ganho`, ele passa a aparecer automaticamente nesta aba.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

