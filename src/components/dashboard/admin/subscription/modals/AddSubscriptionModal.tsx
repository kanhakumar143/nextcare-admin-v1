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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

import {
  PostSubscriptionPlan,
  GetSubscriptionPlan,
  SubscriptionPlanFeature,
  FeatureTypeEnum,
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
  const [features, setFeatures] = useState<SubscriptionPlanFeature[]>([]);

  const dispatch = useAppDispatch();

  // ---------------- Feature Templates ----------------
  const featureTemplates: SubscriptionPlanFeature[] = [
    {
      name: "Free Consultation",
      description: "3 free consultations per month",
      feature_type: FeatureTypeEnum.Consultation,
      quantity: 3,
      discount_percent: 12,
    },
    {
      name: "Lab Test Discount",
      description: "10% discount on lab tests",
      feature_type: FeatureTypeEnum.Lab,
      quantity: null,
      discount_percent: 10,
    },
    {
      name: "Family Members",
      description: "Up to 5 family members",
      feature_type: FeatureTypeEnum.FamilySlot,
      quantity: 5,
      discount_percent: 15,
    },
  ];

  // ---------------- Feature Handlers ----------------
  const addFeature = () => {
    setFeatures([
      ...features,
      {
        name: "",
        description: "",
        feature_type: "" as FeatureTypeEnum,
        quantity: null,
        discount_percent: null,
      },
    ]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (
    index: number,
    field: keyof SubscriptionPlanFeature,
    value: any
  ) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  // ---------------- Submit Handler ----------------
  const handleSubmit = async () => {
    if (!name || !price) return;

    const payload: PostSubscriptionPlan = {
      tenant_id: tenantId,
      name,
      price,
      duration_days: duration[0],
      features,
    };

    try {
      setLoading(true);
      await dispatch(addSubscriptionPlan(payload)).unwrap();

      // Reset fields
      setName("");
      setPrice("");
      setDuration([30]);
      setFeatures([]);
      setOpen(false);

      // Refresh subscription plans list
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

      <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
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
              placeholder="e.g. 4999"
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

         

          {/* Features Section */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="max-h-72 overflow-y-auto space-y-3 border rounded-md p-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="space-y-2 border rounded-md p-3 relative group"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Feature Name"
                      value={feature.name}
                      onChange={(e) =>
                        updateFeature(index, "name", e.target.value)
                      }
                      className="h-9 text-sm"
                    />

                    <Select
                      value={feature.feature_type || undefined}
                      onValueChange={(val) =>
                        updateFeature(
                          index,
                          "feature_type",
                          val as FeatureTypeEnum
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select feature type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FeatureTypeEnum).map((ft) => (
                          <SelectItem key={ft} value={ft}>
                            {ft}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Quantity"
                      type="number"
                      value={feature.quantity ?? ""}
                      onChange={(e) =>
                        updateFeature(
                          index,
                          "quantity",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="h-9 text-sm"
                    />

                    <Input
                      placeholder="Discount %"
                      type="number"
                      value={feature.discount_percent ?? ""}
                      onChange={(e) =>
                        updateFeature(
                          index,
                          "discount_percent",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="h-9 text-sm"
                    />

                    <Input
                      placeholder="Description"
                      value={feature.description}
                      onChange={(e) =>
                        updateFeature(index, "description", e.target.value)
                      }
                      className="h-9 text-sm col-span-2"
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
           {/* Add Feature + Suggested Features */}
          <div className="flex items-start gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
            >
              + Add Feature
            </Button>

            {/* Suggested Features Cards */}
            <div className="flex gap-2 flex-wrap">
              {featureTemplates.slice(0, 2).map((feature, index) => (
                <div
                  key={index}
                  className="cursor-pointer border rounded-lg p-3 w-36 flex flex-col gap-1
                             hover:shadow-lg transition-shadow duration-200 bg-white"
                  onClick={() =>
                    setFeatures((prev) => [...prev, { ...feature }])
                  }
                >
                  <span className="font-semibold text-sm">{feature.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Type: {feature.feature_type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Discount: {feature.discount_percent ?? "-"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Quantity: {feature.quantity ?? "-"}
                  </span>
                </div>
              ))}
            </div>
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
