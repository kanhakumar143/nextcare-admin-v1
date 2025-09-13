"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GetSubscriptionPlan } from "@/types/subscription.type";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";
import SubscriptionDetailsModal from "./modals/SubscriptionDetailsModal";
import EditSubscriptionModal from "./modals/EditSubscriptionModal";
import { Eye, Pencil } from "lucide-react";

export default function SubscriptionPage() {
  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";
  const [plans, setPlans] = useState<GetSubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GetSubscriptionPlan | null>(null);

  // modal states
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
      <h1 className="text-2xl font-bold">Subscription Plans</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="rounded-2xl shadow-sm border hover:shadow-md transition">
            <CardHeader className="flex flex-row justify-between items-center">
              {/* Left: Plan name */}
              <h2 className="text-lg font-semibold">{plan.name}</h2>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                {/* View Details */}
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

                {/* Edit Plan */}
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

              {/* Show only 3 features preview */}
              <ul className="text-sm list-disc list-inside text-muted-foreground">
                {Object.entries(plan.features)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      {value.toString()}
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details modal */}
      {selectedPlan && (
        <SubscriptionDetailsModal
          plan={selectedPlan}
          tenantId={tenantId}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onDeleted={async () => {
            await fetchPlans();
          }}
          onUpdated={async () => {
            await fetchPlans();
          }}
        />
      )}

      {/* Edit modal */}
      {selectedPlan && (
        <EditSubscriptionModal
          plan={selectedPlan}
          tenantId={tenantId}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={async () => {
            await fetchPlans();
          }}
        />
      )}
    </div>
  );
}
