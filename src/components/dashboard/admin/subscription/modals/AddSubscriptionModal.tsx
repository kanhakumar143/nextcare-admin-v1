"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

import {
  PlanFeatures,
  PostSubscriptionPlan,
  GetSubscriptionPlan,
} from "@/types/subscription.type";

import { useAppDispatch } from "@/store/hooks";
import {
  addSubscriptionPlan,
  setSubscriptionPlans,
} from "@/store/slices/subscriptionSlice";
import { getSubscriptionPlansByTenant } from "@/services/subscription.api";

export default function CreateSubscriptionModal({
  tenantId,
}: {
  tenantId: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState([30]);
  const [loading, setLoading] = useState(false);

  const [support, setSupport] = useState<string>("email"); // required field
  const [features, setFeatures] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();

  // Add new optional feature
  const addFeature = () => {
    setFeatures({
      ...features,
      [`feature_${Object.keys(features).length + 1}`]: "",
    });
  };

  // Remove optional feature
  const removeFeature = (key: string) => {
    const updated = { ...features };
    delete updated[key];
    setFeatures(updated);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!name || !price) return;

    // Prepare payload with type conversion
    const payload: PostSubscriptionPlan = {
      tenant_id: tenantId,
      name,
      price,
      duration_days: duration[0],
      features: {
        support,
        ...Object.fromEntries(
          Object.entries(features).map(([k, v]) => {
            // Convert numeric fields
            if (
              [
                "free_consultations",
                "lab_discount_percent",
                "max_users",
              ].includes(k)
            ) {
              return [k, Number(v)];
            }
            // Convert boolean strings
            if (v === "true") return [k, true];
            if (v === "false") return [k, false];
            return [k, v]; // string
          })
        ),
      } as PlanFeatures,
    };

    try {
      setLoading(true);
      await dispatch(addSubscriptionPlan(payload)).unwrap();

      // Reset modal fields
      setName("");
      setPrice("");
      setDuration([30]);
      setSupport("email");
      setFeatures({});

      setOpen(false);

      // Refresh subscription list instantly
      const updatedPlans: GetSubscriptionPlan[] =
        await getSubscriptionPlansByTenant(tenantId);
      dispatch(setSubscriptionPlans(updatedPlans));
    } catch (error: any) {
      console.error("Failed to create subscription:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white rounded-xl shadow-md">
          + Create Subscription
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Name */}
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
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
              {/* Support */}
              <div className="flex items-center gap-2 relative">
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

              {/* Optional Features */}
              {Object.entries(features).map(([key, value], index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 relative group"
                >
                  {/* Editable key */}
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
                  {/* Editable value */}
                  <Input
                    placeholder="Value"
                    value={value}
                    onChange={(e) =>
                      setFeatures({ ...features, [key]: e.target.value })
                    }
                    className="flex-1"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFeature(key)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 " />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
            >
              + Add Feature
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="text-white rounded-lg"
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
