"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"

interface PricingEntry {
  id: string
  specialty: string // display name
  price: number
  tax: number
  totalPrice: number
  isActive: boolean
}

interface PricingCardProps {
  entry: PricingEntry
  onEditClick: () => void
  onDeleteClick: () => void
}

export default function PricingCard({ entry, onEditClick, onDeleteClick }: PricingCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      {/* Status badge */}
      <div className="absolute right-4 top-8">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${entry.isActive ? ' text-green-700 ' : ' text-red-700'}`}>
          {entry.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{entry.specialty}</CardTitle>
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
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Edit className="w-4 h-4 mr-1" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteClick}>
            <Trash className="w-4 h-4 mr-1 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
