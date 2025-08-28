// "use client";

// import { useState, useEffect } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { DataTable } from "@/components/common/DataTable";
// import {
//   NurseData,
//   UpdateDoctorPayload,
// //   PractitionerStatusLabels,
// } from "@/types/admin.types"; 
// import {
//   getPractitionerByRole,
//   updatePractitioner,
// } from "@/services/admin.api"; 
// import { toast } from "sonner";
// // import { PractitionerStatus } from "@/types/admin.types";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";

// type ExtendedNurseData = NurseData & {
//   name: string;
//   id: string;
//   status: PractitionerStatus | null;
//   user_id: string;
//   license_details: {
//     number: string;
//     issued_by: string;
//     expiry: string;
//   };
// };

// export default function VerifyNurse() {
//   const [open, setOpen] = useState(false);
//   const [filterValue, setFilterValue] = useState("");
//   const [editNurseId, setEditNurseId] = useState<string | null>(null);
//   const [selectedNurse, setSelectedNurse] = useState<ExtendedNurseData | null>(
//     null
//   );
//   const [nurses, setNurses] = useState<ExtendedNurseData[]>([]);
//   const [selectedAction, setSelectedAction] =
//     useState<PractitionerStatus | null>(null);

//   const fetchNurses = async () => {
//     try {
//       const res = await getPractitionerByRole("nurse"); 
//       const data = (res?.data || []).map((nurse: NurseData) => ({
//         ...nurse,
//         name: nurse.user.name,
//       }));
//       setNurses(data);
//     } catch (error) {
//       console.error("Failed to fetch nurses:", error);
//     }
//   };

//   useEffect(() => {
//     fetchNurses();
//   }, []);

//   const handleStatusChange = async (
//     nurse: ExtendedNurseData,
//     newStatus: PractitionerStatus
//   ) => {
//     try {
//       const updatePayload: UpdateDoctorPayload = {
//         id: nurse.id,
//         user_id: nurse.user_id,
//         practitioner_display_id: nurse.practitioner_display_id ?? "",
//         gender: nurse.gender ?? "",
//         birth_date: nurse.birth_date ?? "",
//         is_active: nurse.is_active ?? "",
//         status: newStatus, 
//         license_details: nurse.license_details,
//         profile_picture_url: nurse.profile_picture_url ?? "",
//         license_url: nurse.license_url ?? "",
//       };

//       await updatePractitioner(updatePayload);

//       toast.success(`Nurse status updated to ${newStatus}`);

  
//       await fetchNurses();
//     } catch (error) {
//       console.error("Status update failed:", error);
//       toast.error("Failed to update nurse status");
//     }
//   };

//   const columns: ColumnDef<ExtendedNurseData>[] = [
//     {
//       header: "Nurse Name",
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
//     {
//       header: "Status",
//       accessorKey: "status",
//       cell: ({ getValue }) => {
//         const status = getValue() as PractitionerStatus;

//         switch (status) {
//           case "verified":
//             return <Badge className="bg-green-500 text-white">Verified</Badge>;
//           case "under_review":
//             return (
//               <Badge className="bg-blue-500 text-white">Under Review</Badge>
//             );
//           case "rejected":
//             return <Badge className="bg-red-500 text-white">Rejected</Badge>;
//           case "resubmit_required":
//             return (
//               <Badge className="bg-yellow-500 text-black">
//                 Resubmit Required
//               </Badge>
//             );
//           case "unverified":
//           default:
//             return <Badge className="bg-gray-500 text-white">Unverified</Badge>;
//         }
//       },
//     },
//     {
//       header: "Actions",
//       cell: ({ row }) => {
//         const nurse = row.original;

//         return (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0">
//                 <MoreHorizontal className="h-5 w-5" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem
//                 onClick={() => {
//                   setSelectedNurse(nurse);
//                   setSelectedAction(PractitionerStatus.VERIFIED);
//                   setOpen(true);
//                 }}
//               >
//                 Verify
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   setSelectedNurse(nurse);
//                   setSelectedAction(PractitionerStatus.UNDER_REVIEW);
//                   setOpen(true);
//                 }}
//               >
//                 Mark as Under Review
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   setSelectedNurse(nurse);
//                   setSelectedAction(PractitionerStatus.REJECTED);
//                   setOpen(true);
//                 }}
//               >
//                 Reject
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   setSelectedNurse(nurse);
//                   setSelectedAction(PractitionerStatus.RESUBMIT_REQUIRED);
//                   setOpen(true);
//                 }}
//               >
//                 Request Resubmission
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   setSelectedNurse(nurse);
//                   setSelectedAction(PractitionerStatus.UNVERIFIED);
//                   setOpen(true);
//                 }}
//               >
//                 Unverify
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex items-center justify-between">
//         <Input
//           placeholder="Filter by Nurse Name..."
//           value={filterValue}
//           onChange={(e) => setFilterValue(e.target.value)}
//           className="max-w-sm"
//         />

//         <Dialog
//           open={open}
//           onOpenChange={(val) => {
//             setOpen(val);
//             if (!val) {
//               setEditNurseId(null);
//               setSelectedNurse(null);
//             }
//           }}
//         >
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedAction
//                   ? `Confirm ${PractitionerStatusLabels[selectedAction]}`
//                   : "Confirm Action"}
//               </DialogTitle>
//             </DialogHeader>

//             {selectedNurse ? (
//               <>
//                 <div className="mt-2 text-sm text-muted-foreground">
//                   Are you sure you want to{" "}
//                   <span className="text-blue-600 font-medium">
//                     {selectedAction
//                       ? PractitionerStatusLabels[selectedAction]
//                       : ""}
//                   </span>{" "}
//                   the nurse{" "}
//                   <span className="text-foreground font-semibold">
//                     {selectedNurse?.name}
//                   </span>
//                   ?
//                 </div>

//                 <DialogFooter className="p-4 flex justify-end gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setOpen(false);
//                       setSelectedNurse(null);
//                       setSelectedAction(null);
//                     }}
//                   >
//                     Cancel
//                   </Button>

//                   <Button
//                     onClick={() => {
//                       if (selectedNurse && selectedAction) {
//                         handleStatusChange(selectedNurse, selectedAction);
//                         setOpen(false);
//                       }
//                     }}
//                     className="bg-blue-600 text-white hover:bg-blue-700"
//                   >
//                     Confirm
//                   </Button>
//                 </DialogFooter>
//               </>
//             ) : null}
//           </DialogContent>
//         </Dialog>
//       </div>

//       <DataTable<ExtendedNurseData>
//         columns={columns}
//         data={nurses}
//         filterColumn="name"
//         externalFilterValue={filterValue}
//       />
//     </div>
//   );
// }
