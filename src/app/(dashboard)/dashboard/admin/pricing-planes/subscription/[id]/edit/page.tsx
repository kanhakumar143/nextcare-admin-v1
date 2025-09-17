// import EditSubscriptionPage from "@/components/subscription/modal/EditSubscriptionPage";
import EditSubscriptionPage from "@/components/dashboard/admin/subscription/modals/EditSubscription";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";
import { GetSubscriptionPlan } from "@/types/subscription.type";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  try {
    const { id } = await params;
    const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f"; // later replace with auth
    const allPlans: GetSubscriptionPlan[] = await getSubscriptionPlansByTenant(
      tenantId
    );
    const plan = allPlans.find((p) => p.id === id);

    if (!plan) {
      return <div className="p-6 text-red-500">Plan not found</div>;
    }

    return <EditSubscriptionPage plan={plan} tenantId={tenantId} />;
  } catch (error) {
    console.error("Error loading subscription plan:", error);
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error Loading Plan</h2>
        <p>Failed to load the subscription plan. Please try again later.</p>
        <p className="text-sm mt-2 text-gray-600">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
}
