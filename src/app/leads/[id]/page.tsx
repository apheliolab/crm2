import { CrmShell } from "@/components/crm/crm-shell";
import { LeadDetailPageContent } from "@/components/crm/lead-detail-page";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <CrmShell>
      <LeadDetailPageContent leadId={id} />
    </CrmShell>
  );
}

