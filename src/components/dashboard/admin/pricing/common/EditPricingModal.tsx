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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updatePricing } from "@/services/pricing.api";
import { toast } from "sonner";
import { fetchAllPricing } from "@/store/slices/pricingSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTaxRates } from "@/store/slices/taxManagementSlice";

interface PricingEntry {
  id: string;
  sub_service_id: string;
  service: string;
  subservice: string;
  price: number;
  tax_id: string;
  isActive: boolean;
}

interface EditPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: PricingEntry | null;
}

// const tenant_id =
//   process.env.NEXT_PUBLIC_TENANT_ID || "4896d272-e201-4dce-9048-f93b1e3ca49f";

export default function EditPricingModal({
  isOpen,
  onClose,
  entry,
}: EditPricingModalProps) {
  const dispatch = useAppDispatch();
  const { taxRates } = useAppSelector((state) => state.taxManagement);

  const [basePrice, setBasePrice] = useState<number>(0);
  const [selectedTaxId, setSelectedTaxId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Fetch tax rates when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchTaxRates());
    }
  }, [isOpen, dispatch]);

  // Reset and prefill form when modal opens or entry changes
  useEffect(() => {
    if (entry) {
      setBasePrice(entry.price);
      setSelectedTaxId(entry.tax_id || "");
      setIsActive(entry.isActive);
    } else {
      setBasePrice(0);
      setSelectedTaxId("");
      setIsActive(true);
    }
  }, [entry, isOpen]);

  const handleSuccess = async () => {
    if (!entry) return;

    const updateData = {
      id: entry.id,
      sub_service_id: entry.sub_service_id,
      base_price: basePrice,
      currency: "INR", // 🔧 match your system default
      tax_id: selectedTaxId,
      active: isActive,
      remark: "Updated via UI",
      changed_by: "", // 🔧 or userId if available
    };

    try {
      const response = await updatePricing(updateData);
      console.log("Pricing updated successfully:", response);
      toast.success("Pricing updated successfully");
      dispatch(fetchAllPricing(entry.sub_service_id));
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast.error("Failed to update pricing");
    }
    onClose();
  };

  const handleClose = () => {
    setBasePrice(0);
    setSelectedTaxId("");
    setIsActive(true);
    onClose();
  };

  // Compute total price
  const selectedTax = taxRates.find((t) => t.id === selectedTaxId);
  const taxPercentage = selectedTax ? Number(selectedTax.rate) : 0;
  const totalPrice = basePrice + (basePrice * taxPercentage) / 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Pricing</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {entry && (
            <div className="text-sm text-muted-foreground">
              <strong>Subservice:</strong> {entry.subservice}
            </div>
          )}

          {/* Base Price Input */}
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (₹)</Label>
            <Input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              placeholder="Enter base price"
              min="0"
              step="0.01"
            />
          </div>

          {/* Tax Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="tax">Tax</Label>
            <Select
              value={selectedTaxId}
              onValueChange={(val) => setSelectedTaxId(val)}
            >
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

          {/* Total Price */}
          <div className="space-y-2">
            <Label>Total Price</Label>
            <div className="text-lg font-semibold text-primary">
              ₹{totalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              (Base: ₹{basePrice.toFixed(2)} + Tax: ₹
              {((basePrice * taxPercentage) / 100).toFixed(2)})
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSuccess} className="bg-primary text-white">
            Update Pricing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
