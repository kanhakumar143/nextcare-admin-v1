"use client";

import { useEffect, useState } from "react";
import { getLocations } from "@/services/admin.api";
import { Location } from "@/types/admin.types";
import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { MapPin, Phone, Clock, Building, AlertCircle } from "lucide-react";
import LocationFormModal from "@/components/dashboard/admin/modals/FormModal"; 
export default function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations function
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setError("Failed to fetch locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLocations();
  }, []);

  // Table columns definition
  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("description")}
        >
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          suspended: "bg-red-100 text-red-800",
        };
        return (
          <Badge
            className={
              statusColors[status as keyof typeof statusColors] ||
              statusColors.inactive
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "address.text",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span
            className="max-w-[200px] truncate"
            title={row.original.address?.text}
          >
            {row.original.address?.text ?? "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const contact = row.original.contact?.[0];
        const phone = contact?.telecom?.[0]?.value;
        const name = contact?.name?.text;

        return (
          <div className="flex flex-col gap-1">
            {name && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">{name}</span>
              </div>
            )}
            {phone && (
              <div className="text-sm text-muted-foreground">{phone}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "hoursOfOperation",
      header: "Hours",
      cell: ({ row }) => {
        const hours = row.original.hoursOfOperation?.[0];
        if (!hours) return "-";

        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div>
                {hours.openingTime} - {hours.closingTime}
              </div>
              <div className="text-xs text-muted-foreground">
                {hours.daysOfWeek?.join(", ")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "characteristic",
      header: "Type",
      cell: ({ row }) => {
        const characteristic =
          row.original.characteristic?.[0]?.coding?.[0]?.code;
        if (!characteristic) return "-";

        const typeLabels = {
          "24x7": "24/7 Service",
          "business-hours": "Business Hours",
          emergency: "Emergency Only",
          appointment: "By Appointment",
        };

        return (
          <Badge variant="outline">
            {typeLabels[characteristic as keyof typeof typeLabels] ||
              characteristic}
          </Badge>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-4 ">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter locations by name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <LocationFormModal onLocationAdded={fetchLocations} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
<DataTable
        columns={columns}
        data={locations}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
