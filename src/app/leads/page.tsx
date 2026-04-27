import { CrmShell } from "@/components/crm/crm-shell";
import { LeadsPageContent } from "@/components/crm/leads-page";

export default function LeadsRoutePage() {
  return (
    <CrmShell>
      <LeadsPageContent />
    </CrmShell>
  );
}
