"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Clock, Star, ArrowLeft } from "lucide-react";
import { GetSubscriptionPlan, SubscriptionPlanFeature } from "@/types/subscription.type";
import { useAppDispatch } from "@/store/hooks";
import { removeSubscriptionPlan } from "@/store/slices/subscriptionSlice";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";

export default function SubscriptionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";
  const [plan, setPlan] = useState<GetSubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const plans = await getSubscriptionPlansByTenant(tenantId);
      const found = plans.find((p) => p.id === id);
      setPlan(found || null);
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      setDeleting(true);
      await dispatch(removeSubscriptionPlan(id as string)).unwrap();
      router.push("/dashboard/admin/pricing-planes/subscription");
    } catch (error) {
      console.error("Failed to delete plan:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  if (!plan) {
    return <div className="p-6 text-muted-foreground">Plan not found.</div>;
  }

  return (
    <div className="p-2 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-100 shadow-md rounded-2xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-green-600">₹{plan.price}</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {plan.duration_days} days
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() =>
              router.push(`/dashboard/admin/pricing-planes/subscription/${plan.id}/edit`)
            }
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Features
        </h2>

        {plan.features.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {plan.features.map((feature: SubscriptionPlanFeature, idx: number) => (
              <Card
                key={feature.id || idx}
                className="rounded-2xl shadow-sm hover:shadow-lg transition border"
              >
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-lg">{feature.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.feature_type && (
                      <Badge variant="secondary">{feature.feature_type}</Badge>
                    )}
                  </div>
                  {feature.quantity !== null && (
                    <p className="text-sm text-muted-foreground">
                      Quantity: {feature.quantity}
                    </p>
                  )}
                  {feature.description && (
                    <p className="text-sm text-muted-foreground">
                       Includes {feature.quantity} {feature.name} {feature.feature_type}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
            No features added for this plan yet.
          </div>
        )}
      </div>
    </div>
  );
}
