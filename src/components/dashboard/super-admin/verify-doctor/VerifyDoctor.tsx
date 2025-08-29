// "use client";

// import { useState, useEffect } from "react";
// import { Plus, Pencil } from "lucide-react";
// import { ColumnDef } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { DataTable } from "@/components/common/DataTable";
// import {
//   DoctorData,
//   UpdateDoctorPayload,
//   AddDoctorPayload,
// } from "@/types/admin.types";
// import {
//   addPractitioner,
//   getPractitionerByRole,
//   updatePractitioner,
// } from "@/services/admin.api";
// import { toast } from "sonner";
// import PractitionerFormModal from "@/components/common/FormModal";

// type ExtendedDoctorData = DoctorData & {
//   name: string;
//   id: string;
//   user_id: string;
//   license_details: {
//     number?: string;
//     issued_by?: string;
//     expiry?: string;
//   };
//   qualification: {
//     degree?: string;
//     institution?: string;
//     year?: string;
//   }[];
// };

// // ✅ helper: doctor → flat form defaults
// // function mapDoctorToFormDefaults(doctor: ExtendedDoctorData) {
// //   return {
// //     tenant_id: "4896d272-e201-4dce-9048-f93b1e3ca49f",
// //     name: doctor.name ?? "",
// //     email: doctor.user?.email ?? "",
// //     phone: doctor.user?.phone ?? "",
// //     license_number: doctor.license_details?.number ?? "",
// //     license_issued_by: doctor.license_details?.issued_by ?? "",
// //     license_expiry: doctor.license_details?.expiry ?? "",
// //     is_active: doctor.is_active ?? true,
// //     gender: doctor.gender ?? "",
// //     birth_date: doctor.birth_date ?? "",
// //     profile_picture_url: doctor.profile_picture_url ?? "",
// //     license_url: doctor.license_url ?? "",
// //     degree: doctor.qualification?.[0]?.degree ?? "",
// //     institution: doctor.qualification?.[0]?.institution ?? "",
// //     graduation_year: doctor.qualification?.[0]?.year ?? "",
// //   };
// // }

// // ✅ helper: flat form → API shape for adding
// // function mapFormToAddDoctorPayload(formData: any): AddDoctorPayload {
// //   return {
// //     user: {
// //       tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
// //       name: formData.name,
// //       email: formData.email,
// //       user_role: "doctor",
// //       phone: formData.phone,
// //     },
// //     practitioner: {
// //       identifiers: [
// //         {
// //           system: "practitioner_id",
// //           value: formData.practitioner_display_id || "",
// //         },
// //       ],
// //       name: {
// //         given: [formData.name],
// //         family: "",
// //       },
// //       gender: formData.gender,
// //       birth_date: formData.birth_date,
// //       qualification: [
// //         {
// //           degree: formData.degree,
// //           institution: formData.institution,
// //           year: formData.graduation_year,
// //         },
// //       ],
// //       license_details: {
// //         number: formData.license_number,
// //         issued_by: formData.license_issued_by,
// //         expiry: formData.license_expiry,
// //       },
// //       profile_picture_url: formData.profile_picture_url,
// //       license_url: formData.license_url,
// //       is_active: formData.is_active ?? true,
// //     },
// //     role: {
// //       tenant_id: formData.tenant_id || "4896d272-e201-4dce-9048-f93b1e3ca49f",
// //       code: [
// //         {
// //           coding: [
// //             {
// //               system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
// //               code: "doctor",
// //               display: "Doctor",
// //             },
// //           ],
// //           text: "Doctor",
// //         },
// //       ],
// //       specialty: [
// //         {
// //           text: formData.specialty || "General Practice",
// //         },
// //       ],
// //       location: [],
// //       healthcare_service: [],
// //       period: {
// //         start: new Date().toISOString(),
// //         end: "",
// //       },
// //       availability: [],
// //       not_available: [],
// //     },
// //   };
// // }

// // ✅ helper: flat form → API shape
// // function mapFormToDoctorPayload(
// //   formData: any,
// //   id?: string,
// //   user_id?: string
// // ): UpdateDoctorPayload {
// //   return {
// //     id: id ?? "",
// //     user_id: user_id ?? "",
// //     practitioner_display_id: formData.practitioner_display_id,
// //     gender: formData.gender,
// //     birth_date: formData.birth_date,
// //     is_active: formData.is_active,
// //     profile_picture_url: formData.profile_picture_url,
// //     license_url: formData.license_url,
// //     license_details: {
// //       number: formData.license_number,
// //       issued_by: formData.license_issued_by,
// //       expiry: formData.license_expiry,
// //     },
// //     qualification: [
// //       {
// //         degree: formData.degree,
// //         institution: formData.institution,
// //         graduation_year: formData.graduation_year,
// //       },
// //     ],
// //   };
// // }

// export default function VerifyDoctor() {
//   const [open, setOpen] = useState(false);
//   const [filterValue, setFilterValue] = useState("");
//   const [editDoctor, setEditDoctor] = useState<ExtendedDoctorData | null>(null);
//   const [formDefaults, setFormDefaults] = useState<any>({});
//   const [practitioners, setPractitioners] = useState<ExtendedDoctorData[]>([]);

//   const fetchPractitionerByRole = async () => {
//     try {
//       const res = await getPractitionerByRole("doctor");
//       const data = (res?.data || []).map((doc: DoctorData) => ({
//         ...doc,
//         name: doc.user?.name ?? "",
//       }));
//       setPractitioners(data);
//     } catch (error) {
//       console.error("Failed to fetch practitioners:", error);
//     }
//   };

//   useEffect(() => {
//     fetchPractitionerByRole();
//   }, []);

// //   const handleAddDoctor = async (formData: any) => {
// //     try {
// //       const payload = mapFormToAddDoctorPayload(formData);
// //       const res = await addPractitioner(payload);

// //       // Add new doctor to local state immediately
// //       const newDoctor: ExtendedDoctorData = {
// //         ...res.data,
// //         name: res.data.user?.name ?? formData.name,
// //       };
// //       setPractitioners((prev) => [...prev, newDoctor]);

// //       setOpen(false);
// //       toast.success("Doctor added successfully.");
// //     } catch (error) {
// //       console.error("Error adding doctor:", error);
// //       toast.error("Failed to add doctor.");
// //     }
// //   };

//   const handleEditDoctor = async (formData: any) => {
//     // if (!editDoctor) return;

//     // try {
//     //   const payload = mapFormToDoctorPayload(
//     //     formData,
//     //     editDoctor.id,
//     //     editDoctor.user_id
//     //   );
//     //   const res = await updatePractitioner(payload); // res.data contains updated doctor

//     //   const updatedDoctor: ExtendedDoctorData = {
//     //     ...res.data,
//     //     name: res.data.user?.name ?? editDoctor.name,
//     //     license_details: {
//     //       number: res.data.license_details?.number ?? "",
//     //       issued_by: res.data.license_details?.issued_by ?? "",
//     //       expiry: res.data.license_details?.expiry ?? "",
//     //     },
//     //     qualification: res.data.qualification?.length
//     //       ? res.data.qualification
//     //       : [{ degree: "", institution: "", year: "" }],
//     //   };

//     //   setPractitioners((prev) =>
//     //     prev.map((doc) => (doc.id === editDoctor.id ? updatedDoctor : doc))
//     //   );

//     //   setOpen(false);
//     //   setEditDoctor(null);
//     //   toast.success("Doctor updated successfully.");
//     // } catch (error) {
//     //   console.error("Error updating doctor:", error);
//     //   toast.error("Failed to update doctor.");
//     // }
//   };

//   const columns: ColumnDef<ExtendedDoctorData>[] = [
//     {
//       header: "Doctor Name",
//       accessorKey: "name",
//     },
//     {
//       header: "Practitioner ID",
//       accessorKey: "practitioner_display_id",
//     },
//     {
//       header: "License Number",
//       accessorKey: "license_details.number",
//       cell: ({ row }) => row.original.license_details?.number ?? "N/A",
//     },
//     // {
//     //   header: "Qualification",
//     //   cell: ({ row }) =>
//     //     row.original.qualification?.[0]?.degree
//     //       ? `${row.original.qualification[0].degree}, ${row.original.qualification[0].institution}`
//     //       : "N/A",
//     // },
//     {
//       header: "Status",
//       accessorFn: (row) => row.is_active,
//       cell: ({ getValue }) => {
//         const isActive = getValue() as boolean;
//         return (
//           <Badge
//             className={
//               isActive
//                 ? "bg-green-500 text-white w-16"
//                 : "bg-red-500 text-white w-16"
//             }
//           >
//             {isActive ? "Active" : "Inactive"}
//           </Badge>
//         );
//       },
//     },
//     {
//       header: "Actions",
//       cell: ({ row }) => {
//         const doctor = row.original;
//         return (
//           <div className="flex items-center gap-2">
//             <Button
//               variant="secondary"
//               size="icon"
//               onClick={() => {
//                 setEditDoctor(doctor);
//                 // setFormDefaults(mapDoctorToFormDefaults(doctor));
//                 setOpen(true);
//               }}
//             >
//               <Pencil className="w-3 h-3" />
//             </Button>
//           </div>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex items-center justify-between">
//         <Input
//           placeholder="Filter by Doctor Name..."
//           value={filterValue}
//           onChange={(e) => setFilterValue(e.target.value)}
//           className="max-w-sm"
//         />

//         {/* <Button
//           onClick={() => {
//             setEditDoctor(null);
//             setFormDefaults({});
//             setOpen(true);
//           }}
//         >
//           <Plus className="w-4 h-4 mr-1" />
//           Add Doctor
//         </Button> */}
//       </div>

//       <DataTable<ExtendedDoctorData>
//         columns={columns}
//         data={practitioners}
//         filterColumn="name"
//         externalFilterValue={filterValue}
//       />

//       <Dialog
//         open={open}
//         onOpenChange={(val) => {
//           setOpen(val);
//           if (!val) {
//             setEditDoctor(null);
//             setFormDefaults({});
//           }
//         }}
//       >
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {editDoctor ? "Edit Doctor" : "Add New Doctor"}
//             </DialogTitle>
//           </DialogHeader>

//           {/* <PractitionerFormModal
//             role="doctor"
//             // onSubmit1={editDoctor ? handleEditDoctor : handleAddDoctor}
//             editPractitionerId={editDoctor?.id ?? null}
//             open={open}
//             defaultValues={formDefaults}
//             onOpenChange={(val) => {
//               setOpen(val);
//               if (!val) {
//                 setEditDoctor(null);
//                 setFormDefaults({});
//               }
//             }}
//           /> */}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


