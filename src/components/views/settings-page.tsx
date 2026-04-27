import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/dashboard/section-header";

export function SettingsPage() {
  return (
    <div>
      <SectionHeader eyebrow="Configuracoes" title="Operacao da agencia" description="Dados da agencia, branding, usuarios, integracoes, permissoes e preferencias visuais." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="form-panel">
          <CardHeader><div><CardTitle>Dados da agencia</CardTitle><CardDescription>Identidade principal do workspace.</CardDescription></div></CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm">Nome<Input defaultValue="Aphelio Lab" /></label>
            <label className="grid gap-2 text-sm">Dominio<Input defaultValue="aphelio.lab" /></label>
            <label className="grid gap-2 text-sm">Moeda<Select defaultValue="brl"><option value="brl">BRL</option><option value="usd">USD</option></Select></label>
            <label className="grid gap-2 text-sm">Timezone<Select defaultValue="sp"><option value="sp">America/Sao_Paulo</option></Select></label>
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Branding</CardTitle><CardDescription>Visual aplicado aos relatorios e portais de cliente.</CardDescription></div></CardHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-accent/30 bg-[rgba(206,103,54,0.16)] p-2">
                <Image src="/aphelio-logo.png" alt="Aphelio Lab" width={40} height={40} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="font-medium text-white">Aphelio Lab</p>
                <p className="text-sm text-muted">Logo aplicado em capas premium.</p>
              </div>
            </div>
            <Button variant="secondary">Atualizar marca</Button>
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Usuarios e permissoes</CardTitle><CardDescription>Acesso por funcao operacional.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {["Admin", "Performance", "Operacao", "Cliente"].map((role, index) => (
              <div key={role} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sm text-white">{role}</span>
                <Badge variant="neutral">{[3, 6, 4, 12][index]} usuarios</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Integracoes</CardTitle><CardDescription>Conectores usados pelos dashboards.</CardDescription></div></CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {["Meta Ads", "Google Ads", "WhatsApp", "CRM", "Gateway", "BI"].map((name) => (
              <div key={name} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sm text-white">{name}</span>
                <Badge variant="success">Conectado</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
