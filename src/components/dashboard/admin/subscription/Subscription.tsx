"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GetSubscriptionPlan } from "@/types/subscription.type";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";
import SubscriptionDetailsModal from "./modals/SubscriptionDetailsModal";
import CreateSubscriptionModal from "./modals/AddSubscriptionModal";
import EditSubscriptionModal from "./modals/EditSubscriptionModal";
import { Eye, Pencil } from "lucide-react";

export default function SubscriptionPage() {
  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";
  const [plans, setPlans] = useState<GetSubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GetSubscriptionPlan | null>(
    null
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await getSubscriptionPlansByTenant(tenantId);
      setPlans(res);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <CreateSubscriptionModal tenantId={tenantId} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="shadow-sm border hover:shadow-md transition"
          >
            <CardHeader className="flex flex-row justify-between items-center">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setDetailsOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <span className="text-green-600 font-semibold text-lg">
                ₹{plan.price}
              </span>
              <p className="text-sm text-muted-foreground">
                Duration: {plan.duration_days} days
              </p>

              {/* Show first 3 features only */}
              <ul className="text-sm list-disc list-inside text-muted-foreground">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li key={`${feature.id || feature.name}-${idx}`}>
                    {feature.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      {selectedPlan && (
        <SubscriptionDetailsModal
          plan={selectedPlan}
          tenantId={tenantId}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onDeleted={fetchPlans}
          onUpdated={fetchPlans}
        />
      )}

      {/* Edit Modal */}
      {selectedPlan && (
        <EditSubscriptionModal
          key={selectedPlan.id} // important to reset state when editing another plan
          plan={selectedPlan}
          tenantId={tenantId}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={fetchPlans}
        />
      )}
    </div>
  );
}
