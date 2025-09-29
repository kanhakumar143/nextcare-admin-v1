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
  ArrowRight,
  Timer,
  Clock,
  Edit,
  Stethoscope,
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
  PractitionerStatus,
  ExtendedDoctorData,
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setEditDoctorData,
  clearEditDoctorData,
} from "@/store/slices/adminSlice";
import DoctorAvailabilityModal from "./modals/DoctorAvailabilityModal";
import TempNextDaySlotsModal from "./modals/TempNextDaySlotsModal";
import ViewAvailableSlotsModal from "./modals/ViewAvailableSlotsModal";
import { ORG_TENANT_ID } from "@/config/authKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorManagement() {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [formDefaults, setFormDefaults] = useState<any>({});
  const [selectedDoctor, setSelectedDoctor] =
    useState<ExtendedDoctorData | null>(null);
  const [doctors, setDoctors] = useState<ExtendedDoctorData[]>([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityDoctor, setAvailabilityDoctor] =
    useState<ExtendedDoctorData | null>(null);
  const [showTempSlotsModal, setShowTempSlotsModal] = useState(false);
  const [tempSlotsDoctor, setTempSlotsDoctor] =
    useState<ExtendedDoctorData | null>(null);
  const [showViewSlotsModal, setShowViewSlotsModal] = useState(false);
  const [viewSlotsDoctor, setViewSlotsDoctor] =
    useState<ExtendedDoctorData | null>(null);
  const { role } = useAuthInfo();
  const dispatch = useDispatch();
  const { editDoctorData } = useSelector((state: RootState) => state.admin);

  // Function to transform doctor data for form
  const transformDoctorDataForForm = (doctor: ExtendedDoctorData) => {
    console.log(doctor);

    // Handle qualification array - use first element (index 0)
    const firstQualification = doctor.qualification[0];
    // Array.isArray(doctor.qualification) && doctor.qualification.length > 0
    //   ? doctor.qualification[0]
    //   : doctor.qualification || {};

    return {
      tenant_id: ORG_TENANT_ID,
      name: doctor.name || "",
      email: doctor.user?.email || "",
      phone: doctor.user?.phone || "",
      gender:
        (doctor.gender as "male" | "female" | "other" | "unknown") || "unknown",
      birth_date: doctor.birth_date || "",
      license_number: doctor.license_details?.number || "",
      license_issued_by: doctor.license_details?.issued_by || "",
      license_expiry: doctor.license_details?.expiry || "",
      profile_picture_url: doctor.profile_picture_url || "",
      license_url: doctor.license_url || "",
      is_active: doctor.is_active || true,
      degree: firstQualification?.degree || "",
      institution: firstQualification?.institution || "",
      graduation_year:
        firstQualification?.graduation_year || firstQualification?.year || "",
      specialty: "General Practice",
      availability_days: ["mon", "tue", "wed", "thu", "fri"],
      available_times: [{ start: "09:00", end: "17:00" }],
      role_code_system:
        "http://terminology.hl7.org/CodeSystem/practitioner-role",
      role_code: "doctor",
      role_display: "Doctor",
      role_text: "Doctor",
    };
  };

  // Helper function to create a complete UpdateDoctorPayload from ExtendedDoctorData
  const createUpdatePayloadFromDoctor = (
    doctor: ExtendedDoctorData,
    overrides: Partial<UpdateDoctorPayload> = {}
  ): any => {
    const fullName = doctor.name || doctor.user?.name || "";
    const nameParts = fullName.split(" ");
    const givenNames =
      nameParts.length > 1 ? nameParts.slice(0, -1) : [fullName];
    const familyName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const firstQualification = doctor.qualification[0]; // handle all list

    return {
      id: doctor.id,
      user_id: doctor.user_id,
      practitioner_display_id: doctor.practitioner_display_id ?? "",
      identifiers: [
        {
          system: "practitioner_id",
          value: doctor.practitioner_display_id ?? "",
        },
      ],
      name: {
        use: null,
        text: null,
        family: familyName,
        given: givenNames,
        prefix: ["Dr"],
        suffix: null,
        period: null,
      },
      telecom: [
        {
          system: "phone",
          value: doctor.user?.phone || "",
          use: "mobile",
          rank: null,
          period: null,
        },
        {
          system: "email",
          value: doctor.user?.email || "",
          use: "work",
          rank: null,
          period: null,
        },
      ],
      gender: doctor.gender ?? "",
      birth_date: doctor.birth_date ?? "",
      qualification: [
        {
          degree: firstQualification?.degree || "",
          institution: firstQualification?.institution || "",
          graduation_year: firstQualification?.graduation_year || "",
        },
      ],
      is_active: doctor.is_active,
      license_details: doctor.license_details || {
        number: "",
        issued_by: "",
        expiry: "",
      },
      profile_picture_url: doctor.profile_picture_url ?? "",
      license_url: doctor.license_url ?? "",
      e_sign_path: null,
      status: doctor.status,
      ...overrides,
    };
  };

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
      // console.log(formData);
      // const payload = {
      //   ...formData,
      //   role: {
      //     ...formData.role,
      //     tenantId: "4896d272-e201-4dce-9048-f93b1e3ca49f",
      //   },
      // };
      await addPractitioner(formData);
      await fetchDoctors();
      setOpen(false);
      toast.success("Doctor added successfully.");
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor.");
    }
  };

  const handleUpdateDoctor = async (formData: any) => {
    try {
      console.log("Form DATA ------->", formData);
      const payload: UpdateDoctorPayload = {
        id: editDoctorData?.id || "",
        user_id: editDoctorData?.user_id || "",
        practitioner_display_id: editDoctorData?.practitioner_display_id || "",
        identifiers: formData.practitioner?.identifiers || [
          {
            system: "practitioner_id",
            value: editDoctorData?.practitioner_display_id || "",
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
          prefix: formData.practitioner?.name?.prefix || ["Dr"],
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
        status: editDoctorData?.status || "unverified",
      };
      console.log("Update Payload -------->", payload);
      await updatePractitioner(payload);
      await fetchDoctors();
      setOpen(false);
      toast.success("Doctor updated successfully.");
    } catch (error) {
      console.error("Error updating doctor:", error);
      toast.error("Failed to update doctor.");
    }
  };

  const handleToggleStatus = async (doctor: ExtendedDoctorData) => {
    try {
      const updatePayload = createUpdatePayloadFromDoctor(doctor, {
        is_active: !doctor.is_active,
      });

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
      const updatePayload = createUpdatePayloadFromDoctor(doctor, {
        status,
      });

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
      header: "Service Specialty",
      accessorKey: "service_specialty.display",
      cell: ({ row }) =>
        row.original.service_specialty?.specialty_label ?? "N/A",
    },
    {
      header: "Email Address",
      accessorFn: (row) => row.user?.email,
      cell: ({ getValue }) => {
        const email = getValue() as string | undefined;
        return <p className="lowercase">{email || "N/A"}</p>;
      },
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
        const doctor = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* Activate/Deactivate Button */}
            <Button
              variant="ghost"
              className={
                doctor.is_active
                  ? "text-red-500 hover:text-red-700"
                  : "text-green-500 hover:text-green-700"
              }
              onClick={() => {
                setSelectedDoctor(doctor);
                setOpen(true);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {doctor.is_active ? (
                  <ShieldX className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
            </Button>

            {/* Three Dots Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Edit Option */}
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(setEditDoctorData(doctor));
                    setEditDoctorId(doctor.id);
                    setOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Doctor
                </DropdownMenuItem>

                {/* Create Slots Option */}
                {/* <DropdownMenuItem
                  onClick={() => {
                    setTempSlotsDoctor(doctor);
                    setShowTempSlotsModal(true);
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Create Slots
                </DropdownMenuItem> */}

                {/* View Available Slots Option */}
                <DropdownMenuItem
                  onClick={() => {
                    setViewSlotsDoctor(doctor);
                    setShowViewSlotsModal(true);
                  }}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  View Available Slots
                </DropdownMenuItem>

                {/* Verification Options - Only for super-admin */}
                {role === "super_admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateVerificationStatus(
                          doctor,
                          PractitionerStatus.VERIFIED
                        )
                      }
                    >
                      Verify
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateVerificationStatus(
                          doctor,
                          PractitionerStatus.UNDER_REVIEW
                        )
                      }
                    >
                      Mark as Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateVerificationStatus(
                          doctor,
                          PractitionerStatus.REJECTED
                        )
                      }
                    >
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateVerificationStatus(
                          doctor,
                          PractitionerStatus.RESUBMIT_REQUIRED
                        )
                      }
                    >
                      Request Resubmission
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateVerificationStatus(
                          doctor,
                          PractitionerStatus.UNVERIFIED
                        )
                      }
                    >
                      Unverify
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
  const router = useRouter();
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            Doctor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage doctor profiles, schedules, and related activities with ease.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditDoctorId(null);
              setSelectedDoctor(null);
              dispatch(clearEditDoctorData());
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
                onSubmit2={handleUpdateDoctor}
                editPractitionerId={editDoctorId}
                open={open}
                defaultValues={
                  editDoctorData
                    ? transformDoctorDataForForm(editDoctorData)
                    : undefined
                }
                onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) {
                    setEditDoctorId(null);
                    dispatch(clearEditDoctorData());
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Doctor Management</CardTitle>
            <Input
              placeholder="Filter by Doctor Name..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="max-w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable<ExtendedDoctorData>
            columns={columns}
            data={doctors}
            filterColumn="name"
            externalFilterValue={filterValue}
          />
        </CardContent>
      </Card>
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

      {/* Doctor Availability Modal */}
      {availabilityDoctor && (
        <DoctorAvailabilityModal
          open={showAvailabilityModal}
          onOpenChange={setShowAvailabilityModal}
          doctorId={availabilityDoctor.id}
          doctorName={availabilityDoctor.name || "Unknown Doctor"}
        />
      )}

      {/* Temporary Next Day Slots Modal */}
      {tempSlotsDoctor && (
        <TempNextDaySlotsModal
          open={showTempSlotsModal}
          onOpenChange={setShowTempSlotsModal}
          doctorId={tempSlotsDoctor.id}
          doctorName={tempSlotsDoctor.name || "Unknown Doctor"}
        />
      )}

      {/* View Available Slots Modal */}
      {viewSlotsDoctor && (
        <ViewAvailableSlotsModal
          open={showViewSlotsModal}
          onOpenChange={setShowViewSlotsModal}
          doctorId={viewSlotsDoctor.id}
          doctorName={viewSlotsDoctor.name || "Unknown Doctor"}
        />
      )}
    </div>
  );
}
