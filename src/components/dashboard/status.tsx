import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/data";

export function StatusBadge({ status }: { status: ClientStatus | string }) {
  if (status === "Saudavel" || status === "Ativo" || status === "Escalando" || status === "Resolvido" || status === "Convertido") {
    return <Badge variant="success">{status}</Badge>;
  }

  if (status === "Atencao" || status === "Otimizar" || status === "Aguardando humano" || status === "Contrato" || status === "Proposta") {
    return <Badge variant="warning">{status}</Badge>;
  }

  if (status === "Critico" || status === "Pausada") {
    return <Badge variant="danger">{status}</Badge>;
  }

  return <Badge variant="neutral">{status}</Badge>;
}
