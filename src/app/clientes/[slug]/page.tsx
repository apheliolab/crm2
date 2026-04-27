import { redirect } from "next/navigation";

export default async function ClienteDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  redirect("/clientes");
}
