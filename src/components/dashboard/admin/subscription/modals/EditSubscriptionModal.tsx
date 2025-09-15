"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { editSubscriptionPlan } from "@/store/slices/subscriptionSlice";
import { GetSubscriptionPlan, SubscriptionPlanFeature, FeatureTypeEnum, UpdateSubscriptionPlan } from "@/types/subscription.type";

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
  onUpdated,
}: EditSubscriptionModalProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price);
  const [duration, setDuration] = useState([plan.duration_days]);
  const [features, setFeatures] = useState<SubscriptionPlanFeature[]>(plan.features || []);
  const [loading, setLoading] = useState(false);

  // Suggested feature templates
  const featureTemplates: SubscriptionPlanFeature[] = [
    { name: "Free Consultation", description: "3 free consultations per month", feature_type: FeatureTypeEnum.Consultation, quantity: 3, discount_percent: 12 },
    { name: "Lab Test Discount", description: "10% discount on lab tests", feature_type: FeatureTypeEnum.Lab, quantity: null, discount_percent: 10 },
  ];

  useEffect(() => {
    setName(plan.name);
    setPrice(plan.price);
    setDuration([plan.duration_days]);
    setFeatures(plan.features || []);
  }, [plan]);

  const addFeature = () => {
    setFeatures([...features, { name: "", description: "", feature_type: "" as FeatureTypeEnum, quantity: null, discount_percent: null }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, field: keyof SubscriptionPlanFeature, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const handleSubmit = async () => {
    if (!name || !price) return;

    // Prepare payload: existing features keep id, new features don't
    const payload: UpdateSubscriptionPlan = {
      id: plan.id,
      name,
      price,
      duration_days: duration[0],
      features: features.map(f => {
        const { id, name, description, feature_type, quantity, discount_percent } = f;
        return {
          ...(id ? { id } : {}), // include id only if existing
          name,
          description,
          feature_type,
          quantity,
          discount_percent,
        };
      }),
    };

    try {
      setLoading(true);
      await dispatch(editSubscriptionPlan(payload)).unwrap();
      await onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Price */}
          <div className="space-y-2">
            <Label>Plan Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label>Duration (Days)</Label>
            <Slider value={duration} onValueChange={setDuration} min={30} max={365} step={30} />
            <div className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{duration[0]} days</span>
            </div>
            <div className="flex gap-2">
              {[30, 90, 180, 365].map(d => (
                <Button key={d} variant={duration[0] === d ? "default" : "outline"} size="sm" onClick={() => setDuration([d])}>{d}d</Button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="max-h-72 overflow-y-auto space-y-3 border rounded-md p-3">
              {features.map((feature, index) => (
                <div key={feature.id || `${feature.name}-${index}`} className="space-y-2 border rounded-md p-3 relative group">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Feature Name" value={feature.name} onChange={(e) => updateFeature(index, "name", e.target.value)} className="h-9 text-sm" />
                    <Select value={feature.feature_type || undefined} onValueChange={(val) => updateFeature(index, "feature_type", val as FeatureTypeEnum)}>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select feature type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FeatureTypeEnum).map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Quantity" type="number" value={feature.quantity ?? ""} onChange={(e) => updateFeature(index, "quantity", e.target.value ? Number(e.target.value) : null)} className="h-9 text-sm" />
                    <Input placeholder="Discount %" type="number" value={feature.discount_percent ?? ""} onChange={(e) => updateFeature(index, "discount_percent", e.target.value ? Number(e.target.value) : null)} className="h-9 text-sm" />
                    <Input placeholder="Description" value={feature.description} onChange={(e) => updateFeature(index, "description", e.target.value)} className="h-9 text-sm col-span-2" />
                  </div>
                  <button type="button" onClick={() => removeFeature(index)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add & Suggested Features */}
            <div className="flex items-start gap-4 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>+ Add Feature</Button>
              <div className="flex gap-2 flex-wrap">
                {featureTemplates.map((feature, index) => (
                  <div key={index} className="cursor-pointer border rounded-lg p-3 w-36 flex flex-col gap-1 hover:shadow-lg transition-shadow duration-200 bg-white"
                       onClick={() => {
                         if (!features.some(f => f.name === feature.name && !f.id)) {
                           setFeatures(prev => [...prev, { ...feature, id: undefined }]);
                         }
                       }}>
                    <span className="font-semibold text-sm">{feature.name}</span>
                    <span className="text-xs text-muted-foreground">Type: {feature.feature_type}</span>
                    <span className="text-xs text-muted-foreground">Discount: {feature.discount_percent ?? "-"}</span>
                    <span className="text-xs text-muted-foreground">Quantity: {feature.quantity ?? "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="text-white rounded-lg">{loading ? "Updating..." : "Update"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
