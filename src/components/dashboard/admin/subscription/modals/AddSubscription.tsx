"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchServices } from "@/store/slices/servicesSlice";
import { fetchSubServicesByServiceId } from "@/store/slices/subServicesSlice";
import { addSubscriptionPlan } from "@/store/slices/subscriptionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import {
  FeatureTypeEnum,
  PostSubscriptionPlan,
} from "@/types/subscription.type";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

interface Feature {
  serviceId: string;
  serviceName: string;
  subServiceId: string | null;
  subServiceName: string;
  price: number;
  quantity: number;
  featureType: FeatureTypeEnum;
}

const durationPresets = [30, 45, 60, 90, 365];

export default function AddSubscriptionPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: services } = useSelector((state: RootState) => state.services);
  const { items: subServices } = useSelector(
    (state: RootState) => state.subService
  );

  const [planName, setPlanName] = useState("");
  const [planDuration, setPlanDuration] = useState<number>(30);
  const [price, setPrice] = useState<string>("");
  const [features, setFeatures] = useState<Feature[]>([
    {
      serviceId: "",
      serviceName: "",
      subServiceId: null,
      subServiceName: "",
      price: 0,
      quantity: 1,
      featureType: FeatureTypeEnum.Other,
    },
  ]);

  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";

  // Auto-select single sub-service when subServices load
  useEffect(() => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.serviceId && !f.subServiceId) {
          const relatedSubs = subServices.filter(
            (ss) => ss.tenant_service_id === f.serviceId
          );

          if (relatedSubs.length === 1) {
            const autoSub = relatedSubs[0];
            return {
              ...f,
              // only update sub-service and price, keep serviceName intact
              subServiceId: autoSub.id,
              subServiceName: autoSub.name,
              price:
                autoSub.pricings && autoSub.pricings.length > 0
                  ? Number(autoSub.pricings[0].base_price)
                  : 0,
            };
          }
        }
        return f;
      })
    );
  }, [subServices]);

  const handleServiceChange = (
    index: number,
    serviceId: string,
    serviceName: string
  ) => {
    setFeatures((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              serviceId,
              serviceName,
              subServiceId: null,
              subServiceName: "",
              price: 0,
            }
          : f
      )
    );

    if (serviceId) {
      dispatch(fetchSubServicesByServiceId(serviceId));
    }
  };

  const handleSubServiceChange = (
    index: number,
    subServiceId: string | null
  ) => {
    if (!subServiceId) {
      setFeatures((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, subServiceId: null, subServiceName: "", price: 0 }
            : f
        )
      );
      return;
    }

    const subService = subServices.find((s) => s.id === subServiceId);
    const basePrice =
      subService?.pricings && subService.pricings.length > 0
        ? Number(subService.pricings[0].base_price)
        : 0;

    setFeatures((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              subServiceId,
              subServiceName: subService?.name || "",
              price: basePrice,
            }
          : f
      )
    );
  };

  const handleQuantityChange = (index: number, value: number) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === index ? { ...f, quantity: value } : f))
    );
  };

  const handleFeatureTypeChange = (index: number, type: FeatureTypeEnum) => {
    setFeatures((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              featureType: type,
              // quantity: type === FeatureTypeEnum.Lab ? 0 : 1,
            }
          : f
      )
    );
  };

  const handleAddFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        serviceId: "",
        serviceName: "",
        subServiceId: null,
        subServiceName: "",
        price: 0,
        quantity: 1,
        featureType: FeatureTypeEnum.Other,
      },
    ]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const totalFeaturePrice = features.reduce(
    (sum, f) => sum + (f.price || 0) * (f.quantity || 1),
    0
  );

  const handleSubmit = async () => {
    const payload: PostSubscriptionPlan = {
      tenant_id: tenantId,
      name: planName,
      duration_days: planDuration,
      price: price,
      features: features
        .filter((f) => f.subServiceId || f.serviceName)
        .map((f) => ({
          name: f.subServiceName || f.serviceName,
          sub_service_id: f.subServiceId,
          description:
            f.featureType === FeatureTypeEnum.Lab
              ? `Lab discount ${f.quantity}%`
              : `Includes ${f.quantity} ${f.subServiceName || f.serviceName}`,
          feature_type: f.featureType,
          quantity: f.quantity,
        })),
    };

    console.log("Submitting subscription:", payload);
    await dispatch(addSubscriptionPlan(payload));
    toast.success("Subscription plan created successfully!");
    router.push("/dashboard/admin/pricing-planes/subscription");
  };

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Plan Name</Label>
              <Input
                className="mt-2 w-fit"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div>
              <Label>Plan Price</Label>
              <Input
                type="string"
                className="mt-2 w-fit"
                placeholder="Enter plan price"
                value={price}
                onChange={(e) => setPrice(String(e.target.value))}
              />
              {/* <p className="text-xs text-muted-foreground mt-1">
                Suggestions: {totalFeaturePrice},{" "}
                {Math.round(totalFeaturePrice * 0.9)},{" "}
                {Math.round(totalFeaturePrice * 1.1)}
              </p> */}
            </div>
            <div>
              <Label>Duration (days)</Label>
              <div className="space-y-2 mt-2">
                <Slider
                  value={[planDuration]}
                  onValueChange={(v) => setPlanDuration(v[0])}
                  min={7}
                  max={365}
                  step={1}
                />
                {/* Show selected duration */}
                <div className="text-sm font-medium">
                  Selected: {planDuration} day{planDuration > 1 ? "s" : ""}
                </div>
                <div className="flex gap-2 flex-wrap mt-1">
                  {durationPresets.map((d) => (
                    <Badge
                      key={d}
                      onClick={() => setPlanDuration(d)}
                      className={`cursor-pointer border ${
                        planDuration === d
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d}d
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, idx) => {
              const relatedSubServices = subServices.filter(
                (ss) => ss.tenant_service_id === feature.serviceId
              );

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-4 rounded-md"
                >
                  {/* Service (searchable input) */}
                  <div>
                    <Label>Service</Label>
                    <Input
                      className="mt-2"
                      value={feature.serviceName}
                      onChange={(e) => {
                        const typedName = e.target.value;
                        const matchedService = services.find(
                          (s) =>
                            s.name.toLowerCase() === typedName.toLowerCase()
                        );

                        if (matchedService) {
                          handleServiceChange(
                            idx,
                            matchedService.id,
                            matchedService.name
                          );

                          const relatedSubs = subServices.filter(
                            (ss) => ss.tenant_service_id === matchedService.id
                          );

                          if (relatedSubs.length === 1) {
                            const autoSub = relatedSubs[0];
                            // Use the existing handler instead of manually setting price
                            handleSubServiceChange(idx, autoSub.id);
                          } else {
                            // clear subservice if multiple/none
                            handleSubServiceChange(idx, null);
                          }
                        } else {
                          handleServiceChange(idx, "", typedName);
                          handleSubServiceChange(idx, null);
                        }
                      }}
                      placeholder="Search or type service"
                      list="service-options"
                    />
                    <datalist id="service-options">
                      {services.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Subservice */}
                  <div>
                    <Label className="mb-2">Sub-Service</Label>
                    {feature.serviceId ? (
                      relatedSubServices.length > 0 ? (
                        relatedSubServices.length === 1 ? (
                          <Input value={relatedSubServices[0].name} disabled />
                        ) : (
                          <Select
                            value={feature.subServiceId || ""}
                            onValueChange={(v) =>
                              handleSubServiceChange(idx, v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-service" />
                            </SelectTrigger>
                            <SelectContent>
                              {relatedSubServices.map((ss) => (
                                <SelectItem key={ss.id} value={ss.id}>
                                  {ss.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      ) : (
                        <Input
                          disabled
                          placeholder="No sub-services available"
                        />
                      )
                    ) : (
                      <Input disabled placeholder="Enter a service first" />
                    )}
                  </div>
                  {/* Feature Type */}
                  <div>
                    <Label>Feature Type</Label>
                    <Select
                      value={feature.featureType}
                      onValueChange={(v) =>
                        handleFeatureTypeChange(idx, v as FeatureTypeEnum)
                      }
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FeatureTypeEnum).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label>Quantity</Label> {/* Always show "Quantity" */}
                    <Input
                      type="number"
                      className="mt-2"
                      min={1}
                      value={feature.quantity}
                      onChange={(e) =>
                        handleQuantityChange(idx, Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFeature(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button onClick={handleAddFeature}>+ Add Feature</Button>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 border rounded-md p-4 bg-muted/30">
              {features
                .filter((f) => f.subServiceId || f.serviceName)
                .map((f, idx) => {
                  const finalPrice = f.price * (f.quantity || 1); // always multiply by quantity

                  return (
                    <div
                      key={`${f.subServiceId || f.serviceName}-${idx}`}
                      className="flex justify-between items-center border-b last:border-b-0 py-2"
                    >
                      <div>
                        <p className="font-medium">
                          {f.subServiceName || f.serviceName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{f.price} × {f.quantity} = ₹{finalPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ₹{finalPrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
            </div>
            <p className="mt-4 font-semibold">
              Total Features Price: ₹
              {features
                .reduce((sum, f) => sum + f.price * (f.quantity || 1), 0)
                .toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleSubmit} className="w-48">
            Save Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
