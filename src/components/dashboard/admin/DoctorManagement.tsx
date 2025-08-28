"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  ShieldCheck,
  ShieldX,
  MoveLeft,
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
  DoctorData,
  UpdateDoctorPayload,
  AddDoctorPayload,
} from "@/types/admin.types";
import {
  addPractitioner,
  getPractitionerByRole,
  updatePractitioner,
} from "@/services/admin.api";
import { toast } from "sonner";
import FormModal from "@/components/common/FormModal";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthInfo } from "@/hooks/useAuthInfo"; 


enum PractitionerStatus {
  UNVERIFIED = "unverified",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  RESUBMIT_REQUIRED = "resubmit_required",
}

type ExtendedDoctorData = DoctorData & {
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

// ✅ helper: doctor → flat form defaults
// function mapDoctorToFormDefaults(doctor: ExtendedDoctorData) {
//   return {
//     tenant_id: "4896d272-e201-4dce-9048-f93b1e3ca49f",
//     name: doctor.name ?? "",
//     email: doctor.user?.email ?? "",
//     phone: doctor.user?.phone ?? "",
//     license_number: doctor.license_details?.number ?? "",
//     license_issued_by: doctor.license_details?.issued_by ?? "",
//     license_expiry: doctor.license_details?.expiry ?? "",
//     is_active: doctor.is_active ?? true,
//     gender: doctor.gender ?? "",
//     birth_date: doctor.birth_date ?? "",
//     profile_picture_url: doctor.profile_picture_url ?? "",
//     license_url: doctor.license_url ?? "",
//     degree: doctor.qualification?.[0]?.degree ?? "",
//     institution: doctor.qualification?.[0]?.institution ?? "",
//     graduation_year: doctor.qualification?.[0]?.year ?? "",
//   };
// }

// ✅ helper: flat form → API shape for adding
// function mapFormToAddDoctorPayload(formData: any): AddDoctorPayload {
//   return {
//     user: {
//       tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
//       name: formData.name,
//       email: formData.email,
//       user_role: "doctor",
//       phone: formData.phone,
//     },
//     practitioner: {
//       identifiers: [
//         {
//           system: "practitioner_id",
//           value: formData.practitioner_display_id || "",
//         },
//       ],
//       name: {
//         given: [formData.name],
//         family: "",
//       },
//       gender: formData.gender,
//       birth_date: formData.birth_date,
//       qualification: [
//         {
//           degree: formData.degree,
//           institution: formData.institution,
//           year: formData.graduation_year,
//         },
//       ],
//       license_details: {
//         number: formData.license_number,
//         issued_by: formData.license_issued_by,
//         expiry: formData.license_expiry,
//       },
//       profile_picture_url: formData.profile_picture_url,
//       license_url: formData.license_url,
//       is_active: formData.is_active ?? true,
//     },
//     role: {
//       tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
//       code: [
//         {
//           coding: [
//             {
//               system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
//               code: "doctor",
//               display: "Doctor",
//             },
//           ],
//           text: "Doctor",
//         },
//       ],
//       specialty: [
//         {
//           text: formData.specialty || "General Practice",
//         },
//       ],
//       location: [],
//       healthcare_service: [],
//       period: {
//         start: new Date().toISOString(),
//         end: "",
//       },
//       availability: [],
//       not_available: [],
//     },
//   };
// }

// ✅ helper: flat form → API shape
// function mapFormToDoctorPayload(
//   formData: any,
//   id?: string,
//   user_id?: string
// ): UpdateDoctorPayload {
//   return {
//     id: id ?? "",
//     user_id: user_id ?? "",
//     practitioner_display_id: formData.practitioner_display_id,
//     gender: formData.gender,
//     birth_date: formData.birth_date,
//     is_active: formData.is_active,
//     profile_picture_url: formData.profile_picture_url,
//     license_url: formData.license_url,
//     license_details: {
//       number: formData.license_number,
//       issued_by: formData.license_issued_by,
//       expiry: formData.license_expiry,
//     },
//     qualification: [
//       {
//         degree: formData.degree,
//         institution: formData.institution,
//         graduation_year: formData.graduation_year,
//       },
//     ],
//   };
// }

export default function DoctorManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [formDefaults, setFormDefaults] = useState<any>({});
  const [selectedDoctor, setSelectedDoctor] =
    useState<ExtendedDoctorData | null>(null);
  const [doctors, setDoctors] = useState<ExtendedDoctorData[]>([]);
  const { role } = useAuthInfo();

  const fetchDoctors = async () => {
    try {
      const res = await getPractitionerByRole("doctor");
      const data = (res?.data || []).map((doc: DoctorData) => ({
        ...doc,
        name: doc.user?.name,
      }));
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch practitioners:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (formData: any) => {
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
      await fetchDoctors();
      setOpen(false);
      toast.success("Doctor added successfully.");
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor.");
    }
  };

  const handleToggleStatus = async (doctor: ExtendedDoctorData) => {
    try {
      const updatePayload: UpdateDoctorPayload = {
        id: doctor.id,
        user_id: doctor.user_id,
        practitioner_display_id: doctor.practitioner_display_id ?? "",
        gender: doctor.gender ?? "",
        birth_date: doctor.birth_date ?? "",
        is_active: !doctor.is_active,
        license_details: doctor.license_details,
        profile_picture_url: doctor.profile_picture_url ?? "",
        license_url: doctor.license_url ?? "",
        status: doctor.status,
      };

      await updatePractitioner(updatePayload);

      toast.success(
        `Doctor ${!doctor.is_active ? "activated" : "deactivated"} successfully`
      );
      setSelectedDoctor(null);
      setOpen(false);
      await fetchDoctors();
    } catch (error) {
      console.error("Status toggle failed:", error);
      toast.error("Failed to update doctor status");
    }
  };

  const handleUpdateVerificationStatus = async (
    doctor: ExtendedDoctorData,
    status: PractitionerStatus
  ) => {
    try {
      const updatePayload: UpdateDoctorPayload = {
        id: doctor.id,
        user_id: doctor.user_id,
        practitioner_display_id: doctor.practitioner_display_id ?? "",
        gender: doctor.gender ?? "",
        birth_date: doctor.birth_date ?? "",
        is_active: doctor.is_active,
        license_details: doctor.license_details,
        profile_picture_url: doctor.profile_picture_url ?? "",
        license_url: doctor.license_url ?? "",
        status,
      };

      await updatePractitioner(updatePayload);
      toast.success(`Nurse status updated to ${status}`);
      await fetchDoctors();
    } catch (error) {
      console.error("Verification update failed:", error);
      toast.error("Failed to update verification status");
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
    // {
    //   header: "Qualification",
    //   cell: ({ row }) =>
    //     row.original.qualification?.[0]?.degree
    //       ? `${row.original.qualification[0].degree}, ${row.original.qualification[0].institution}`
    //       : "N/A",
    // },
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
                   setEditDoctorId(nurse.id);
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
                   setSelectedDoctor(nurse);
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
                  ? selectedDoctor?.is_active
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
                      selectedDoctor?.is_active
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {selectedDoctor?.is_active ? "deactivate" : "activate"}
                  </span>{" "}
                  the doctor{" "}
                  <span className="text-foreground font-semibold">
                    {selectedDoctor?.name}
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
                      selectedDoctor?.is_active ? "destructive" : "default"
                    }
                    onClick={() => handleToggleStatus(selectedDoctor)}
                    className={
                      selectedDoctor?.is_active
                        ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                        : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
                    }
                  >
                    {selectedDoctor?.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <FormModal
                role="doctor"
                onSubmit1={handleAddDoctor}
                editPractitionerId={editDoctorId}
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
        data={doctors}
        filterColumn="name"
        externalFilterValue={filterValue}
      />

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditDoctorId(null);
            setFormDefaults({});
          }
        }}
      >
        {/* <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDoctorId ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>

          <PractitionerFormModal
            role="doctor"
            onSubmit1={handleAddDoctor}
            editPractitionerId={editDoctorId}
            open={open}
            defaultValues={formDefaults}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setEditDoctorId(null);
                setFormDefaults({});
              }
            }}
          />
        </DialogContent> */}
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
