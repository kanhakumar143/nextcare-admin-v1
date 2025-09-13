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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { editSubscriptionPlan, setSubscriptionPlans } from "@/store/slices/subscriptionSlice";
import { UpdateSubscriptionPlan, GetSubscriptionPlan, PlanFeatures } from "@/types/subscription.type";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";

interface EditSubscriptionModalProps {
  plan: GetSubscriptionPlan;
  tenantId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export default function EditSubscriptionModal({
  plan,
  tenantId,
  open,
  onClose,
}: EditSubscriptionModalProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price);
  const [duration, setDuration] = useState([plan.duration_days]);
  const [support, setSupport] = useState<string>(plan.features.support);
const [features, setFeatures] = useState<
  Partial<Omit<PlanFeatures, "support">> & Record<string, string | number | boolean>
>(
  Object.fromEntries(
    Object.entries(plan.features).filter(([k]) => k !== "support")
  )
);

  const [loading, setLoading] = useState(false);

  const handleFeatureChange = (key: string, value: string | boolean) => {
    setFeatures({ ...features, [key]: value });
  };

  const addFeature = () => {
    setFeatures({
      ...features,
      [`feature_${Object.keys(features).length + 1}`]: "",
    });
  };

  const removeFeature = (key: string) => {
    const updated = { ...features };
    delete updated[key];
    setFeatures(updated);
  };

  const handleSubmit = async () => {
    if (!name || !price) return;

    const payload: UpdateSubscriptionPlan = {
      id: plan.id,
      name,
      price,
      duration_days: duration[0],
      features: {
        support,
        ...Object.fromEntries(
          Object.entries(features).map(([k, v]) => {
            // convert numeric strings back to numbers
            if (["free_consultations", "lab_discount_percent", "max_users"].includes(k)) {
              return [k, Number(v)];
            }
            if (v === "true") return [k, true];
            if (v === "false") return [k, false];
            return [k, v];
          })
        ),
      },
    };

    try {
      setLoading(true);
      await dispatch(editSubscriptionPlan(payload)).unwrap();

      // Refresh list
      const updatedPlans: GetSubscriptionPlan[] = await getSubscriptionPlansByTenant(tenantId);
      dispatch(setSubscriptionPlans(updatedPlans));

      onClose();
    } catch (error: any) {
      console.error("Failed to edit subscription:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              placeholder="Enter subscription name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              placeholder="e.g. 499 INR"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label>Duration (Days)</Label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={30}
              max={365}
              step={30}
            />
            <div className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{duration[0]} days</span>
            </div>
            <div className="flex gap-2">
              {[30, 90, 180, 365].map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={duration[0] === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration([d])}
                >
                  {d}d
                </Button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {/* Support */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Feature Key"
                  value="support"
                  disabled
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={support}
                  onChange={(e) => setSupport(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Optional features */}
              {Object.entries(features).map(([key, value], index) => (
                <div key={index} className="flex items-center gap-2 relative group">
                  <Input
                    placeholder="Feature Key"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const updated = { ...features };
                      delete updated[key];
                      updated[newKey] = value;
                      setFeatures(updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={value.toString()}
                    onChange={(e) => handleFeatureChange(key, e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(key)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              + Add Feature
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="text-white rounded-lg"
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
