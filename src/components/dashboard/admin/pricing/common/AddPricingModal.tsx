"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchServices } from "@/store/slices/servicesSlice";
import {
  fetchAllPricing,
  postPricing,
  resetPricingState,
} from "@/store/slices/pricingSlice";
import { fetchTaxRates } from "@/store/slices/taxManagementSlice";
import { fetchSubServicesByServiceId } from "@/store/slices/subServicesSlice";
import { PricingPayload } from "@/types/pricing.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AddPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: {
    service: any;
    subservice: any;
    price: number;
    tax_id: string;
    service_subservice_id: string;
    isActive: boolean;
  }) => void;
  entry?: any;
}

export default function AddPricingModal({
  isOpen,
  onClose,
  onAdd,
  entry,
}: AddPricingModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: services, loading: servicesLoading } = useSelector(
    (state: RootState) => state.services
  );
  const { taxRates } = useSelector((state: RootState) => state.taxManagement);
  const { items: subservices, loading: subservicesLoading } = useSelector(
    (state: RootState) => state.subService
  );
  const pricingState = useSelector((state: RootState) => state.pricing);

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedSubserviceId, setSelectedSubserviceId] = useState("");
  const [selectedSubservice, setSelectedSubservice] = useState<any>(null);
  const [price, setPrice] = useState(100);
  const [selectedTaxId, setSelectedTaxId] = useState("");

  const suggestedPrices = [100, 250, 500, 1000];

  // Fetch services & taxes when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchServices());
      dispatch(fetchTaxRates());
    }
  }, [isOpen, dispatch]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedServiceId("");
      setSelectedService(null);
      setSelectedSubserviceId("");
      setSelectedSubservice(null);
      setPrice(100);
      setSelectedTaxId("");
    }
  }, [isOpen]);

  // Prefill for editing
  useEffect(() => {
    if (entry) {
      setSelectedService(entry.service || null);
      setSelectedServiceId(entry.service?.id || "");
      setSelectedSubservice(entry.subservice || null);
      setSelectedSubserviceId(entry.subservice?.id || "");
      setPrice(entry.price ?? 100);
      setSelectedTaxId(entry.tax_id || "");
    }
  }, [entry]);

  // Fetch subservices when service changes
  useEffect(() => {
    if (selectedServiceId) {
      dispatch(fetchSubServicesByServiceId(selectedServiceId));
    }
  }, [dispatch, selectedServiceId]);

  const handleSave = () => {
    if (!selectedService || !selectedSubservice || !selectedTaxId) return;

    const payload: PricingPayload = {
      sub_service_id: selectedSubservice.id,
      base_price: price,
      tax_id: selectedTaxId,
      currency: "INR",
      active: selectedSubservice?.is_active ?? true,
    };

    dispatch(postPricing(payload)).then((res: any) => {
      if (postPricing.fulfilled.match(res)) {
        onAdd({
          service: selectedService,
          subservice: selectedSubservice,
          price,
          tax_id: selectedTaxId,
          service_subservice_id: selectedSubservice.id,
          isActive: selectedSubservice?.is_active ?? true,
        });
        dispatch(fetchAllPricing(process.env.NEXT_PUBLIC_TENANT_ID || ""));
        dispatch(resetPricingState());
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Pricing" : "Add New Pricing"}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mt-4 mb-6">
          {["Service", "Subservice", "Pricing"].map((title, idx) => {
            const currentStep = idx + 1;
            const isActive = step === currentStep;
            const isCompleted = step > currentStep;
            return (
              <div key={title} className="flex-1 flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "border-primary"
                      : "border-gray-300 text-gray-500"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : currentStep}
                </div>
                {currentStep !== 3 && (
                  <div
                    className={cn(
                      "flex-1 h-1 ml-2 rounded",
                      step > currentStep ? "bg-primary" : "bg-gray-300"
                    )}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Select
                value={selectedServiceId}
                onValueChange={(val) => {
                  setSelectedServiceId(val);
                  const srv = services.find((s) => s.id === val);
                  setSelectedService(srv || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      servicesLoading ? "Loading..." : "Select a service"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id}>
                      {srv.name || srv.service_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subservice</label>
              <Select
                value={selectedSubserviceId}
                onValueChange={(val) => {
                  setSelectedSubserviceId(val);
                  const sp = subservices.find((s: any) => s.id === val);
                  setSelectedSubservice(sp || null);
                }}
                disabled={subservicesLoading || subservices.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      subservicesLoading
                        ? "Loading..."
                        : subservices.length === 0
                        ? "No subservices found"
                        : "Select a subservice"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subservices.map((sp: any) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.subservice_label || sp.display || sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <>
              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full border rounded-md p-2"
                />
              </div>
              {/* Suggested Prices */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Suggested Pricing</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrices.map((p) => (
                    <Badge
                      key={p}
                      onClick={() => setPrice(p)}
                      className="cursor-pointer hover:bg-primary/20"
                      variant={price === p ? "default" : "outline"}
                    >
                      ₹{p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tax Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax</label>
                <Select value={selectedTaxId} onValueChange={setSelectedTaxId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tax rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRates.map((tax) => (
                      <SelectItem key={tax.id} value={tax.id}>
                        {tax.name} ({tax.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total with tax */}
              <div className="pt-2 border-t">
                <label className="text-sm font-medium">Total (with tax)</label>
                <div className="text-xl font-bold text-primary text-right">
                  {(() => {
                    const tax = taxRates.find(
                      (t: any) => t.id === selectedTaxId
                    );
                    const taxAmt =
                      tax && typeof tax.rate === "number"
                        ? Math.round(price * (tax.rate / 100))
                        : 0;
                    return `₹${price + taxAmt}`;
                  })()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <DialogFooter className="mt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => Math.min(s + 1, 3))}
              disabled={
                (step === 1 && !selectedServiceId) ||
                (step === 2 && !selectedSubserviceId)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-primary text-white"
              disabled={
                pricingState.loading ||
                !price ||
                !selectedSubserviceId ||
                !selectedTaxId
              }
            >
              {pricingState.loading ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
