"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  ShieldCheck,
  ShieldX,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
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
import { NurseData, UpdateDoctorPayload } from "@/types/admin.types";
import {
  addPractitioner,
  getPractitionerByRole,
  updatePractitioner,
} from "@/services/admin.api";
import FormModal from "../../common/FormModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthInfo } from "@/hooks/useAuthInfo"; 


// ---------------- Enum ----------------
enum PractitionerStatus {
  UNVERIFIED = "unverified",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  RESUBMIT_REQUIRED = "resubmit_required",
}

type ExtendedNurseData = NurseData & {
  name: string;
  id: string;
  user_id: string;
  status: PractitionerStatus;
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
  const [selectedAction, setSelectedAction] =
    useState<PractitionerStatus | null>(null);
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
  const { role } = useAuthInfo();


  useEffect(() => {
    fetchNurses();
  }, []);

  const handleAddNurse = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        role: {
          ...formData.role,
          tenantId: "4896d272-e201-4dce-9048-f93b1e3ca49f",
        },
      };
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
        status: nurse.status,
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

  const handleUpdateVerificationStatus = async (
    nurse: ExtendedNurseData,
    status: PractitionerStatus
  ) => {
    try {
      const updatePayload: UpdateDoctorPayload = {
        id: nurse.id,
        user_id: nurse.user_id,
        practitioner_display_id: nurse.practitioner_display_id ?? "",
        gender: nurse.gender ?? "",
        birth_date: nurse.birth_date ?? "",
        is_active: nurse.is_active,
        license_details: nurse.license_details,
        profile_picture_url: nurse.profile_picture_url ?? "",
        license_url: nurse.license_url ?? "",
        status,
      };

      await updatePractitioner(updatePayload);
      toast.success(`Nurse status updated to ${status}`);
      await fetchNurses();
    } catch (error) {
      console.error("Verification update failed:", error);
      toast.error("Failed to update verification status");
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
      header: "Active Status",
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
      header: "Verification Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue() as PractitionerStatus;

        switch (status) {
          case PractitionerStatus.VERIFIED:
            return <Badge className="bg-green-500 text-white">Verified</Badge>;
          case PractitionerStatus.UNDER_REVIEW:
            return (
              <Badge className="bg-blue-500 text-white">Under Review</Badge>
            );
          case PractitionerStatus.REJECTED:
            return <Badge className="bg-red-500 text-white">Rejected</Badge>;
          case PractitionerStatus.RESUBMIT_REQUIRED:
            return (
              <Badge className="bg-yellow-500 text-black">
                Resubmit Required
              </Badge>
            );
          case PractitionerStatus.UNVERIFIED:
          default:
            return <Badge className="bg-gray-500 text-white">Unverified</Badge>;
        }
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const nurse = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* Edit Button (any admin can see) */}
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setEditNurseId(nurse.id);
                setOpen(true);
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>

            {/* Activate/Deactivate (any admin can see) */}
            <Button
              variant="ghost"
              className={
                nurse.is_active
                  ? "text-red-500 hover:text-red-700"
                  : "text-green-500 hover:text-green-700"
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

            {/* Verification Dropdown → only for super-admin */}
            {role === "super_admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateVerificationStatus(
                        nurse,
                        PractitionerStatus.VERIFIED
                      )
                    }
                  >
                    Verify
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateVerificationStatus(
                        nurse,
                        PractitionerStatus.UNDER_REVIEW
                      )
                    }
                  >
                    Mark as Under Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateVerificationStatus(
                        nurse,
                        PractitionerStatus.REJECTED
                      )
                    }
                  >
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateVerificationStatus(
                        nurse,
                        PractitionerStatus.RESUBMIT_REQUIRED
                      )
                    }
                  >
                    Request Resubmission
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateVerificationStatus(
                        nurse,
                        PractitionerStatus.UNVERIFIED
                      )
                    }
                  >
                    Unverify
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  const router = useRouter();
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

      <div className="flex justify-start">
        <Button
          variant="secondary"
          onClick={() => {
            router.push(`/dashboard/super-admin`);
          }}
          className="flex items-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
    </div>
  );
}
