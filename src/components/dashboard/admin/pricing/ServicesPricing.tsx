"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import PricingCard from "./common/PricingCard";
import AddPricingModal from "./common/AddPricingModal";
import EditPricingModal from "./common/EditPricingModal";
import DeleteConfirmationModal from "./common/DeleteConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchServices } from "@/store/slices/servicesSlice";
import { fetchTaxRates } from "@/store/slices/taxManagementSlice";
import {
  removePricing,
  searchSubServicePricing,
  resetPricingState,
} from "@/store/slices/pricingSlice";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PricingResponse } from "@/types/pricing.types";
import { useDebounce } from "@/hooks/useDebounce";

interface TaxRate {
  id: string;
  rate: string | number;
}

interface Service {
  id: string;
  name: string;
  sub_services?: SubService[];
}

interface SubService {
  id: string;
  name: string;
  pricings?: PricingResponse[];
}

interface PricingEntry {
  id: string;
  sub_service_id: string;
  service: { id: string; name: string };
  subservice: { id: string; name: string };
  price: number;
  taxRate: number;
  taxId?: string;
  totalPrice: number;
  isActive: boolean;
}

interface SubServiceWithPricing {
  id: string;
  name: string;
  pricings: PricingEntry[];
}

export default function ServicesPricing() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: services, loading: servicesLoading } = useSelector(
    (state: RootState) => state.services
  );
  const { taxRates } = useSelector((state: RootState) => state.taxManagement);
  const { loading, searchLoading, error } = useSelector(
    (state: RootState) => state.pricing
  );

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PricingEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PricingEntry | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch services & tax rates
  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchTaxRates());
  }, [dispatch]);

  // Handle search
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 1) {
      setIsSearchMode(true);
      dispatch(searchSubServicePricing(debouncedSearchQuery));
    } else {
      setIsSearchMode(false);
      dispatch(resetPricingState());
    }
  }, [debouncedSearchQuery, dispatch]);

  // Show error toast if search fails
  useEffect(() => {
    if (error && isSearchMode && typeof window !== "undefined") {
      import("sonner").then(({ toast }) => toast.error(error));
    }
  }, [error, isSearchMode]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchMode(false);
    dispatch(resetPricingState());
  }, [dispatch]);

  // Handle service selection
  const handleServiceSelect = (val: string) => {
    setSelectedServiceId(val);
    setIsSearchMode(false);
    setSearchQuery("");
    dispatch(resetPricingState());
  };

  // Selected service
  const selectedService = services.find(
    (srv: Service) => srv.id === selectedServiceId
  );

  const subServiceWithPricing = useMemo(() => {
    if (isSearchMode) return [];

    return (
      selectedService?.sub_services?.map((sub: SubService) => {
        const pricings: PricingEntry[] =
          (sub.pricings ?? []).map((entry: PricingResponse) => {
            const taxObj = taxRates.find((t: TaxRate) => t.id === entry.tax_id);
            const basePrice = parseFloat(entry.base_price ?? "0");
            const taxRate = Number(taxObj?.rate ?? 0);

            return {
              id: entry.id,
              sub_service_id: sub.id,
              service: {
                id: selectedService?.id ?? "",
                name: selectedService?.name ?? "",
              },
              subservice: { id: sub.id, name: sub.name },
              price: basePrice,
              taxRate,
              taxId: entry.tax_id,
              totalPrice: basePrice + basePrice * (taxRate / 100),
              isActive: entry.active ?? true,
            };
          }) ?? [];

        return {
          id: sub.id,
          name: sub.name,
          pricings,
        };
      }) ?? []
    );
  }, [selectedService, taxRates, isSearchMode]);

  const searchResultsWithPricing = useMemo(() => {
    if (!isSearchMode) return [];

    const query = debouncedSearchQuery.toLowerCase();

    return services
      .map((service) => {
        const matchedSubs = (service.sub_services || [])
          .filter(
            (sub: SubService) =>
              sub.name.toLowerCase().includes(query) ||
              service.name.toLowerCase().includes(query)
          )
          .map((sub: SubService) => {
            const pricings: PricingEntry[] =
              (sub.pricings ?? []).map((entry: PricingResponse) => {
                const taxObj = taxRates.find(
                  (t: TaxRate) => t.id === entry.tax_id
                );
                const basePrice = parseFloat(entry.base_price ?? "0");
                const taxRate = Number(taxObj?.rate ?? 0);

                return {
                  id: entry.id,
                  sub_service_id: sub.id,
                  service: { id: service.id, name: service.name },
                  subservice: { id: sub.id, name: sub.name },
                  price: basePrice,
                  taxRate,
                  taxId: entry.tax_id,
                  totalPrice: basePrice + basePrice * (taxRate / 100),
                  isActive: entry.active ?? true,
                };
              }) ?? [];

            return {
              id: sub.id,
              name: sub.name,
              pricings,
            };
          });

        return matchedSubs;
      })
      .flat();
  }, [services, taxRates, isSearchMode, debouncedSearchQuery]);

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
        setIsDeleteModalOpen(false);
        setDeleteEntry(null);
        if (typeof window !== "undefined") {
          import("sonner").then(({ toast }) =>
            toast.success("Pricing deleted successfully!")
          );
          dispatch(fetchServices());
          if (isSearchMode && debouncedSearchQuery.trim().length >= 2) {
            dispatch(searchSubServicePricing(debouncedSearchQuery));
          }
        }
      } else {
        if (typeof window !== "undefined") {
          import("sonner").then(({ toast }) =>
            toast.error(res.payload || "Failed to delete pricing")
          );
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Healthcare Pricing
              </h1>
              <p className="text-muted-foreground text-md">
                Manage your services and sub-services with intelligent pricing
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

      {/* Search & Service Selection */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-fade-in">
          {/* Search Input */}
          <div className=" max-w-md">
            <label className="block mb-2 font-medium">Search Pricing</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by service, subservice, or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchLoading && (
              <p className="text-sm text-muted-foreground mt-1">Searching...</p>
            )}
          </div>

          {/* Service Dropdown */}
          {!isSearchMode && (
            <div className=" w-3xs">
              <label className="block mb-2 font-medium">Select Service</label>
              <Select
                value={selectedServiceId}
                onValueChange={handleServiceSelect}
                disabled={servicesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((srv: Service) => (
                    <SelectItem key={srv.id} value={srv.id}>
                      {srv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* SEARCH RESULTS */}
        {isSearchMode && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Search Results ({searchResultsWithPricing.length})
              </h2>
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="hover:bg-muted"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
            </div>

            {searchResultsWithPricing.length === 0 && !searchLoading && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse by service category
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* With pricing */}
              {searchResultsWithPricing
                .filter((sub) => sub.pricings.length > 0)
                .map((sub: SubServiceWithPricing) =>
                  sub.pricings.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PricingCard
                        entry={{
                          id: entry.id,
                          subService: entry.subservice.name,
                          price: entry.price,
                          tax: entry.taxRate ?? 0,
                          totalPrice: entry.totalPrice,
                          isActive: entry.isActive,
                        }}
                        onEditClick={() => handleEditClick(entry)}
                        onDeleteClick={() => handleDeleteClick(entry)}
                        showServiceName={true}
                      />
                    </div>
                  ))
                )}

              {/* Without pricing */}
              {searchResultsWithPricing
                .filter((sub) => sub.pricings.length === 0)
                .map((sub: SubServiceWithPricing) => (
                  <div
                    key={sub.id}
                    className="group border rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center h-full transition-all hover:shadow-lg"
                  >
                    <h3 className="text-lg font-semibold mb-3">{sub.name}</h3>
                    <p className="text-muted-foreground mb-4">
                      Pricing not added yet
                    </p>
                    <Button
                      onClick={() => {
                        setEditEntry({
                          id: "",
                          sub_service_id: sub.id,
                          service: {
                            id:
                              services.find((s) =>
                                s.sub_services?.some(
                                  (ss: SubService) => ss.id === sub.id
                                )
                              )?.id ?? "",
                            name:
                              services.find((s) =>
                                s.sub_services?.some(
                                  (ss: SubService) => ss.id === sub.id
                                )
                              )?.name ?? "",
                          },
                          subservice: { id: sub.id, name: sub.name },
                          price: 0,
                          taxRate: 0,
                          taxId: "",
                          totalPrice: 0,
                          isActive: true,
                        });
                        setIsModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 shadow-md transition-opacity duration-300 cursor-pointer"
                      size="sm"
                    >
                      <Plus className="w-5 h-5" />
                      Add Pricing
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* NORMAL VIEW */}
        {!isSearchMode && selectedServiceId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* With pricing */}
            {subServiceWithPricing
              .filter((sub: SubServiceWithPricing) => sub.pricings.length > 0)
              .map((sub: SubServiceWithPricing) =>
                sub.pricings.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PricingCard
                      entry={{
                        id: entry.id,
                        subService: entry.subservice.name,
                        price: entry.price,
                        tax: entry.taxRate ?? 0,
                        totalPrice: entry.totalPrice,
                        isActive: entry.isActive,
                      }}
                      onEditClick={() => handleEditClick(entry)}
                      onDeleteClick={() => handleDeleteClick(entry)}
                    />
                  </div>
                ))
              )}

            {/* Without pricing */}
            {subServiceWithPricing
              .filter((sub: SubServiceWithPricing) => sub.pricings.length === 0)
              .map((sub: SubServiceWithPricing) => (
                <div
                  key={sub.id}
                  className="group border rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center h-full transition-all hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold mb-3">{sub.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    Pricing not added yet
                  </p>
                  <Button
                    onClick={() => {
                      setEditEntry({
                        id: "",
                        sub_service_id: sub.id,
                        service: {
                          id: selectedService?.id ?? "",
                          name: selectedService?.name ?? "",
                        },
                        subservice: { id: sub.id, name: sub.name },
                        price: 0,
                        taxRate: 0,
                        taxId: "",
                        totalPrice: 0,
                        isActive: true,
                      });
                      setIsModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 shadow-md transition-opacity duration-300 cursor-pointer"
                    size="sm"
                  >
                    <Plus className="w-5 h-5" />
                    Add Pricing
                  </Button>
                </div>
              ))}
          </div>
        )}

        {/* MODALS */}
        <AddPricingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditEntry(null);
            dispatch(resetPricingState());
          }}
          entry={editEntry}
          onAdd={() => {
            setIsModalOpen(false);
            setEditEntry(null);
            dispatch(resetPricingState());
          }}
        />
        <EditPricingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditEntry(null);
            dispatch(resetPricingState());
          }}
          entry={
            editEntry
              ? {
                  ...editEntry,
                  service: editEntry.service.name,
                  subservice: editEntry.subservice.name,
                  tax_id: editEntry.taxId ?? "",
                  sub_service_id: editEntry.sub_service_id,
                }
              : null
          }
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteEntry(null);
            dispatch(resetPricingState());
          }}
          onConfirm={handleConfirmDelete}
          entry={deleteEntry}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
