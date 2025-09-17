"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchServices } from "@/store/slices/servicesSlice";
import { fetchSubServicesByServiceId } from "@/store/slices/subServicesSlice";
import { editSubscriptionPlan } from "@/store/slices/subscriptionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { FeatureTypeEnum, GetSubscriptionPlan, UpdateSubscriptionPlan, SubscriptionPlanFeature } from "@/types/subscription.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Feature {
  id?: string;
  serviceId: string;
  serviceName: string;
  subServiceId: string | null;
  subServiceName: string;
  price: number;
  quantity: number;
  featureType: FeatureTypeEnum;
  description: string;
  discount_percent?: number;
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
}

interface EditSubscriptionPageProps {
  plan: GetSubscriptionPlan;
  tenantId: string;
  onClose?: () => void;
}

const durationPresets = [30, 45, 60, 90, 365];

export default function EditSubscriptionPage({ plan, tenantId, onClose }: EditSubscriptionPageProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: services } = useSelector((state: RootState) => state.services);
  const { items: subServices } = useSelector((state: RootState) => state.subService);

  // Original values for change tracking
  const [originalPlan] = useState({
    name: plan.name,
    price: plan.price,
    currency: plan.currency || "INR",
    duration_days: plan.duration_days,
    discount_percent: plan.discount_percent || 0,
    features: plan.features,
  });

  // Current form values
  const [planName, setPlanName] = useState(plan.name);
  const [planPrice, setPlanPrice] = useState(String(plan.price));
  const [planCurrency] = useState(plan.currency || "INR");
  const [planDuration, setPlanDuration] = useState<number>(plan.duration_days);
  const [discountPercent, setDiscountPercent] = useState<number>(plan.discount_percent || 0);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize features from plan data
  useEffect(() => {
    console.log("Initializing features from plan:", plan.features);
    setFeatures(
      plan.features.map((f, index) => {
        console.log(`Initializing feature ${index + 1}:`, f);
        return {
          id: f.id,
          serviceId: "", // We'll populate this when services load
          serviceName: f.name, // This might be the sub-service name initially
          subServiceId: f.sub_service_id,
          subServiceName: f.name, // This is likely the sub-service name
          price: 0, // We'll calculate this from sub-service pricing
          quantity: f.quantity,
          featureType: f.feature_type as FeatureTypeEnum,
          description: f.description,
          discount_percent: f.discount_percent ? Number(f.discount_percent) : undefined,
          isNew: false,
          isModified: false,
          isDeleted: false,
        };
      })
    );
  }, [plan]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Load sub-services for all services when services are loaded
  useEffect(() => {
    if (services.length > 0) {
      console.log("Loading sub-services for all services:", services.map(s => s.name));
      services.forEach(service => {
        dispatch(fetchSubServicesByServiceId(service.id));
      });
    }
  }, [services, dispatch]);

  // Auto-populate service info when services and subServices load
  useEffect(() => {
    if (services.length > 0 && subServices.length > 0 && features.length > 0) {
      console.log("Auto-populating service info:", {
        services: services.length,
        subServices: subServices.length,
        features: features.length,
        subServiceIds: features.map(f => f.subServiceId),
        availableSubServices: subServices.map(ss => ({ id: ss.id, name: ss.name }))
      });

      let hasUpdates = false;

      setFeatures(prev => prev.map((f, index) => {
        // For existing features that have subServiceId but missing serviceId
        if (f.subServiceId && !f.serviceId) {
          // Find the sub-service
          const relatedSubService = subServices.find(ss => ss.id === f.subServiceId);
          console.log(`Feature ${index + 1} (${f.serviceName}) - Looking for sub-service ID:`, f.subServiceId);
          console.log(`Feature ${index + 1} - Found related sub-service:`, relatedSubService);

          if (relatedSubService) {
            // Find the parent service
            const service = services.find(s => s.id === relatedSubService.tenant_service_id);
            console.log(`Feature ${index + 1} - Found parent service:`, service);

            if (service) {
              const price = relatedSubService.pricings?.[0]?.base_price ? Number(relatedSubService.pricings[0].base_price) : 0;
              console.log(`Feature ${index + 1} - Setting price:`, price);
              hasUpdates = true;

              return {
                ...f,
                serviceId: service.id,
                serviceName: service.name, // Set the correct service name
                subServiceName: relatedSubService.name, // Set the correct sub-service name
                price: price,
              };
            }
          } else {
            console.log(`Feature ${index + 1} - Sub-service not found. Available:`, subServices.map(ss => ({ id: ss.id, name: ss.name })));
          }
        }
        return f;
      }));

      if (hasUpdates) {
        console.log("Features updated with service info");
      }
    }
  }, [services, subServices, features.length]); // Added features.length to dependency



  const handleServiceChange = (index: number, serviceId: string, serviceName: string) => {
    setFeatures(prev => prev.map((f, i) =>
      i === index
        ? {
          ...f,
          serviceId,
          serviceName,
          subServiceId: null,
          subServiceName: "",
          price: 0,
          isModified: true,
        }
        : f
    ));

    if (serviceId) {
      dispatch(fetchSubServicesByServiceId(serviceId));
    }
  };

  const handleSubServiceChange = (index: number, subServiceId: string | null) => {
    if (!subServiceId) {
      setFeatures(prev => prev.map((f, i) =>
        i === index
          ? { ...f, subServiceId: null, subServiceName: "", price: 0, isModified: !f.isNew }
          : f
      ));
      return;
    }

    const subService = subServices.find(s => s.id === subServiceId);
    const basePrice = subService?.pricings?.[0]?.base_price ? Number(subService.pricings[0].base_price) : 0;

    setFeatures(prev => prev.map((f, i) =>
      i === index
        ? {
          ...f,
          subServiceId,
          subServiceName: subService?.name || "",
          price: basePrice,
          isModified: !f.isNew,
        }
        : f
    ));
  };

  const handleFeatureChange = (index: number, field: keyof Feature, value: any) => {
    setFeatures(prev => prev.map((f, i) =>
      i === index
        ? { ...f, [field]: value, isModified: !f.isNew }
        : f
    ));
  };

  const handleAddFeature = () => {
    setFeatures(prev => [
      ...prev,
      {
        serviceId: "",
        serviceName: "",
        subServiceId: null,
        subServiceName: "",
        price: 0,
        quantity: 1,
        featureType: FeatureTypeEnum.Other,
        description: "",
        isNew: true,
        isModified: false,
        isDeleted: false,
      },
    ]);
  };

  const handleRemoveFeature = (index: number) => {
    const feature = features[index];
    if (feature.isNew) {
      // Remove completely if it's a new feature
      setFeatures(prev => prev.filter((_, i) => i !== index));
    } else {
      // Mark as deleted if it's an existing feature
      setFeatures(prev => prev.map((f, i) =>
        i === index ? { ...f, isDeleted: true } : f
      ));
    }
  };

  const handleRestoreFeature = (index: number) => {
    setFeatures(prev => prev.map((f, i) =>
      i === index ? { ...f, isDeleted: false } : f
    ));
  };

  const totalFeaturePrice = features
    .filter(f => !f.isDeleted)
    .reduce((sum, f) => sum + (f.price || 0) * (f.quantity || 1), 0);

  // Check if there are any changes
  const hasChanges = () => {
    const nameChanged = planName !== originalPlan.name;
    const priceChanged = planPrice !== String(originalPlan.price);
    const durationChanged = planDuration !== originalPlan.duration_days;
    const discountChanged = discountPercent !== originalPlan.discount_percent;
    const featuresChanged = features.some(f => f.isNew || f.isModified || f.isDeleted);

    return nameChanged || priceChanged || durationChanged || discountChanged || featuresChanged;
  };

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!planName.trim()) {
      errors.push("Plan name is required");
    }

    if (!planPrice || Number(planPrice) <= 0) {
      errors.push("Plan price must be greater than 0");
    }

    if (planDuration < 1) {
      errors.push("Duration must be at least 1 day");
    }

    if (discountPercent < 0 || discountPercent > 100) {
      errors.push("Discount must be between 0 and 100%");
    }

    const activeFeatures = features.filter(f => !f.isDeleted);
    if (activeFeatures.length === 0) {
      errors.push("At least one feature is required");
    }

    activeFeatures.forEach((f, index) => {
      if (!f.serviceName.trim()) {
        errors.push(`Feature ${index + 1}: Service name is required`);
      }
      if (f.quantity < 1) {
        errors.push(`Feature ${index + 1}: Quantity must be at least 1`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("Please fix the validation errors");
      return;
    }

    if (!hasChanges()) {
      toast.info("No changes detected");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateSubscriptionPlan = {
        id: plan.id,
      };

      // Only include changed fields
      if (planName !== originalPlan.name) {
        payload.name = planName;
      }

      if (planPrice !== String(originalPlan.price)) {
        payload.price = planPrice; // Keep as string to match your API
      }

      if (planDuration !== originalPlan.duration_days) {
        payload.duration_days = planDuration;
      }

      if (discountPercent !== originalPlan.discount_percent) {
        payload.discount_percent = discountPercent;
      }

      // Always include currency
      payload.currency = planCurrency;

      // Handle features - only include changed features (new, modified, or deleted)
      const changedFeatures: SubscriptionPlanFeature[] = [];

      features.forEach(f => {
        if (f.isDeleted) {
          // Skip deleted features - they won't be included in the request
          return;
        }

        if (f.isNew) {
          // New feature - don't include id
          changedFeatures.push({
            name: f.subServiceName || f.serviceName,
            sub_service_id: f.subServiceId,
            description: f.description || `Includes ${f.quantity} ${f.subServiceName || f.serviceName}`,
            feature_type: f.featureType,
            quantity: f.quantity,
            discount_percent: f.discount_percent,
          });
        } else if (f.isModified) {
          // Modified existing feature - include id
          changedFeatures.push({
            id: f.id,
            name: f.subServiceName || f.serviceName,
            sub_service_id: f.subServiceId,
            description: f.description || `Includes ${f.quantity} ${f.subServiceName || f.serviceName}`,
            feature_type: f.featureType,
            quantity: f.quantity,
            discount_percent: f.discount_percent,
          });
        }
        // Note: We DON'T include unchanged features to avoid duplicates
      });

      // Only include features if there are any changes to features
      if (changedFeatures.length > 0) {
        payload.features = changedFeatures;
      }

      console.log("Submitting update payload:", payload);

      await dispatch(editSubscriptionPlan(payload));
      toast.success("Subscription plan updated successfully!");

      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header with change indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Subscription Plan</h1>
            <p className="text-muted-foreground">Modify your subscription plan details</p>
          </div>
          {hasChanges() && (
            <Alert className="w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Info */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Plan Information
              {(planName !== originalPlan.name || planPrice !== String(originalPlan.price) || planDuration !== originalPlan.duration_days || discountPercent !== originalPlan.discount_percent) && (
                <Badge variant="secondary" className="text-xs">Modified</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 w-fit">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"

                value={planName}
                onChange={(e) => {
                  setPlanName(e.target.value);
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                placeholder="Enter plan name"
                className={planName !== originalPlan.name ? "border-orange-300 bg-orange-50" : ""}
              />
              {planName !== originalPlan.name && (
                <p className="text-xs text-orange-600">Changed from: {originalPlan.name}</p>
              )}
            </div>

            <div className="space-y-2 w-fit">
              <Label htmlFor="planPrice">Plan Price ({planCurrency})</Label>
              <Input
                id="planPrice"

                type="number"
                value={planPrice}
                onChange={(e) => {
                  setPlanPrice(e.target.value);
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                placeholder="Enter plan price"
                className={planPrice !== String(originalPlan.price) ? "border-orange-300 bg-orange-50 " : ""}
              />
              {planPrice !== String(originalPlan.price) && (
                <p className="text-xs text-orange-600">Changed from: {planCurrency}{originalPlan.price}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="discountPercent">Discount (%)</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => {
                  setDiscountPercent(Number(e.target.value));
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                placeholder="Enter discount percentage"
                className={discountPercent !== originalPlan.discount_percent ? "border-orange-300 bg-orange-50" : ""}
              />
              {discountPercent !== originalPlan.discount_percent && (
                <p className="text-xs text-orange-600">Changed from: {originalPlan.discount_percent}%</p>
              )}
            </div> */}

            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <div className="space-y-3">
                <Slider
                  value={[planDuration]}
                  onValueChange={(v) => {
                    setPlanDuration(v[0]);
                    if (validationErrors.length > 0) setValidationErrors([]);
                  }}
                  min={7}
                  max={365}
                  step={1}
                  className={planDuration !== originalPlan.duration_days ? "accent-orange-500" : ""}
                />
                <div className="text-sm font-medium">
                  Selected: {planDuration} day{planDuration > 1 ? "s" : ""}
                  {planDuration !== originalPlan.duration_days && (
                    <span className="text-orange-600 ml-2">(was {originalPlan.duration_days} days)</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {durationPresets.map((d) => (
                    <Badge
                      key={d}
                      onClick={() => setPlanDuration(d)}
                      className={`cursor-pointer border transition-colors ${planDuration === d
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                Features
                {features.some(f => f.isNew || f.isModified || f.isDeleted) && (
                  <Badge variant="secondary" className="text-xs">Modified</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {/* <Button
                  onClick={() => {
                    console.log("Manual refresh - Current state:", {
                      services: services.length,
                      subServices: subServices.length,
                      features: features.map(f => ({
                        name: f.serviceName,
                        subServiceId: f.subServiceId,
                        serviceId: f.serviceId
                      }))
                    });

                    // Force re-run the mapping logic
                    if (services.length > 0 && subServices.length > 0) {
                      setFeatures(prev => prev.map((f, index) => {
                        if (f.subServiceId && !f.serviceId) {
                          const relatedSubService = subServices.find(ss => ss.id === f.subServiceId);
                          if (relatedSubService) {
                            const service = services.find(s => s.id === relatedSubService.tenant_service_id);
                            if (service) {
                              const price = relatedSubService.pricings?.[0]?.base_price ? Number(relatedSubService.pricings[0].base_price) : 0;
                              console.log(`Manual refresh - Feature ${index + 1}: ${service.name} -> ${relatedSubService.name} (${price})`);
                              return {
                                ...f,
                                serviceId: service.id,
                                serviceName: service.name,
                                subServiceName: relatedSubService.name,
                                price: price,
                              };
                            }
                          }
                        }
                        return f;
                      }));
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Refresh Services
                </Button> */}
                <Button onClick={handleAddFeature} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((f, idx) => {
              const relatedSubServices = subServices.filter((ss) => ss.tenant_service_id === f.serviceId);
              const isChanged = f.isNew || f.isModified;
              const isDeleted = f.isDeleted;

              return (
                <div
                  key={f.id || idx}
                  className={`relative grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-lg transition-all ${isDeleted
                    ? "opacity-50 bg-red-50 border-red-200"
                    : isChanged
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white"
                    }`}
                >
                  {/* Status indicators */}
                  <div className="absolute -top-2 -left-2 flex gap-1">
                    {f.isNew && <Badge className="text-xs bg-green-500">New</Badge>}
                    {f.isModified && <Badge className="text-xs bg-orange-500">Modified</Badge>}
                    {f.isDeleted && <Badge className="text-xs bg-red-500">Deleted</Badge>}
                  </div>

                  {/* Service Input */}
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Input
                      value={f.serviceName}
                      onChange={(e) => {
                        const typedName = e.target.value;
                        const matchedService = services.find(
                          (s) => s.name.toLowerCase() === typedName.toLowerCase()
                        );

                        if (matchedService) {
                          handleServiceChange(idx, matchedService.id, matchedService.name);
                        } else {
                          handleServiceChange(idx, "", typedName);
                        }
                      }}
                      placeholder="Search or type service"
                      list={`service-options-${idx}`}
                      disabled={isDeleted}
                    />
                    <datalist id={`service-options-${idx}`}>
                      {services.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Sub-Service */}
                  <div className="space-y-2">
                    <Label>Sub-Service</Label>
                    {f.serviceId ? (
                      relatedSubServices.length > 0 ? (
                        relatedSubServices.length === 1 ? (
                          <Input
                            value={f.subServiceName || relatedSubServices[0].name}
                            disabled
                          />
                        ) : (
                          <Select
                            value={f.subServiceId || ""}
                            onValueChange={(v) => handleSubServiceChange(idx, v)}
                            disabled={isDeleted}
                          >
                            <SelectTrigger className="w-full">
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
                        <Input disabled placeholder="Loading sub-services..." />
                      )
                    ) : (
                      <Input disabled placeholder="Enter a service first" />
                    )}
                  </div>

                  {/* Feature Type */}
                  <div className="space-y-2">
                    <Label>Feature Type</Label>
                    <Select
                      value={f.featureType}
                      onValueChange={(val) => handleFeatureChange(idx, "featureType", val as FeatureTypeEnum)}
                      disabled={isDeleted}
                    >
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={f.quantity}
                      onChange={(e) => handleFeatureChange(idx, "quantity", Number(e.target.value))}
                      disabled={isDeleted}
                    />
                  </div>

                  {/* Price Display */}
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <div className="text-sm font-medium p-2 bg-muted rounded">
                      {planCurrency}{(f.price * f.quantity).toFixed(2)}
                      {f.price === 0 && (
                        <span className="text-xs text-muted-foreground block">
                          Price will load when sub-service is selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isDeleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreFeature(idx)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {features.filter(f => !f.isDeleted).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No features added yet. Click "Add Feature" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Plan Price */}
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border">
                <div>
                  <p className="font-semibold text-lg">Plan Price</p>
                  <p className="text-sm text-muted-foreground">Base subscription cost</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{planCurrency}{planPrice}</span>
                  {discountPercent > 0 && (
                    <p className="text-sm text-green-600 font-medium">{discountPercent}% discount applied</p>
                  )}
                </div>
              </div>

              {/* Features Breakdown */}
              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">FEATURES BREAKDOWN</h4>
                {features
                  .filter(f => !f.isDeleted && (f.subServiceId || f.serviceName))
                  .map((f, idx) => {
                    const finalPrice = f.price * f.quantity;
                    return (
                      <div
                        key={f.id || idx}
                        className="flex justify-between items-center border-b last:border-b-0 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{f.subServiceName || f.serviceName}</p>
                          {(f.isNew || f.isModified) && (
                            <Badge variant="secondary" className="text-xs">
                              {f.isNew ? "New" : "Modified"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{planCurrency}{finalPrice.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {planCurrency}{f.price} × {f.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {features.filter(f => !f.isDeleted && (f.subServiceId || f.serviceName)).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No features configured</p>
                )}
              </div>

              {/* Total */}
              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Features Value:</p>
                  <span className="text-xl font-bold">{planCurrency}{totalFeaturePrice.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">Plan Discount ({discountPercent}%):</p>
                    <span className="text-green-600 font-medium">
                      -{planCurrency}{((Number(planPrice) * discountPercent) / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                {discountPercent > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="font-bold">Final Plan Price:</p>
                    <span className="text-2xl font-bold text-green-600">
                      {planCurrency}{(Number(planPrice) - (Number(planPrice) * discountPercent) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => onClose ? onClose() : router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>

          <div className="flex gap-3">
            {hasChanges() && (
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to original values
                  setPlanName(originalPlan.name);
                  setPlanPrice(String(originalPlan.price));
                  setPlanDuration(originalPlan.duration_days);
                  setDiscountPercent(originalPlan.discount_percent);
                  setFeatures(originalPlan.features.map(f => ({
                    id: f.id,
                    serviceId: "",
                    serviceName: f.name,
                    subServiceId: f.sub_service_id,
                    subServiceName: f.name,
                    price: 0,
                    quantity: f.quantity,
                    featureType: f.feature_type as FeatureTypeEnum,
                    description: f.description,
                    discount_percent: f.discount_percent ? Number(f.discount_percent) : undefined,
                    isNew: false,
                    isModified: false,
                    isDeleted: false,
                  })));
                  toast.info("Changes discarded");
                }}
              >
                Discard Changes
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!hasChanges() || isSubmitting || validationErrors.length > 0}
              className="flex items-center gap-2 min-w-[140px]"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Updating..." : "Update Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
