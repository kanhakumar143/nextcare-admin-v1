"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";
import { Plus, Trash2, Pencil, ShieldCheck, ShieldX } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import { addService, getServices, updateService } from "@/services/admin.api";
import { AddServicePayload } from "@/types/admin.types";
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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setApiCallFor("edit");
    setValue("name", service.name);
    setEditServiceId(service.id);
    setOpen(true);
    toast.success("Service edit successfully");
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedService) return;
    try {
      await updateService({
        service_id: selectedService.id,
        name: selectedService.name,
        active: !selectedService.active,
      });
      await fetchServices();
      toast.success("Service status updated successfully");
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Service status update failed");
    } finally {
      setStatusDialogOpen(false);
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
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            className={
              row.original.active
                ? "  text-red-500 hover:text-red-700"
                : "  text-green-500 hover:text-green-700"
            }
            size="icon"
            onClick={() => {
              setSelectedService(row.original);
              setStatusDialogOpen(true);
            }}
          >
            {/* <Trash2 className="w-4 h-4" /> */}
            <div className="flex  items-center justify-center">
              {row.original.active ? (
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

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md w-full h-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedService?.active ? "Deactivate" : "Activate"} Service?
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to{" "}
            <span
              className={
                selectedService?.active
                  ? "text-red-600 font-medium"
                  : "text-green-600 font-medium"
              }
            >
              {selectedService?.active ? "deactivate" : "activate"}
            </span>{" "}
            the service{" "}
            <span className="text-foreground font-semibold">
              {selectedService?.name}
            </span>
            ?
          </div>

          <DialogFooter className="p-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedService?.active ? "destructive" : "default"}
              onClick={handleConfirmStatusChange}
              className={
                selectedService?.active
                  ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                  : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
              }
            >
              {selectedService?.active ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={services}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
