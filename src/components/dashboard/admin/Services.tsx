"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";
import { Plus, Trash2, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import {
  addService,
  getServices,
  deleteService,
  updateService,
} from "@/services/admin.api";
import { AddServicePayload } from "@/types/admin.types";

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
  active: string;
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
      const payload: AddServicePayload = {
        tenant_id,
        name: data.name,
      };

      if (editServiceId) {
        await updateService(editServiceId, payload);
      } else {
        await addService(payload);
      }

      await fetchServices();
      reset();
      setEditServiceId(null);
      setOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditServiceId(service.id);
    setValue("name", service.name);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      await fetchServices();
    } catch (error) {
      console.error("Delete failed:", error);
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
        const status = getValue() as string;
        const label = status === "true" ? "Inactive" : "Active";
        return <Badge>{label}</Badge>;
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
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
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
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Service
            </Button>
          </DialogTrigger>
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
