"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, ShieldCheck, ShieldX } from "lucide-react";
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
import {
  NurseData,
  UpdateNursePayload,
  AddNursePayload,
} from "@/types/admin.types"; // ✅ Create a similar type as DoctorData
import {
  addPractitioner,
  getPractitionerByRole,
  updatePractitioner,
} from "@/services/admin.api"; // ✅ Ensure these exist in API
import FormModal from "../../common/FormModal";
import { toast } from "sonner";

type ExtendedNurseData = NurseData & {
  name: string;
  id: string;
  user_id: string;
  license_details: string;
};

// ✅ helper: flat form → API shape for adding new nurse
function mapFormToAddNursePayload(formData: any): AddNursePayload {
  return {
    user: {
      tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
      name: formData.name,
      email: formData.email,
      user_role: "nurse",
      phone: formData.phone,
    },
    practitioner: {
      identifiers: [
        {
          system: "practitioner_id",
          value: formData.practitioner_display_id || "",
        },
      ],
      name: {
        given: [formData.name],
        family: "",
      },
      gender: formData.gender,
      birth_date: formData.birth_date,
      qualification: [
        {
          degree: formData.degree,
          institution: formData.institution,
          year: formData.graduation_year,
        },
      ],
      license_details: {
        number: formData.license_number,
        issued_by: formData.license_issued_by,
        expiry: formData.license_expiry,
      },
      profile_picture_url: formData.profile_picture_url,
      license_url: formData.license_url,
      is_active: formData.is_active ?? true,
    },
    role: {
      tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
      code: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
              code: "nurse",
              display: "Nurse",
            },
          ],
          text: "Nurse",
        },
      ],
      specialty: [
        {
          text: formData.specialty || "General Nursing",
        },
      ],
      location: [],
      healthcare_service: [],
      period: {
        start: new Date().toISOString(),
        end: "",
      },
      availability: [],
      not_available: [],
    },
  };
}

export default function NurseManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editNurseId, setEditNurseId] = useState<string | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<ExtendedNurseData | null>(
    null
  );
  const [nurses, setNurses] = useState<ExtendedNurseData[]>([]);

  const fetchNurses = async () => {
    try {
      const res = await getPractitionerByRole("nurse"); // ✅ fetch only nurses
      const data = (res?.data || []).map((nurse: NurseData) => ({
        ...nurse,
        name: nurse.user.name,
      }));
      setNurses(data);
    } catch (error) {
      console.error("Failed to fetch nurses:", error);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleAddNurse = async (formData: any) => {
    try {
      const payload = mapFormToAddNursePayload(formData);
      await addPractitioner(payload);
      await fetchNurses();
      setOpen(false);
      toast.success("Nurse added successfully.");
    } catch (error) {
      console.error("Error adding nurse:", error);
      toast.error("Failed to add nurse.");
    }
  };

  const handleToggleStatus = async (nurse: ExtendedNurseData) => {
    try {
      const updatePayload = {
        id: nurse.id,
        user_id: nurse.user_id,
        practitioner_display_id: nurse.practitioner_display_id ?? "",
        gender: nurse.gender ?? "",
        birth_date: nurse.birth_date ?? "",
        is_active: !nurse.is_active,
        license_details:
          typeof nurse.license_details === "string"
            ? nurse.license_details
            : JSON.stringify(nurse.license_details),
        profile_picture_url: nurse.profile_picture_url ?? "",
        license_url: nurse.license_url ?? "",
      };

      await updatePractitioner(updatePayload);

      toast.success(
        `Nurse ${!nurse.is_active ? "activated" : "deactivated"} successfully`
      );
      setSelectedNurse(null);
      setOpen(false);
      await fetchNurses();
    } catch (error) {
      console.error("Status toggle failed:", error);
      toast.error("Failed to update nurse status");
    }
  };

  const columns: ColumnDef<ExtendedNurseData>[] = [
    {
      header: "Nurse Name",
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
        const nurse = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => {}}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              className={
                nurse.is_active
                  ? " text-red-500 hover:text-red-700"
                  : " text-green-500 hover:text-green-700"
              }
              onClick={() => {
                setSelectedNurse(nurse);
                setOpen(true);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {nurse.is_active ? (
                  <ShieldCheck className="w-8 h-8" />
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
          placeholder="Filter by Nurse Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditNurseId(null);
              setSelectedNurse(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Nurse
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedNurse
                  ? selectedNurse.is_active
                    ? "Deactivate Nurse"
                    : "Activate Nurse"
                  : editNurseId
                  ? "Edit Nurse"
                  : "Add New Nurse"}
              </DialogTitle>
            </DialogHeader>

            {selectedNurse ? (
              <>
                <div className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to{" "}
                  <span
                    className={
                      selectedNurse.is_active
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {selectedNurse.is_active ? "deactivate" : "activate"}
                  </span>{" "}
                  the nurse{" "}
                  <span className="text-foreground font-semibold">
                    {selectedNurse.name}
                  </span>
                  ?
                </div>
                <DialogFooter className="p-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setSelectedNurse(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={
                      selectedNurse.is_active ? "destructive" : "default"
                    }
                    onClick={() => handleToggleStatus(selectedNurse)}
                    className={
                      selectedNurse.is_active
                        ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                        : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                    }
                  >
                    {selectedNurse.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <FormModal
                role="nurse"
                onSubmit1={handleAddNurse}
                editPractitionerId={editNurseId}
                open={open}
                onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) setEditNurseId(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<ExtendedNurseData>
        columns={columns}
        data={nurses}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
