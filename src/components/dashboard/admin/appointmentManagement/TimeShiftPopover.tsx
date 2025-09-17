"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";

interface TimeShiftPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTimeSelect: (delayMinutes: number) => void;
  disabled?: boolean;
}

export default function TimeShiftPopover({
  isOpen,
  onOpenChange,
  onTimeSelect,
  disabled = false,
}: TimeShiftPopoverProps) {
  const timeOptions = [
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "1 hour", value: 60 },
  ];

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-gray-100"
          disabled={disabled}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 border-b pb-2">
            Shift Slot Times
          </div>
          <div className="grid grid-cols-2 gap-1">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                className="h-8 text-xs justify-start"
                onClick={() => onTimeSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
