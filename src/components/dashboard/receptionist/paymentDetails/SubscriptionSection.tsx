"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { checkSubscriptionAllowance } from "@/services/subscription.api";

interface SubscriptionAllowance {
  id: string;
  subscription_id: string;
  feature_id: string;
  remaining_quantity: number;
  total_quantity: number;
  feature: {
    name: string;
    description: string;
  };
}

interface SubscriptionDetails {
  allowances: SubscriptionAllowance[];
}

interface SubscriptionSectionProps {
  subscriptionDetails: SubscriptionDetails | null;
  appliedCoupon: string | null;
  appliedRewardPoints: number;
  onApplyCoupon: (allowanceId: string, featureId: string) => void;
  onRemoveCoupon: () => void;
}

export default function SubscriptionSection({
  subscriptionDetails,
  appliedCoupon,
  appliedRewardPoints,
  onApplyCoupon,
  onRemoveCoupon,
}: SubscriptionSectionProps) {
  const [couponLoading, setCouponLoading] = useState<string | null>(null);

  const handleApplyCoupon = async (
    allowanceId: string,
    subscriptionId: string,
    featureId: string,
    featureName: string
  ) => {
    setCouponLoading(allowanceId);
    try {
      await checkSubscriptionAllowance(subscriptionId, featureId);
      onApplyCoupon(allowanceId, featureId);
      toast.success(`Coupon applied successfully for ${featureName}!`);
    } catch (error) {
      toast.error(`Failed to apply coupon for ${featureName}.`);
    } finally {
      setCouponLoading(null);
    }
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    toast.info("Coupon removed");
  };

  if (
    !subscriptionDetails ||
    !subscriptionDetails.allowances ||
    subscriptionDetails.allowances.length === 0
  ) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No subscription allowances available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-3">
        You have subscription allowances that can be used for this appointment:
      </p>

      {subscriptionDetails.allowances.map((allowance) => (
        <div
          key={allowance.id}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg bg-green-50 border-green-200 gap-3 sm:gap-0"
        >
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm sm:text-base">
              {allowance.feature.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              {allowance.feature.description}
            </div>
            <div className="text-xs sm:text-sm text-green-700 mt-1">
              Remaining: {allowance.remaining_quantity} /{" "}
              {allowance.total_quantity}
            </div>
          </div>
          <div className="flex justify-end">
            {appliedCoupon === allowance.id ? (
              <Button
                onClick={handleRemoveCoupon}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-3 py-2"
              >
                Remove
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleApplyCoupon(
                    allowance.id,
                    allowance.subscription_id,
                    allowance.feature_id,
                    allowance.feature.name
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2"
                disabled={
                  allowance.remaining_quantity <= 0 ||
                  appliedCoupon !== null ||
                  appliedRewardPoints > 0 ||
                  couponLoading !== null
                }
              >
                {couponLoading === allowance.id
                  ? "Applying..."
                  : allowance.remaining_quantity > 0
                  ? "Activate"
                  : "No Uses Left"}
              </Button>
            )}
          </div>
        </div>
      ))}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Using a subscription coupon will cover the
          consultation fee, and you won't need to make any payment for this
          appointment.
        </p>
      </div>
    </div>
  );
}
