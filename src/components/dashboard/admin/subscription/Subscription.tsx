"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GetSubscriptionPlan } from "@/types/subscription.type";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";
import { Eye, Pencil, Plus } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();
  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";
  const [plans, setPlans] = useState<GetSubscriptionPlan[]>([]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <Button
          className="cursor-pointer"
          onClick={() =>
            router.push("/dashboard/admin/pricing-planes/subscription/add")
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="shadow-sm border hover:shadow-md transition"
          >
            <CardHeader className="flex flex-row justify-between items-center">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="flex items-center gap-2">
                {/* Navigate to details page */}
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  size="icon"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/pricing-planes/subscription/${plan.id}`
                    )
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {/* Navigate to edit page */}
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  size="icon"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/pricing-planes/subscription/${plan.id}/edit`
                    )
                  }
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Admin-set plan price */}
              <span className="text-green-600 font-semibold text-lg">
                ₹{plan.price}
              </span>
              <p className="text-sm text-muted-foreground">
                Duration: {plan.duration_days} days
              </p>

              {/* First 3 features descriptions */}
              <ul className="text-sm list-disc list-inside text-muted-foreground">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li key={`${feature.id || feature.name}-${idx}`}>
                    {/* {feature.description || feature.name} */}
                    Includes {feature.quantity} {feature.name}{" "}
                    {feature.feature_type}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
