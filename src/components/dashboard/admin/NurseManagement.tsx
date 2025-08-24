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
  UpdateDoctorPayload,
} from "@/types/admin.types";
import {
  addPractitioner,
  getPractitionerByRole,
  updatePractitioner,
} from "@/services/admin.api";
import FormModal from "../../common/FormModal";
import { toast } from "sonner";
// import { tenantId } from "@/config/authKeys";

type ExtendedNurseData = NurseData & {
  name: string;
  id: string;
  user_id: string;
  license_details: {
    number: string;
    issued_by: string;
    expiry: string;
  };
};


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
      const res = await getPractitionerByRole("nurse");
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
      console.log(formData);
      const payload = {
        ...formData,
        role: {
          ...formData.role,
          tenantId: "4896d272-e201-4dce-9048-f93b1e3ca49f"
        }
      }
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
      const updatePayload: UpdateDoctorPayload = {
        id: nurse.id,
        user_id: nurse.user_id,
        practitioner_display_id: nurse.practitioner_display_id ?? "",
        gender: nurse.gender ?? "",
        birth_date: nurse.birth_date ?? "",
        is_active: !nurse.is_active,
        license_details: nurse.license_details,
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
