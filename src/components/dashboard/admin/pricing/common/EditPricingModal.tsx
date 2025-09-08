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
import { updatePricing } from "@/services/pricing.api";
import { toast } from "sonner";
import { fetchAllPricing } from "@/store/slices/pricingSlice";
import { useAppDispatch } from "@/store/hooks";

interface PricingEntry {
  id: string;
  service_specialty_id: string;
  service: string;
  specialty: string;
  price: number;
  tax: number;
  totalPrice: number;
  isActive: boolean;
}

interface EditPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: PricingEntry | null;
}

const tenant_id =
  process.env.NEXT_PUBLIC_TENANT_ID || "4896d272-e201-4dce-9048-f93b1e3ca49f";

export default function EditPricingModal({
  isOpen,
  onClose,
  entry,
}: EditPricingModalProps) {
  const dispatch = useAppDispatch();
  const [basePrice, setBasePrice] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);

  // Reset and prefill form when modal opens or entry changes
  useEffect(() => {
    if (entry) {
      setBasePrice(entry.price);
      setTaxPercentage(entry.tax);
    } else {
      setBasePrice(0);
      setTaxPercentage(0);
    }
  }, [entry, isOpen]);

  const handleSuccess = async () => {
    if (!entry) return;

    const updateData = {
      id: entry.id,
      tenant_id: tenant_id,
      base_price: basePrice,
      tax_percentage: taxPercentage,
      currency: "INRs",
      remark: "Update",
    };
    try {
      const response = await updatePricing(updateData);
      console.log("Pricing updated successfully:", response);
      toast.success("Pricing updated successfully");
      dispatch(fetchAllPricing(tenant_id));
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast.error("Failed to update pricing");
    }
    console.log(updateData);
    onClose();
  };

  const handleClose = () => {
    setBasePrice(0);
    setTaxPercentage(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Pricing</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Service and Specialty Info */}
          {entry && (
            <div className="space-y-2">
              {/* <div className="text-sm text-muted-foreground">
                <strong>Service:</strong> {entry.service}
              </div> */}
              <div className="text-sm text-muted-foreground">
                <strong>Specialty:</strong> {entry.specialty}
              </div>
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

          {/* Tax Percentage Input */}
          <div className="space-y-2">
            <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
            <Input
              id="taxPercentage"
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(Number(e.target.value))}
              placeholder="Enter tax percentage"
              max="100"
            />
          </div>

          {/* Total Price Display */}
          <div className="space-y-2">
            <Label>Total Price</Label>
            <div className="text-lg font-semibold text-primary">
              ₹{(basePrice + (basePrice * taxPercentage) / 100).toFixed(2)}
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
