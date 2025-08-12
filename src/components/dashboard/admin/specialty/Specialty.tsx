"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSpecialty,
  fetchSpecialtiesByServiceId,
  openEditModal,
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
import { Pencil, Plus } from "lucide-react";
import AddSpecialtyModal from "@/components/dashboard/admin/specialty/modal/AddSpecialtyModal";
import EditSpecialtyModal from "@/components/dashboard/admin/specialty/modal/EditSpecialtyModal";
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

  const handleOpenEditModal = (specialty: Specialty) => {
    dispatch(openEditModal(specialty));
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
          <Button
            variant="ghost"
            size="icon"
            // className={
            //   row.original.is_active
            //     ? "text-green-500 hover:text-green-700"
            //     : "text-red-500 hover:text-red-700"
            // }
            onClick={() => handleOpenEditModal(row.original)}
          >
            <Pencil className="w-4 h-4" />
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

      <EditSpecialtyModal selectedServiceId={selectedServiceId} />
    </div>
  );
}
