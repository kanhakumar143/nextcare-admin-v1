"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";
import { Plus } from "lucide-react";
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
import { addService, getServices } from "@/services/admin.api";
import { AddServicePayload } from "@/types/admin.types";

const postSchema = z.object({
  // tenant_id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
});
const tenant_id = "fdff6c62-2ed2-4a32-afcd-276dbbb7ba8f";
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

interface ServicesProps {
  onServiceAdded?: () => void;
}

export default function Services({ onServiceAdded }: ServicesProps) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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
    await addService(payload);
    await fetchServices();
    if (onServiceAdded) onServiceAdded();
    reset();
    setOpen(false);
  } catch (error) {
    console.error("Failed to add service:", error);
  } finally { 
    setIsSubmitting(false);
  }
};

  const columns: ColumnDef<Service>[] = [
    { accessorKey: "name", header: "Service Name" },
    {
      header: "Available Days",
      accessorFn: (row: any) => {
        const date = row.schedule?.planning_start;
        return moment(date).format("YYYY-MM-DD");
      },
    },
    {
      header: "Available Time",
      accessorFn: (row: any) => {
        const start = row.schedule?.planning_start;
        const end = row.schedule?.planning_end;
        return `${moment(start).format("hh:mm A")} - ${moment(end).format("hh:mm A")}`;
      },
    },
    {
      header: "Status",
      accessorFn: (row: any) => row.active,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const label = status === "true" ? "Inactive" : "Active";
        // const color = status === "true"
        //   ? "bg-red-100 text-red-800"
        //   : "bg-green-100 text-green-800";

        return <Badge>{label}</Badge>;
      },
    },
  ];

  return (
    <div className="p-2 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Service Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* <div>
                <Input
                  placeholder="Tenant ID"
                  {...register("tenant_id")}
                />
                {errors.tenant_id && (
                  <p className="text-sm text-red-600">{errors.tenant_id.message}</p>
                )}
              </div> */}
              <div>
                <Input
                  placeholder="Service Name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Service"}
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
