"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSpecialty,
  fetchSpecialtiesByServiceId,
  toggleSpecialtyStatus,
} from "@/store/slices/specialtySlice";
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
import AddSpecialtyModal from "@/components/dashboard/admin/specialty/AddSpecialtyModal";
import { Specialty } from "@/types/specialty.type";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Specialties() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.specialty);

  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [specialtyToToggle, setSpecialtyToToggle] = useState<Specialty | null>(
    null
  );
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
    if (selectedServiceId) {
      dispatch(fetchSpecialtiesByServiceId(selectedServiceId));
    }
  }, [dispatch, selectedServiceId]);

  const handleToggleStatus = async (specialty: Specialty) => {
    try {
      const updatedSpecialty = {
        ...specialty,
        is_active: !specialty.is_active,
      };
      const resultAction = await dispatch(
        toggleSpecialtyStatus({ specialty: updatedSpecialty, id: specialty.id })
      );

      if (toggleSpecialtyStatus.fulfilled.match(resultAction)) {
        toast.success("Status updated successfully!");
        dispatch(fetchSpecialtiesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setConfirmModalOpen(false);
      setSpecialtyToToggle(null);
    }
  };

  const openConfirmModal = (specialty: Specialty) => {
    setSpecialtyToToggle(specialty);
    setConfirmModalOpen(true);
  };

  const columns: ColumnDef<Specialty>[] = [
    {
      accessorKey: "specialty_label",
      header: "Specialty Name",
    },
    {
      header: "Status",
      accessorFn: (row: Specialty) => row.is_active,
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
            <div className="flex items-center justify-center">
              {row.original.is_active ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <ShieldX className="w-8 h-8" />
              )}
            </div>
          </Button>
        </div>
      ),
    },
  ];

  const handleAddSpecialty = async (
    formData: Omit<Specialty, "code" | "system" | "description">
  ) => {
    try {
      const resultAction = await dispatch(addSpecialty(formData));

      if (addSpecialty.fulfilled.match(resultAction)) {
        toast.success("Specialty added successfully!");
        setOpenModal(false);
        dispatch(fetchSpecialtiesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch {
      toast.error("Something went wrong while adding the specialty.");
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
          Add Specialty
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        filterColumn="specialty_label"
        externalFilterValue={filterValue}
      />

      <AddSpecialtyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddSpecialty}
      />

      {confirmModalOpen && specialtyToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-10 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full h-auto">
            <div className="p-4 ">
              <h2 className="text-lg font-semibold">
                {specialtyToToggle.is_active ? "Deactivate" : "Activate"}{" "}
                Specialty?
              </h2>
            </div>

            <div className="p-4 text-sm text-muted-foreground">
              Are you sure you want to{" "}
              <span
                className={
                  specialtyToToggle.is_active
                    ? "text-red-600 font-medium"
                    : "text-green-600 font-medium"
                }
              >
                {specialtyToToggle.is_active ? "deactivate" : "activate"}
              </span>{" "}
              the specialty{" "}
              <span className="text-foreground font-semibold">
                {specialtyToToggle.specialty_label}
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
                variant={
                  specialtyToToggle.is_active ? "destructive" : "default"
                }
                onClick={() => {
                  handleToggleStatus(specialtyToToggle);
                  setConfirmModalOpen(false);
                }}
                className={
                  specialtyToToggle.is_active
                    ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                    : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                }
              >
                {specialtyToToggle.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
