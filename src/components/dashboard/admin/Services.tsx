"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";
import { Plus, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/common/DataTable";
import { addService, getServices, updateService } from "@/services/admin.api";
import { toast } from "sonner";

const postSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

const tenant_id = "4896d272-e201-4dce-9048-f93b1e3ca49f";
type PostSchema = z.infer<typeof postSchema>;

type Service = {
  id: string;
  name: string;
  availableTime: string;
  availableDays: string;
  timings: string;
  status: string;
  active: boolean;
  schedule: {
    planning_start: string;
    planning_end: string;
  };
};

export default function Services() {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [apiCallFor, setApiCallFor] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onSubmit = async (data: PostSchema) => {
    setIsSubmitting(true);
    try {
      if (apiCallFor === "add") {
        await addService({ tenant_id: tenant_id, name: data.name });
        toast.success("Service added successfully");
      } else if (apiCallFor === "edit") {
        await updateService({
          service_id: editServiceId || "",
          name: data.name,
          active: selectedService?.active,
        });
        toast.success("Service updated successfully");
      }

      await fetchServices();
      reset();
      setApiCallFor(null);
      setEditServiceId(null);
      setOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setApiCallFor("edit");
    setValue("name", service.name);
    setEditServiceId(service.id);
    setSelectedService(service);
    setOpen(true);
  };

  const handleToggleStatus = async (checked: boolean) => {
    if (!selectedService) return;
    try {
      await updateService({
        service_id: selectedService.id,
        name: selectedService.name,
        active: checked,
      });
      setSelectedService({ ...selectedService, active: checked });
      toast.success(
        checked
          ? "Service activated successfully"
          : "Service deactivated successfully"
      );
      await fetchServices();
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Status update failed");
    }
  };

  const columns: ColumnDef<Service>[] = [
    { accessorKey: "name", header: "Service Name" },
    {
      header: "Available Days",
      accessorFn: (row: any) =>
        moment(row.schedule?.planning_start).format("YYYY-MM-DD"),
    },
    {
      header: "Available Time",
      accessorFn: (row: any) => {
        const start = row.schedule?.planning_start;
        const end = row.schedule?.planning_end;
        return `${moment(start).format("hh:mm A")} - ${moment(end).format(
          "hh:mm A"
        )}`;
      },
    },
    {
      header: "Status",
      accessorFn: (row: any) => row.active,
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
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Service Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Button
          onClick={() => {
            setOpen(true);
            setApiCallFor("add");
            setSelectedService(null);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Service
        </Button>

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              reset();
              setEditServiceId(null);
              setSelectedService(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md py-4">
            <DialogHeader>
              <DialogTitle>
                {editServiceId ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input placeholder="Service Name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {editServiceId && selectedService && (
                <div className="flex items-center gap-12">
                  <span className="text-sm font-medium">Active Status</span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={selectedService.active}
                      onCheckedChange={handleToggleStatus}
                      className={
                        selectedService.active ? "bg-green-500" : "bg-red-500"
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedService.active
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedService.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? editServiceId
                    ? "Updating..."
                    : "Saving..."
                  : editServiceId
                  ? "Update Service"
                  : "Save Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={services}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
