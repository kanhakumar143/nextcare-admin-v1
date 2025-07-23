"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";

type Service = {
  id: string;
  serviceName: string;
  department: string;
  doctor: string;
  availableDays: string;
  timings: string;
  status: string;
};

export default function Services() {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Omit<Service, "id">>({
    serviceName: "",
    department: "",
    doctor: "",
    availableDays: "",
    timings: "",
    status: "",
  });
  const [filterValue, setFilterValue] = useState("");

  // Fetch locations once
  useEffect(() => {
    axios
      .get<Service[]>("https://687f9ff2efe65e52008a6f5c.mockapi.io/Services")
      .then((res) => setServices(res.data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLocation = () => {
    axios
      .post<Service>(
        "https://687f9ff2efe65e52008a6f5c.mockapi.io/Services",
        formData
      )
      .then((res) => setServices((prev) => [...prev, res.data]))
      .catch(console.error);
    setFormData({
      serviceName: "",
      department: "",
      doctor: "",
      availableDays: "",
      timings: "",
      status: "",
    });
    setOpen(false);
  };

  const columns: ColumnDef<Service>[] = [
    { accessorKey: "serviceName", header: "Service Name" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "doctor", header: "Doctor" },
    { accessorKey: "availableDays", header: "Available Days" },
    { accessorKey: "timings", header: "Timings" },
    { accessorKey: "status", header: "Status" },
  ];

  return (  
    <div className="p-2 space-y-4">
      
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Department..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 " /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {Object.keys(formData).map((key) => (
                <Input
                  key={key}
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                />
              ))}
              <Button onClick={handleAddLocation}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={services}
        filterColumn="department"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
