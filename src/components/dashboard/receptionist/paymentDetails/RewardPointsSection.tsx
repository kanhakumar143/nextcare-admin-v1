"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins } from "lucide-react";
import { toast } from "sonner";

interface HealthPoints {
  points_balance: number;
}

interface PaymentDetails {
  total_amount: number;
}

interface SubscriptionDetails {
  allowances: any[];
}

interface RewardPointsSectionProps {
  healthPoints: HealthPoints | null;
  paymentDetails: PaymentDetails | null;
  subscriptionDetails: SubscriptionDetails | null;
  appliedCoupon: string | null;
  appliedRewardPoints: number;
  useRewardPoints: boolean;
  onApplyRewardPoints: (points: number) => void;
  onRemoveRewardPoints: () => void;
  onRewardPointsCheckboxChange: (checked: boolean) => void;
}

export default function RewardPointsSection({
  healthPoints,
  paymentDetails,
  subscriptionDetails,
  appliedCoupon,
  appliedRewardPoints,
  useRewardPoints,
  onApplyRewardPoints,
  onRemoveRewardPoints,
  onRewardPointsCheckboxChange,
}: RewardPointsSectionProps) {
  const handleRewardPointsCheckbox = (checked: boolean) => {
    if (checked) {
      const availablePoints = healthPoints?.points_balance || 0;
      const totalAmount = Number(paymentDetails?.total_amount || 0);
      const hasSubscriptionCoupons =
        subscriptionDetails &&
        subscriptionDetails.allowances &&
        subscriptionDetails.allowances.length > 0;
      const advancePayment = hasSubscriptionCoupons ? 0 : 25;
      const maxPayableAmount = Math.max(0, totalAmount - advancePayment);

      // Automatically use all available points up to the payable amount
      const pointsToUse = Math.min(availablePoints, maxPayableAmount);

      if (pointsToUse <= 0) {
        toast.error("No reward points available to apply");
        return;
      }

      onApplyRewardPoints(pointsToUse);
      toast.success(`${pointsToUse} reward points applied successfully!`);
    } else {
      onRemoveRewardPoints();
      toast.info("Reward points removed");
    }

    onRewardPointsCheckboxChange(checked);
  };

  const handleRemoveRewardPoints = () => {
    onRemoveRewardPoints();
    toast.info("Reward points removed");
  };

  if (!healthPoints || healthPoints.points_balance <= 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No reward points available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">
            Available Reward Points
          </div>
        </div>
        <div className="text-lg font-bold text-amber-600">
          {healthPoints.points_balance} Points
        </div>
      </div>

      {appliedRewardPoints > 0 ? (
        <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">
                Applied Reward Points
              </div>
              <div className="text-xs sm:text-sm text-amber-700 mt-1">
                {appliedRewardPoints} points applied
              </div>
            </div>
            <Button
              onClick={handleRemoveRewardPoints}
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-50 text-xs sm:text-sm px-3 py-2"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-amber-50 transition-colors">
            <Checkbox
              id="use-reward-points"
              checked={useRewardPoints}
              onCheckedChange={handleRewardPointsCheckbox}
              disabled={appliedCoupon !== null}
              className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <label
              htmlFor="use-reward-points"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              Use my reward points for this payment (
              {healthPoints.points_balance} points available)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
