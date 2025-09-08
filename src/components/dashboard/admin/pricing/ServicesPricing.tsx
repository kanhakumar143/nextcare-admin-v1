"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import PricingCard from "./common/PricingCard"
import AddPricingModal from "./common/AddPricingModal"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store"
import { fetchAllPricing, putPricing, removePricing } from "@/store/slices/pricingSlice"
import { fetchServices } from "@/store/slices/servicesSlice"

interface PricingEntry {
  id: string
  service_specialty_id: string
  service: string
  specialty: string
  price: number
  tax: number
  totalPrice: number
   isActive: boolean;
}

const tenant_id = process.env.NEXT_PUBLIC_TENANT_ID || "4896d272-e201-4dce-9048-f93b1e3ca49f"

export default function ServicesPricing() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: pricingData, loading, error } = useSelector((state: RootState) => state.pricing)
  const { items: services } = useSelector((state: RootState) => state.services)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editEntry, setEditEntry] = useState<PricingEntry | null>(null)

  useEffect(() => {
    dispatch(fetchAllPricing(tenant_id))
    dispatch(fetchServices())
  }, [dispatch])

  // Build service-specialty lookup map
  const serviceSpecialtyMap: Record<string, { service: string; specialty: string }> = {}
  services.forEach((srv: any) => {
    if (srv.specialties && Array.isArray(srv.specialties)) {
      srv.specialties.forEach((sp: any) => {
        serviceSpecialtyMap[sp.id] = {
          service: srv.name || srv.service_label || "",
          specialty: sp.specialty_label || sp.display || sp.name || "",
        }
      })
    }
  })

  // Map PricingResponse to PricingEntry
  const pricingEntries: PricingEntry[] = (pricingData ?? []).map((entry: any) => {
    const mapping = serviceSpecialtyMap[entry.service_specialty_id] || {};
    return {
      id: entry.id || entry._id || Math.random().toString(),
      service_specialty_id: entry.service_specialty_id,
      service: mapping.service || "No Service",
      specialty: entry.service_specialty?.display || mapping.specialty || "No Specialty",
      price: entry.base_price ?? entry.price ?? 0,
      tax: entry.tax_percentage ?? entry.tax ?? 0,
      totalPrice:
        (entry.base_price ?? entry.price ?? 0) +
        Math.round((entry.base_price ?? entry.price ?? 0) * ((entry.tax_percentage ?? entry.tax ?? 0) / 100)),
      isActive: entry.service_specialty?.is_active ?? true,
    };
  });

  // Filter based on search term
  const filteredData = pricingEntries.filter((entry: PricingEntry) => {
    return (
      entry.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleEditClick = (entry: PricingEntry) => {
    setEditEntry(entry)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing?")) return;
    dispatch(removePricing(id)).then((res: any) => {
      if (removePricing.fulfilled.match(res)) {
        dispatch(fetchAllPricing(tenant_id));
        if (typeof window !== 'undefined') {
          // @ts-ignore
          import('sonner').then(({ toast }) => toast.success('Pricing deleted successfully!'));
        }
      } else {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          import('sonner').then(({ toast }) => toast.error(res.payload || 'Failed to delete pricing'));
        }
      }
    });
  }

  const handleSavePricing = (newEntry: Omit<PricingEntry, "id" | "totalPrice">) => {
    if (editEntry) {
      // Edit flow
      dispatch(
        putPricing({
          id: editEntry.id,
          payload: {
            ...newEntry,
            tenant_id: tenant_id,
            service_specialty_id: editEntry.service_specialty_id,
            base_price: newEntry.price,
            tax_percentage: newEntry.tax,
            currency: "INR",
            remark: "Standard consultation fee",
          },
        })
      )
      setEditEntry(null)
    } else {
      // Add flow handled in AddPricingModal
    }
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-foreground mb-2">Healthcare Pricing</h1>
              <p className="text-muted-foreground text-lg">
                Manage your services and specialties with intelligent pricing
              </p>
            </div>
            <div className="flex items-center gap-3 animate-fade-in">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PricingCard
                entry={entry}
                onEditClick={() => handleEditClick(entry)}
                onDeleteClick={() => handleDeleteClick(entry.id)}
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
      </div>

      {/* Add Pricing Modal */}
      <AddPricingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditEntry(null)
        }}
        onAdd={handleSavePricing}
        entry={editEntry}
      />
    </div>
  )
}
