"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Edit2 } from "lucide-react";
import { GetSubscriptionPlan, SubscriptionPlanFeature } from "@/types/subscription.type";
import { useAppDispatch } from "@/store/hooks";
import { removeSubscriptionPlan } from "@/store/slices/subscriptionSlice";
import EditSubscriptionModal from "./EditSubscriptionModal";

interface SubscriptionDetailsModalProps {
  plan: GetSubscriptionPlan;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  onUpdated: () => Promise<void>;
}

export default function SubscriptionDetailsModal({
  plan,
  tenantId,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}: SubscriptionDetailsModalProps) {
  const dispatch = useAppDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(removeSubscriptionPlan(plan.id)).unwrap();
      await onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete plan:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full rounded-3xl p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-2xl font-bold">{plan.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Price & Duration */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
            <p className="text-xl font-semibold text-green-600">₹{plan.price}</p>
            <p className="text-sm text-muted-foreground">
              Duration: <span className="font-medium">{plan.duration_days} days</span>
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {plan.features.map((feature: SubscriptionPlanFeature, index: number) => (
                <div
                  key={index}
                  className="p-3 border rounded-xl flex flex-col gap-1 bg-white shadow-sm"
                >
                  <span className="font-medium">{feature.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Type: {feature.feature_type || "-"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Quantity: {feature.quantity ?? "-"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Discount: {feature.discount_percent ?? "-"}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Description: {feature.description || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Edit2 className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>

        {/* Edit Modal */}
        {editOpen && (
          <EditSubscriptionModal
            plan={plan}
            tenantId={tenantId}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onUpdated={onUpdated} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
