"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSubService,
  fetchSubServicesByServiceId,
  openEditModal,
} from "@/store/slices/subServicesSlice";
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
import AddSubServiceModal from "./modals/AddSubServicesModal";
// import EditSubServiceModal from "./modals/EditSubServiceModal";
import { SubService, CreateSubServiceDto } from "@/types/subServices.type";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import EditSubServiceModal from "./modals/EditSubServicesModal";

export default function SubServices() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.subService);

  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // Load available services
  useEffect(() => {
    (async () => {
      try {
        const res = await getServices();
        setServices(res);
        if (res.length > 0) {
          setSelectedServiceId(res[0].id);
        }
      } catch {
        toast.error("Failed to load services.");
      }
    })();
  }, []);

  // Fetch sub-services when a service is selected
  useEffect(() => {
    if (selectedServiceId) {
      dispatch(fetchSubServicesByServiceId(selectedServiceId));
    }
  }, [dispatch, selectedServiceId]);

  const handleOpenEditModal = (subService: SubService) => {
    dispatch(openEditModal(subService));
  };

  // Table columns
  const columns: ColumnDef<SubService>[] = [
    {
      accessorKey: "name",
      header: "Sub-Service Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      header: "Status",
      accessorFn: (row: SubService) => row.active,
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

  // ✅ Add SubService handler (form sends CreateSubServiceDto, backend returns SubService)
  const handleAddSubService = async (formData: CreateSubServiceDto) => {
    // Check if sub-service already exists for the selected service
    const exists = items.some(
      (item) => item.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (exists) {
      toast.error("This sub-service already exists under the selected service.");
      return;
    }

    try {
      const resultAction = await dispatch(addSubService(formData));

      if (addSubService.fulfilled.match(resultAction)) {
        toast.success("Sub-service added successfully!");
        setOpenModal(false);
        dispatch(fetchSubServicesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch {
      toast.error("Something went wrong while adding the sub-service.");
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
          Add Sub-Service
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        filterColumn="name"
        externalFilterValue={filterValue}
      />

      <AddSubServiceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={handleAddSubService}
      />

      <EditSubServiceModal selectedServiceId={selectedServiceId} />
    </div>
  );
}
