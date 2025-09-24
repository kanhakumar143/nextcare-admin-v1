"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Gift, Landmark } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import TaxRateModal from "./modals/AddAndEditModal";
import { TaxRate } from "@/types/taxManagement.type";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTaxRates,
  openEditModal,
} from "@/store/slices/taxManagementSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      cell: ({ row }) => (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Landmark className="w-8 h-8 text-primary" />
            Tax Management
          </h1>
          <p className="text-muted-foreground mt-1">
           Oversee tax records, compliance, and financial reporting efficiently.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Tax Rate
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tax Management</CardTitle>
            <Input
              placeholder="Search by Tax Name..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="max-w-46"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={taxRates}
            filterColumn="name"
            externalFilterValue={filterValue}
          />
        </CardContent>
      </Card>
      <TaxRateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
