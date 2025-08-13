"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSymptom,
  fetchSymptomsByTenantId,
  openEditModal,
} from "@/store/slices/symptomsSlice";
import { getServices } from "@/services/admin.api";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import AddSymptomModal from "@/components/dashboard/admin/symptoms/modal/AddSymptomModal";
import SymptomFormModal from "@/components/dashboard/admin/symptoms/modal/EditSymptomModal"; // ✅ merged modal
import { Symptom } from "@/types/symptoms.type";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuthInfo } from "@/hooks/useAuthInfo";

export default function Symptoms() {
  const { orgId } = useAuthInfo();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.symptom);

  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getServices();
        setServices(res);
        if (res.length > 0) {
          setSelectedServiceId(res[0].id);
        }
      } catch (error) {
        toast.error("Failed to load services.");
      }
    })();
  }, []);

  useEffect(() => {
    if (orgId) {
      dispatch(fetchSymptomsByTenantId(orgId));
    }
  }, [dispatch, orgId]);

  const handleOpenEditModal = (symptom: Symptom) => {
    dispatch(openEditModal(symptom));
  };

  const columns: ColumnDef<Symptom>[] = [
    {
      accessorKey: "display",
      header: "Symptom Name",
    },
    {
      header: "Status",
      accessorFn: (row: Symptom) => row.is_active,
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge
            className={
              isActive
                ? "bg-green-500 text-white w-16"
                : "bg-red-500 text-white w-16"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditModal(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredSymptoms = selectedServiceId
    ? items.filter((symptom) => symptom.tenant_service_id === selectedServiceId)
    : items;

  const handleAddSymptom = async (
    formData: Omit<Symptom, "code" | "system" | "description">
  ) => {
    try {
      const resultAction = await dispatch(addSymptom(formData));
      if (addSymptom.fulfilled.match(resultAction)) {
        toast.success("Symptom added successfully!");
        setOpenModal(false);
        if (orgId) {
          dispatch(fetchSymptomsByTenantId(orgId));
        }
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch {
      toast.error("Something went wrong while adding the symptom.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="w-48">
          <Select
            value={selectedServiceId}
            onValueChange={(val) => setSelectedServiceId(val)}
          >
            <SelectTrigger className="w-48">
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

        <Button type="button" onClick={() => setOpenModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Symptom
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredSymptoms}
        filterColumn="display"
        externalFilterValue={filterValue}
      />

      {/* Add Symptom Modal */}
      <AddSymptomModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddSymptom}
        orgId={orgId ?? ""}
      />

      {/* Unified Edit + Toggle Modal */}
      <SymptomFormModal />
    </div>
  );
}
