import { ClientsPageContent } from "@/components/crm/clients-page";
import { CrmShell } from "@/components/crm/crm-shell";

export default function ClientesPage() {
  return (
    <CrmShell>
      <ClientsPageContent />
    </CrmShell>
  );
}
