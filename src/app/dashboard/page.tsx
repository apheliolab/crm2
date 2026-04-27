import { DashboardPageContent } from "@/components/crm/dashboard-page";
import { CrmShell } from "@/components/crm/crm-shell";

export default function DashboardPage() {
  return (
    <CrmShell>
      <DashboardPageContent />
    </CrmShell>
  );
}
