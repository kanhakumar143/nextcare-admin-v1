"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSymptom,
  fetchSymptomsByTenantId,
  toggleSymptomStatus,
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
import { Pencil, Plus, ShieldCheck, ShieldX } from "lucide-react";
import AddSymptomModal from "@/components/dashboard/admin/symptoms/AddSymptomModal";
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [symptomToToggle, setSymptomToToggle] = useState<Symptom | null>(null);

  useEffect(() => {
    if (confirmModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [confirmModalOpen]);

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

   const handleToggleStatus = async (symptom: Symptom) => {
      try {
        const updatedSymptom = {
          ...symptom,
          is_active: !symptom.is_active,
        };
        const resultAction = await dispatch(
          toggleSymptomStatus({ symptom: updatedSymptom, id: symptom.id! })
        );
  
        if (toggleSymptomStatus.fulfilled.match(resultAction)) {
          toast.success("Status updated successfully!");
          dispatch(fetchSymptomsByTenantId(orgId!));
        } else {
          toast.error(resultAction.payload as string);
        }
      } catch (error) {
        toast.error("Failed to update status.");
      } finally {
        setConfirmModalOpen(false);
        setSymptomToToggle(null);
      }
    };

  const openConfirmModal = (symptom: Symptom) => {
    setSymptomToToggle(symptom);
    setConfirmModalOpen(true);
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
          <Button variant="secondary" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            className={
              row.original.is_active
                ? "text-red-500 hover:text-red-700"
                : "text-green-500 hover:text-green-700"
            }
            size="icon"
            onClick={() => openConfirmModal(row.original)}
          >
            {row.original.is_active ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <ShieldX className="w-8 h-8" />
            )}
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
        // Fix here: use orgId, not selectedServiceId
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


     <AddSymptomModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onSubmit={handleAddSymptom}
  orgId={orgId ?? ""}  // <-- Here: convert null to undefined
/>


      {confirmModalOpen && symptomToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full h-auto">
            <div className="p-4 ">
              <h2 className="text-lg font-semibold">
                {symptomToToggle.is_active ? "Deactivate" : "Activate"} Symptom?
              </h2>
            </div>

            <div className="p-4 text-sm text-muted-foreground">
              Are you sure you want to{" "}
              <span
                className={
                  symptomToToggle.is_active
                    ? "text-red-600 font-medium"
                    : "text-green-600 font-medium"
                }
              >
                {symptomToToggle.is_active ? "deactivate" : "activate"}
              </span>{" "}
              the symptom{" "}
              <span className="text-foreground font-semibold">
                {symptomToToggle.display}
              </span>
              ?
            </div>

            <div className="p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={symptomToToggle.is_active ? "destructive" : "default"}
                onClick={() => handleToggleStatus(symptomToToggle)}
                className={
                  symptomToToggle.is_active
                    ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                    : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                }
              >
                {symptomToToggle.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
