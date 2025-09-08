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
import { PricingPayload } from "@/types/pricing.types";
import { getSpecialtiesByServiceId } from "@/services/specialty.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { toast } from "sonner";

interface AddPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: {
    service: any;
    specialty: any;
    price: number;
    tax: number;
    service_specialty_id: string;
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
  const { items: services, loading } = useSelector(
    (state: RootState) => state.services
  );

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [specialties, setSpecialties] = useState<Array<any>>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
  const [price, setPrice] = useState(100);
  const [tax, setTax] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const suggestedPrices = [100, 250, 500, 1000];

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen) dispatch(fetchServices());
  }, [isOpen, dispatch]);

  // Reset modal on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedServiceId("");
      setSelectedService(null);
      setSpecialties([]);
      setSelectedSpecialtyId("");
      setSelectedSpecialty(null);
      setPrice(100);
      setTax(10);
      setSuccessMessage("");
    }
  }, [isOpen]);

  // Prefill modal fields with entry values when editing
  useEffect(() => {
    if (entry) {
      setStep(1);
      setSelectedServiceId(entry.service_specialty_id || "");
      setSelectedService(entry.service || null);
      setSpecialties([]); // Optionally fetch specialties for the service
      setSelectedSpecialtyId(entry.service_specialty_id || "");
      setSelectedSpecialty(entry.specialty || null);
      setPrice(entry.price ?? 100);
      setTax(entry.tax ?? 10);
      setSuccessMessage("");
    }
  }, [entry]);

  // Fetch specialties after selecting a service
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (!selectedServiceId) return;
      setSpecialtiesLoading(true);
      try {
        const data = await getSpecialtiesByServiceId(selectedServiceId);
        // If data.data exists and is an array, use it; else fallback to data
        const specialtiesArray = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setSpecialties(specialtiesArray);
        setSpecialtiesLoading(false);
        if (specialtiesArray.length > 0) {
          setTimeout(() => {
            setSelectedSpecialtyId(specialtiesArray[0].id);
            setSelectedSpecialty(specialtiesArray[0]);
          }, 0);
        } else {
          setSelectedSpecialtyId("");
          setSelectedSpecialty(null);
        }
      } catch (err) {
        console.error("Failed to fetch specialties:", err);
        setSpecialties([]);
        setSpecialtiesLoading(false);
        setSelectedSpecialtyId("");
        setSelectedSpecialty(null);
      }
    };

    fetchSpecialties();
  }, [selectedServiceId]);

  const nextStep = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && !selectedSpecialty) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Pricing state from Redux
  const pricingState = useSelector((state: RootState) => state.pricing);

  const handleSave = () => {
    if (!selectedService || !selectedSpecialty) return;

    const payload: PricingPayload = {
      tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "",
      service_specialty_id: selectedSpecialty.id,
      base_price: price,
      tax_percentage: tax,
      currency: "INR",
      remark: "Standard consultation fee",
    };

    dispatch(postPricing(payload)).then((res: any) => {
      if (postPricing.fulfilled.match(res)) {
        // ✅ First click will close modal
        onAdd({
          service: selectedService,
          specialty: selectedSpecialty,
          price,
          tax,
          service_specialty_id: selectedSpecialty.id, // Include service_specialty_id
          isActive: selectedSpecialty?.is_active ?? true,
        });
        dispatch(fetchAllPricing(process.env.NEXT_PUBLIC_TENANT_ID || ""));
        dispatch(resetPricingState());
        onClose(); // closes immediately
      } else {
        console.error("Error:", res.payload);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Add New Pricing</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mt-4 mb-6">
          {["Service", "Specialty", "Pricing"].map((title, idx) => {
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
            <>
              {/* Service Select */}
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
                      placeholder={loading ? "Loading..." : "Select a service"}
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

              {/* Specialty Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Select
                  value={selectedSpecialtyId}
                  onValueChange={(val) => {
                    setSelectedSpecialtyId(val);
                    const sp = specialties.find((s) => s.id === val);
                    setSelectedSpecialty(sp || null);
                  }}
                  disabled={specialtiesLoading || specialties.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        specialtiesLoading
                          ? "Loading specialties..."
                          : specialties.length === 0
                          ? "No specialties found"
                          : "Select a specialty"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.specialty_label || sp.display || sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Slider
                  value={[price]}
                  onValueChange={(val) => setPrice(val[0])}
                  max={2000}
                  step={10}
                />
                <div className="text-right font-semibold">₹{price}</div>
              </div>

              {/* Tax Percentage */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Percentage</label>
                <Slider
                  value={[tax]}
                  onValueChange={(val) => setTax(val[0])}
                  max={100}
                  step={1}
                />
                <div className="text-right font-semibold">{tax}%</div>
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
            </>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Price</label>
              <div className="text-right text-xl font-bold text-primary">
                ₹{price + Math.round(price * (tax / 100))}
              </div>
              <div className="text-xs text-gray-500 text-right">
                (Base: ₹{price} + Tax: ₹{Math.round(price * (tax / 100))})
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <DialogFooter className="mt-4 flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-primary text-white"
              disabled={pricingState.loading}
            >
              {pricingState.loading ? "Saving..." : "Save"}
            </Button>
          )}
          {/* Show API error message if present */}
          {pricingState.error && (
            <div className="text-red-500 text-sm mt-2">
              {pricingState.error}
            </div>
          )}
          {/* Show API response error message if present */}
          {pricingState?.error === null &&
            pricingState?.success === false &&
            pricingState?.message && (
              <div className="text-red-500 text-sm mt-2">
                {pricingState.message}
              </div>
            )}
          {/* Show success message if present */}
          {successMessage && (
            <div className="text-green-600 text-sm mt-2">{successMessage}</div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
