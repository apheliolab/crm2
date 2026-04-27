"use client";

import { BellRing, Database, ShieldCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionIntro } from "@/components/crm/crm-ui";

export function SettingsPageContent() {
  return (
    <div>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Preferencias da operacao"
        description="Esta primeira versao usa armazenamento local para ser rapida, simples e pronta para demonstracao comercial."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SettingsCard
          icon={<Database className="h-5 w-5" />}
          title="Armazenamento local"
          description="Os leads ficam salvos no navegador com `localStorage`, ideal para prototipo e validacao rapida."
        />
        <SettingsCard
          icon={<BellRing className="h-5 w-5" />}
          title="Proximos passos"
          description="A evolucao natural inclui automacoes, alertas internos, multiusuarios e sincronizacao com WhatsApp."
        />
        <SettingsCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Pronto para evoluir"
          description="A estrutura em React, TypeScript e componentes separados facilita conectar backend quando a operacao crescer."
        />
      </div>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5a654]/20 bg-[#f5a654]/10 text-[#ffd39a]">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

