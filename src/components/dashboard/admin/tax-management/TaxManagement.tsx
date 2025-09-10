"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import TaxRateModal from "./modals/AddAndEditModal";
import { TaxRate } from "@/types/taxManagement.type";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTaxRates, openEditModal } from "@/store/slices/taxManagementSlice";

export default function TaxManagement() {
  const dispatch = useAppDispatch();
  const { taxRates } = useAppSelector((state) => state.taxManagement);
  const [filterValue, setFilterValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTaxRates());
  }, [dispatch]);

  const handleEdit = (rate: TaxRate) => {
    dispatch(openEditModal(rate));
    setModalOpen(true);
  };

  const columns: ColumnDef<TaxRate>[] = [
    { accessorKey: "tax_display_id", header: "Tax ID" },  
    { accessorKey: "name", header: "Name" },
    { accessorKey: "rate", header: "Rate (%)" },
    { accessorKey: "description", header: "Description" },
    
    {
      header: "Status",
      accessorFn: (row: TaxRate) => row.active,
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge
            className={isActive ? "bg-green-500 text-white w-16" : "bg-red-500 text-white w-16"}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="secondary" size="icon" onClick={() => handleEdit(row.original)}>
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-40"
        />
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Tax Rate
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={taxRates}
        filterColumn="name"
        externalFilterValue={filterValue}
      />

      <TaxRateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
