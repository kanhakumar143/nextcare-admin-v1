"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";
import {
  Plus,
  Pencil,
  Shield,
  ShieldOff,
  ShieldCheck,
  ShieldBan,
} from "lucide-react";
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
import { DataTable } from "@/components/common/DataTable";
import { addService, getServices, updateService } from "@/services/admin.api";
import { toast } from "sonner";
import { ORG_TENANT_ID } from "@/config/authKeys";

const postSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

// const tenant_id = "4896d272-e201-4dce-9048-f93b1e3ca49f";
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
        await addService({ tenant_id: ORG_TENANT_ID, name: data.name });
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

  const handleToggleStatus = async (service: Service, checked: boolean) => {
    try {
      await updateService({
        service_id: service.id,
        name: service.name,
        active: checked,
      });
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
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }) => (
        <div className="flex items-center  group cursor-pointer">
          <span>{row.original.name}</span>
          <Pencil
            className="w-4 h-4  cursor-pointer opacity-0 group-hover:opacity-100 transition ml-4"
            onClick={() => handleEdit(row.original)}
          />
        </div>
      ),
    },
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
      cell: ({ row }) => {
        const isActive = row.original.active;

        return (
          <div className="flex items-center cursor-pointer  group">
            <Badge
              className={
                isActive
                  ? "bg-green-500 text-white w-16"
                  : "bg-red-500 text-white w-16"
              }
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>

            {/* Shield icon only shows on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition ml-4 cursor-pointer">
              {isActive ? (
                <ShieldBan
                  className="w-5 h-4 text-red-500"
                  onClick={() => handleToggleStatus(row.original, false)}
                />
              ) : (
                <ShieldCheck
                  className="w-5 h-4 text-green-500"
                  onClick={() => handleToggleStatus(row.original, true)}
                />
              )}
            </div>
          </div>
        );
      },
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
