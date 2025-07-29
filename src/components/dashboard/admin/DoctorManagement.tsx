"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Badge } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
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
import { DoctorData } from "@/types/admin.types";
import { addDoctor, getPractitionerByRole } from "@/services/admin.api";
import FormModal from "../../common/FormModal";
import { toast } from "sonner";

type ExtendedDoctorData = DoctorData & { name: string };

export default function DoctorManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [practitioners, setPractitioners] = useState<ExtendedDoctorData[]>([]);

  const fetchPractitionerByRole = async () => {
    try {
      const res = await getPractitionerByRole();
      const data = (res?.data || []).map((doc: DoctorData) => ({
        ...doc,
        name: doc.user.name,
      }));
      setPractitioners(data);
    } catch (error) {
      console.error("Failed to fetch practitioners:", error);
    }
  };

  useEffect(() => {
    fetchPractitionerByRole();
  }, []);

    const handleAddDoctor = async (formData: any) => {
      console.log(formData);
      
    try {
      await addDoctor(formData);
      await fetchPractitionerByRole(); // Refresh table
      setOpen(false); // Close modal
      // toast({ title: "Doctor added successfully." });
    } catch (error) {
      console.error("Error adding doctor:", error);
      // toast({ title: "Failed to add doctor.", variant: "destructive" });
    }
  };
  

  // const handleAddDoctor = async (formData: any) => {
  //   try {
  //     await addDoctor(formData);
  //     await fetchPractitionerByRole(); // Refresh table
  //     setOpen(false); // Close modal
  //   } catch (error) {
  //     console.error("Error adding doctor:", error);
  //     // optionally show toast here
  //   }
  // };

  const columns: ColumnDef<ExtendedDoctorData>[] = [
    {
      header: "Doctor Name",
      accessorKey: "name", // now this is top-level
      cell: ({ row }) => row.original.user.name,
    },
    {
      header: "Practitioner ID",
      accessorKey: "practitioner_display_id",
      cell: ({ row }) => row.original.practitioner_display_id ?? "N/A",
    },
    {
      header: "License Number",
      accessorKey: "license_details.number",
      cell: ({ row }) => row.original.license_details?.number ?? "N/A",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon">
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
          placeholder="Filter by Doctor Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) setEditDoctorId(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editDoctorId ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>

            <FormModal
            onSubmit1={handleAddDoctor}
              editDoctorId={editDoctorId}
              open={open}
              onOpenChange={(val) => {
                setOpen(val);
                if (!val) setEditDoctorId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={practitioners}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
