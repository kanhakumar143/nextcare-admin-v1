"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface PricingEntry {
  id: string;
  serviceName?: string; // Optional: Parent service name (for search mode display)
  subService: string; // display name
  price: number;
  tax: number;
  totalPrice: number;
  isActive: boolean;
}

interface PricingCardProps {
  entry: PricingEntry;
  onEditClick: () => void;
  onDeleteClick: () => void;
  showServiceName?: boolean; // Optional: Show full service path in title
}

export default function PricingCard({
  entry,
  onEditClick,
  onDeleteClick,
  showServiceName = false,
}: PricingCardProps) {
  const displayTitle = showServiceName && entry.serviceName
    ? `${entry.serviceName} - ${entry.subService}`
    : entry.subService;

  return (
    <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 relative max-w-70 mx-auto">
      {/* Status badge */}
      <div className="absolute right-4 top-7">
        <span
          className={`px-2 rounded text-xs font-semibold ${
            entry.isActive ? "text-green-700" : "text-red-700"
          }`}
        >
          {entry.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Base Price</span>
          <span className="font-medium">₹{entry.price ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax Percentage</span>
          <span className="font-medium">{entry.tax ?? 0}%</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">₹{entry.totalPrice ?? 0}</span>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onEditClick}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onDeleteClick}
          >
            <Trash className="w-4 h-4 mr-1 text-red-500" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}