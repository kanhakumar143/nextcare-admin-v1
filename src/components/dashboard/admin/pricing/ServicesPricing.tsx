"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import PricingCard from "./common/PricingCard";
import FilterModal from "./common/FilterModal";
import AddPricingModal from "./common/AddPricingModal";
import EditPricingModal from "./common/EditPricingModal";
import DeleteConfirmationModal from "./common/DeleteConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchAllPricing, removePricing } from "@/store/slices/pricingSlice";
import { fetchServices } from "@/store/slices/servicesSlice";
import { fetchTaxRates } from "@/store/slices/taxManagementSlice";

interface PricingEntry {
  id: string;
  sub_service_id: string;
  service: string;
  subservice: string;
  price: number;
  taxRate?: number;
  taxId?: string;
  totalPrice: number;
  isActive: boolean;
  service_specialty_id?: string;
}

export default function ServicesPricing() {
  // ...existing code...
  // After all useSelector and useState calls

  // ...existing code...
  // All hooks and state declarations above

  // Build service-subservice lookup map just before pricingEntries mapping
  // Place this after all hooks and state declarations
  // ...existing code...
  // Now, after all hooks and state declarations:
  // Move this block to just before pricingEntries mapping
  const dispatch = useDispatch<AppDispatch>();
  const { items: pricingData, loading } = useSelector(
    (state: RootState) => state.pricing
  );
  const { items: subServices, loading: subServicesLoading } = useSelector(
    (state: RootState) => state.subService
  );
  const { items: services, loading: servicesLoading } = useSelector(
    (state: RootState) => state.services
  );
  const { taxRates } = useSelector((state: RootState) => state.taxManagement);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSubServiceId, setSelectedSubServiceId] = useState("");
  const [editEntry, setEditEntry] = useState<PricingEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PricingEntry | null>(null);

  // Fetch services on mount
  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchTaxRates());
  }, [dispatch]);

  // Fetch subservices when service changes
  useEffect(() => {
    if (selectedServiceId) {
      // @ts-ignore
      import("@/store/slices/subServicesSlice").then(
        ({ fetchSubServicesByServiceId }) => {
          dispatch(fetchSubServicesByServiceId(selectedServiceId));
        }
      );
    }
    setSelectedSubServiceId(""); // Reset subservice when service changes
  }, [dispatch, selectedServiceId]);

  // Fetch pricing when subservice changes
  useEffect(() => {
    if (selectedSubServiceId) {
      dispatch(fetchAllPricing(selectedSubServiceId));
    }
  }, [dispatch, selectedSubServiceId]);

  const subServiceList: { id: string; name: string }[] = (
    subServices ?? []
  ).map((sub: any) => ({
    id: sub.id,
    name: sub.name || sub.label || "Unnamed Subservice",
  }));

  const pricingEntries: PricingEntry[] = (pricingData ?? []).map(
    (entry: any) => {
      const taxObj = taxRates.find((t: any) => t.id === entry.tax_id);
      const basePrice = parseFloat(entry.base_price ?? "0");
      const taxRate =
        taxObj && typeof taxObj.rate === "number"
          ? taxObj.rate
          : Number(taxObj?.rate ?? 0);
      const subserviceObj = subServiceList.find(
        (sub) => sub.id === entry.sub_service_id
      );
      return {
        id: entry.id || entry._id || Math.random().toString(),
        sub_service_id: entry.sub_service_id,
        service: "", // Not used
        subservice: subserviceObj ? subserviceObj.name : "No Subservice",
        price: basePrice,
        taxRate,
        taxId: entry.tax_id,
        totalPrice: basePrice + basePrice * (taxRate / 100),
        isActive: entry.active ?? true,
        specialty: entry.specialty || "",
        tax: taxObj || {},
        // service_specialty_id: entry.service_specialty_id || "",
      };
    }
  );

  // Filter based on search term and selected service
  // No filtering needed, API returns pricing for selected subservice
  const filteredData = pricingEntries;

  const handleEditClick = (entry: PricingEntry) => {
    setEditEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (entry: PricingEntry) => {
    setDeleteEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteEntry) return;

    dispatch(removePricing(deleteEntry.id)).then((res: any) => {
      if (removePricing.fulfilled.match(res)) {
        dispatch(fetchAllPricing(deleteEntry.sub_service_id));
        setIsDeleteModalOpen(false);
        setDeleteEntry(null);
        if (typeof window !== "undefined") {
          // @ts-ignore
          import("sonner").then(({ toast }) =>
            toast.success("Pricing deleted successfully!")
          );
        }
      } else {
        if (typeof window !== "undefined") {
          // @ts-ignore
          import("sonner").then(({ toast }) =>
            toast.error(res.payload || "Failed to delete pricing")
          );
        }
      }
    });
  };

  // Prepare service list for filter modal
  // Removed unused serviceList for filter modal

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Healthcare Pricing
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your services and subservices with intelligent pricing
              </p>
            </div>
            <div className="flex items-center gap-3 animate-fade-in">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="hover:opacity-90 shadow-md hover:shadow-lg transition-all cursor-pointer"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subservice Dropdown Section */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-8  mb-8 animate-fade-in">
          <div className="flex flex-col w-60">
            <label className="block mb-2 font-medium">Select Service</label>
            <select
              className="w-full h-10 border rounded px-3"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={servicesLoading}
            >
              <option value="">Select Service</option>
              {services.map((srv: any) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name || srv.service_label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-60">
            <label className="block mb-2 font-medium">Select Subservice</label>
            <select
              className="w-full h-10 border rounded px-3"
              value={selectedSubServiceId}
              onChange={(e) => setSelectedSubServiceId(e.target.value)}
              disabled={subServicesLoading || !selectedServiceId}
            >
              <option value="">Select Subservice</option>
              {subServiceList.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredData.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PricingCard
                entry={{
                  id: entry.id,
                  specialty: entry.subservice,
                  price: entry.price,
                  tax: entry.taxRate ?? 0,
                  totalPrice: entry.totalPrice,
                  isActive: entry.isActive,
                }}
                onEditClick={() => handleEditClick(entry)}
                onDeleteClick={() => handleDeleteClick(entry)}
              />
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-muted-foreground text-lg">
              No pricing entries found matching your search.
            </div>
          </div>
        )}

        {/* Add Pricing Modal */}
        <AddPricingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditEntry(null);
          }}
          entry={editEntry}
          onAdd={() => {
            setIsModalOpen(false);
            setEditEntry(null);
          }}
        />

        {/* Edit Pricing Modal */}
        <EditPricingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditEntry(null);
          }}
          entry={
            editEntry
              ? {
                  ...editEntry,
                  subservice: editEntry.subservice, // ✅ keep subservice
                  tax_id: editEntry.taxId ?? "", // ✅ prefill dropdown
                  sub_service_id: editEntry.sub_service_id ?? "", // ✅ needed for PUT
                }
              : null
          }
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteEntry(null);
          }}
          onConfirm={handleConfirmDelete}
          entry={
            deleteEntry
              ? {
                  ...deleteEntry,
                  specialty: deleteEntry.subservice,
                  tax: deleteEntry.taxRate ?? 0,
                  service_specialty_id: deleteEntry.service_specialty_id ?? "",
                }
              : null
          }
          isLoading={loading}
        />
      </div>
    </div>
  );
}
