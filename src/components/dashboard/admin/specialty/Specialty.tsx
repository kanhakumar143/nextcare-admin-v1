"use client"
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addSpecialty } from "@/store/slices/specialtySlice";

import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import AddSpecialtyModal from "@/components/dashboard/admin/specialty/AddSpecialtyModal";
import { Specialty } from "@/types/specialty.type";
import { toast } from "sonner";

type Service = {
  name: string;
  category: string;
  price: string;
};

export default function Specialties() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.specialty);

  const [filterValue, setFilterValue] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const columns: ColumnDef<Service>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "price", header: "Price" },
  ];

  const services: Service[] = [
    { name: "Cardiology", category: "Medical", price: "$200" },
    { name: "Orthopedics", category: "Medical", price: "$150" },
  ];


const handleAddSpecialty = async (
  formData: Omit<Specialty, "code" | "system" | "description">
) => {
  try {
    const resultAction = await dispatch(addSpecialty(formData));

    if (addSpecialty.fulfilled.match(resultAction)) {
      toast.success("Specialty added successfully!");
      setOpenModal(false);
    } else {
      // toast.error();
    }
  } catch (err) {
    // toast({
    //   title: "Error",
    //   description: "Something went wrong while adding the specialty.",
    //   variant: "destructive",
    // });
  }
};


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Specialty Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Button type="button" onClick={() => setOpenModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Specialty
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        filterColumn="name"
        externalFilterValue={filterValue}
      />

      {/* Always mounted modal */}
      <div className="">
      <AddSpecialtyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddSpecialty}
      />
      </div>
    </div>
  );
}
