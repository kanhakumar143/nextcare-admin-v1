"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ShieldCheck, ShieldX } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { DoctorData, UpdateDoctorPayload } from "@/types/admin.types";
import {
  addDoctor,
  getPractitionerByRole,
  UpdateDoctor,
} from "@/services/admin.api";
import FormModal from "../../common/FormModal";
import { toast } from "sonner";

type ExtendedDoctorData = DoctorData & {
  name: string;
  id: string;
  user_id: string;
  license_details: string;
};

export default function DoctorManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] =
    useState<ExtendedDoctorData | null>(null);
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
    try {
      console.log(formData);
      await addDoctor(formData);
      await fetchPractitionerByRole();
      setOpen(false);
      toast.success("Doctor added successfully.");
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor.");
    }
  };

  const handleToggleStatus = async (doctor: ExtendedDoctorData) => {
    try {
      await UpdateDoctor({
        id: doctor.id,
        user_id: doctor.user_id,
        practitioner_display_id: doctor.practitioner_display_id ?? "",
        gender: doctor.gender ?? "",
        birth_date: doctor.birth_date ?? "",
        is_active: !doctor.is_active,
        license_details: doctor.license_details,
        profile_picture_url: doctor.profile_picture_url ?? "",
        license_url: doctor.license_url ?? "",
      });

      toast.success(
        `Doctor ${!doctor.is_active ? "activated" : "deactivated"} successfully`
      );
      setSelectedDoctor(null);
      setOpen(false);
      await fetchPractitionerByRole();
    } catch (error) {
      console.error("Status toggle failed:", error);
      toast.error("Failed to update doctor status");
    }
  };

  const columns: ColumnDef<ExtendedDoctorData>[] = [
    {
      header: "Doctor Name",
      accessorKey: "name",
    },
    {
      header: "Practitioner ID",
      accessorKey: "practitioner_display_id",
    },
    {
      header: "License Number",
      accessorKey: "license_details.number",
      cell: ({ row }) => row.original.license_details?.number ?? "N/A",
    },
    {
      header: "Status",
      accessorFn: (row) => row.is_active,
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
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => {}}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              className={
                doctor.is_active
                  ? " text-red-500 hover:text-red-700"
                  : " text-green-500 hover:text-green-700"
              }
              onClick={() => {
                setSelectedDoctor(doctor);
                setOpen(true);
              }}
            >
              {/* <Trash2 className="w-4 h-4" /> */}
              <div className="flex h-8 w-8 items-center justify-center">
              {doctor.is_active ? (
                <ShieldCheck className="w-8 h-8  " />
              ) : (
                <ShieldX className="w-8 h-8" />
              )}
            </div>
            </Button>
          </div>
        );
      },
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
            if (!val) {
              setEditDoctorId(null);
              setSelectedDoctor(null);
            }
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
                {selectedDoctor
                  ? selectedDoctor.is_active
                    ? "Deactivate Doctor"
                    : "Activate Doctor"
                  : editDoctorId
                  ? "Edit Doctor"
                  : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>

            {selectedDoctor ? (
              <>
                <div className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to{" "}
                  <span
                    className={
                      selectedDoctor.is_active
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {selectedDoctor.is_active ? "deactivate" : "activate"}
                  </span>{" "}
                  the doctor{" "}
                  <span className="text-foreground font-semibold">
                    {selectedDoctor.name}
                  </span>
                  ?
                </div>
                <DialogFooter className="p-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setSelectedDoctor(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={
                      selectedDoctor.is_active ? "destructive" : "default"
                    }
                    onClick={() => handleToggleStatus(selectedDoctor)}
                    className={
                      selectedDoctor.is_active
                        ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                        : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                    }
                  >
                    {selectedDoctor.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <FormModal
                onSubmit1={handleAddDoctor}
                editDoctorId={editDoctorId}
                open={open}
                onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) setEditDoctorId(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<ExtendedDoctorData>
        columns={columns}
        data={practitioners}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
