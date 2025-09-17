// import EditSubscriptionPage from "@/components/subscription/modal/EditSubscriptionPage";
import EditSubscriptionPage from "@/components/dashboard/admin/subscription/modals/EditSubscription";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";
import { GetSubscriptionPlan } from "@/types/subscription.type";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f"; // later replace with auth
  const allPlans: GetSubscriptionPlan[] = await getSubscriptionPlansByTenant(tenantId);
  const plan = allPlans.find((p) => p.id === params.id);

  if (!plan) {
    return <div className="p-6 text-red-500">Plan not found</div>;
  }

  return <EditSubscriptionPage plan={plan} tenantId={tenantId} />;
}
