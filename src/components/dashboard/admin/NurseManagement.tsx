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
import {
  NurseData,
  UpdateNursePayload,
  AddNursePayload,
  ExtendedNurseData,
  PractitionerStatus,
} from "@/types/admin.types";
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setEditNurseData,
  clearEditNurseData,
} from "@/store/slices/adminSlice";

export default function NurseManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editNurseId, setEditNurseId] = useState<string | null>(null);
  const [formDefaults, setFormDefaults] = useState<any>({});
  const [selectedNurse, setSelectedNurse] = useState<ExtendedNurseData | null>(
    null
  );
  const [nurses, setNurses] = useState<ExtendedNurseData[]>([]);
  const { role } = useAuthInfo();
  const dispatch = useDispatch();
  const { editNurseData } = useSelector((state: RootState) => state.admin);

  // Function to transform nurse data for form
  const transformNurseDataForForm = (nurse: ExtendedNurseData) => {
    console.log(nurse);

    // Handle qualification array - use first element (index 0)
    const firstQualification =
      Array.isArray(nurse.qualification) && nurse.qualification.length > 0
        ? nurse.qualification[0]
        : nurse.qualification || {};

    return {
      tenant_id: "4896d272-e201-4dce-9048-f93b1e3ca49f",
      name: nurse.name || "",
      email: nurse.user?.email || "",
      phone: nurse.user?.phone || "",
      gender:
        (nurse.gender as "male" | "female" | "other" | "unknown") || "unknown",
      birth_date: nurse.birth_date || "",
      license_number: nurse.license_details?.number || "",
      license_issued_by: nurse.license_details?.issued_by || "",
      license_expiry: nurse.license_details?.expiry || "",
      profile_picture_url: nurse.profile_picture_url || "",
      license_url: nurse.license_url || "",
      is_active: nurse.is_active || true,
      degree: (firstQualification as any)?.degree || "",
      institution: (firstQualification as any)?.institution || "",
      graduation_year:
        (firstQualification as any)?.graduation_year ||
        (firstQualification as any)?.year ||
        "",
      specialty: "General Nursing",
      availability_days: ["mon", "tue", "wed", "thu", "fri"],
      available_times: [{ start: "09:00", end: "17:00" }],
      role_code_system:
        "http://terminology.hl7.org/CodeSystem/practitioner-role",
      role_code: "nurse",
      role_display: "Nurse",
      role_text: "Nurse",
    };
  };

  // Helper function to create a complete UpdateNursePayload from ExtendedNurseData
  const createUpdatePayloadFromNurse = (
    nurse: ExtendedNurseData,
    overrides: Partial<UpdateNursePayload> = {}
  ): UpdateNursePayload => {
    const fullName = nurse.name || nurse.user?.name || "";
    const nameParts = fullName.split(" ");
    const givenNames =
      nameParts.length > 1 ? nameParts.slice(0, -1) : [fullName];
    const familyName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    return {
      id: nurse.id,
      user_id: nurse.user_id,
      practitioner_display_id: nurse.practitioner_display_id ?? "",
      identifiers: [
        {
          system: "practitioner_id",
          value: nurse.practitioner_display_id ?? "",
        },
      ],
      name: {
        use: null,
        text: null,
        family: familyName,
        given: givenNames,
        prefix: ["Nurse"],
        suffix: null,
        period: null,
      },
      telecom: [
        {
          system: "phone",
          value: nurse.user?.phone || "",
          use: "mobile",
          rank: null,
          period: null,
        },
        {
          system: "email",
          value: nurse.user?.email || "",
          use: "work",
          rank: null,
          period: null,
        },
      ],
      gender: nurse.gender ?? "",
      birth_date: nurse.birth_date ?? "",
      qualification: [
        {
          degree: nurse.qualification?.[0]?.degree || "",
          institution: nurse.qualification?.[0]?.institution || "",
          graduation_year: nurse.qualification?.[0]?.graduation_year || "",
        },
      ],
      is_active: nurse.is_active,
      license_details: nurse.license_details || {
        number: "",
        issued_by: "",
        expiry: "",
      },
      profile_picture_url: nurse.profile_picture_url ?? "",
      license_url: nurse.license_url ?? "",
      e_sign_path: null,
      status: nurse.status,
      ...overrides,
    };
  };

  const fetchNurses = async () => {
    try {
      const res = await getPractitionerByRole("nurse");
      const data = (res?.data || []).map((nurse: NurseData) => ({
        ...nurse,
        name: nurse.user?.name,
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

  const handleUpdateNurse = async (formData: any) => {
    try {
      console.log("Form DATA ------->", formData);
      const payload: UpdateNursePayload = {
        id: editNurseData?.id || "",
        user_id: editNurseData?.user_id || "",
        practitioner_display_id: editNurseData?.practitioner_display_id || "",
        identifiers: formData.practitioner?.identifiers || [
          {
            system: "practitioner_id",
            value: editNurseData?.practitioner_display_id || "",
          },
        ],
        name: {
          use: formData.practitioner?.name?.use || null,
          text: formData.practitioner?.name?.text || null,
          family:
            formData.practitioner?.name?.family ||
            formData.user?.name?.split(" ").pop() ||
            "",
          given:
            formData.practitioner?.name?.given?.length > 0 &&
            formData.practitioner.name.given[0] !== ""
              ? formData.practitioner.name.given
              : formData.user?.name?.split(" ").slice(0, -1) || [
                  formData.user?.name || "",
                ],
          prefix: formData.practitioner?.name?.prefix || ["Nurse"],
          suffix: formData.practitioner?.name?.suffix || null,
          period: formData.practitioner?.name?.period || null,
        },
        telecom: formData.practitioner?.telecom?.map((tel: any) => ({
          system: tel.system,
          value:
            tel.system === "phone"
              ? formData.user?.phone || tel.value
              : tel.system === "email"
              ? formData.user?.email || tel.value
              : tel.value,
          use: tel.use,
          rank: tel.rank || null,
          period: tel.period || null,
        })) || [
          {
            system: "phone",
            value: formData.user?.phone || "",
            use: "mobile",
            rank: null,
            period: null,
          },
          {
            system: "email",
            value: formData.user?.email || "",
            use: "work",
            rank: null,
            period: null,
          },
        ],
        gender: formData.practitioner?.gender || "",
        birth_date: formData.practitioner?.birth_date || "",
        qualification: formData.practitioner?.qualification || [
          {
            degree: "",
            institution: "",
            graduation_year: "",
          },
        ],
        is_active: formData.practitioner?.is_active ?? true,
        license_details: formData.practitioner?.license_details || {
          number: "",
          issued_by: "",
          expiry: "",
        },
        profile_picture_url: formData.practitioner?.profile_picture_url || "",
        license_url: formData.practitioner?.license_url || "",
        e_sign_path: null,
        status: editNurseData?.status || "unverified",
      };
      console.log("Update Payload -------->", payload);
      await updatePractitioner(payload);
      await fetchNurses();
      setOpen(false);
      toast.success("Nurse updated successfully.");
    } catch (error) {
      console.error("Error updating nurse:", error);
      toast.error("Failed to update nurse.");
    }
  };

  const handleToggleStatus = async (nurse: ExtendedNurseData) => {
    try {
      const updatePayload = createUpdatePayloadFromNurse(nurse, {
        is_active: !nurse.is_active,
      });

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
      const updatePayload = createUpdatePayloadFromNurse(nurse, {
        status,
      });

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
                const nurse = row.original;
                dispatch(setEditNurseData(nurse));
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
              dispatch(clearEditNurseData());
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
                  ? selectedNurse?.is_active
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
                      selectedNurse?.is_active
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {selectedNurse?.is_active ? "deactivate" : "activate"}
                  </span>{" "}
                  the nurse{" "}
                  <span className="text-foreground font-semibold">
                    {selectedNurse?.name}
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
                      selectedNurse?.is_active ? "destructive" : "default"
                    }
                    onClick={() => handleToggleStatus(selectedNurse)}
                    className={
                      selectedNurse?.is_active
                        ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                        : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                    }
                  >
                    {selectedNurse?.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <FormModal
                role="nurse"
                onSubmit1={handleAddNurse}
                onSubmit2={handleUpdateNurse}
                editPractitionerId={editNurseId}
                open={open}
                defaultValues={
                  editNurseData
                    ? transformNurseDataForForm(editNurseData)
                    : undefined
                }
                onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) {
                    setEditNurseId(null);
                    dispatch(clearEditNurseData());
                  }
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

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditNurseId(null);
            setFormDefaults({});
          }
        }}
      >
        {/* Additional dialog placeholder for consistency with DoctorManagement */}
      </Dialog>

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
