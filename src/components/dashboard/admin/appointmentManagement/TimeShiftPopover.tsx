"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical, Clock, Check, X, Calendar } from "lucide-react";

interface TimeShiftPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTimeSelect: (delayMinutes: number) => void;
  onDaySelect?: (shiftDays: number) => void;
  disabled?: boolean;
}

export default function TimeShiftPopover({
  isOpen,
  onOpenChange,
  onTimeSelect,
  onDaySelect,
  disabled = false,
}: TimeShiftPopoverProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [showDayInput, setShowDayInput] = useState(false);
  const [customDays, setCustomDays] = useState("");

  const timeOptions = [
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "1 hour", value: 60 },
  ];

  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 1440) {
      // Max 24 hours
      onTimeSelect(minutes);
      setShowCustomInput(false);
      setCustomMinutes("");
      onOpenChange(false);
    }
  };

  const handleCustomTimeCancel = () => {
    setShowCustomInput(false);
    setCustomMinutes("");
  };

  const handleCustomDaySubmit = () => {
    const days = parseInt(customDays);
    if (!isNaN(days) && days > 0 && days <= 365 && onDaySelect) {
      // Max 1 year
      onDaySelect(days);
      setShowDayInput(false);
      setCustomDays("");
      onOpenChange(false);
    }
  };

  const handleCustomDayCancel = () => {
    setShowDayInput(false);
    setCustomDays("");
  };

  const handleCustomInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomTimeSubmit();
    } else if (e.key === "Escape") {
      handleCustomTimeCancel();
    }
  };

  const handleCustomDayKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomDaySubmit();
    } else if (e.key === "Escape") {
      handleCustomDayCancel();
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Reset custom input states when popover closes
      setShowCustomInput(false);
      setCustomMinutes("");
      setShowDayInput(false);
      setCustomDays("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
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
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 border-b pb-2">
            Shift Slots
          </div>

          {!showCustomInput && !showDayInput ? (
            <>
              {/* Time Shift Section */}
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Shift by Time
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

                {/* Custom Time Button */}
                <div className="mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs justify-start w-full"
                    onClick={() => setShowCustomInput(true)}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Custom time
                  </Button>
                </div>
              </div>

              {/* Day Shift Section */}
              {onDaySelect && (
                <div className="border-t pt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    Shift by Days
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs justify-start w-full"
                    onClick={() => setShowDayInput(true)}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Custom days
                  </Button>
                </div>
              )}
            </>
          ) : showCustomInput ? (
            /* Custom Time Input Form */
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                Enter minutes (1-1440):
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  onKeyDown={handleCustomInputKeyPress}
                  placeholder="e.g. 25"
                  className="h-8 text-xs"
                  min="1"
                  max="1440"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleCustomTimeSubmit}
                    disabled={
                      !customMinutes ||
                      isNaN(parseInt(customMinutes)) ||
                      parseInt(customMinutes) <= 0
                    }
                  >
                    <Check className="w-3 h-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleCustomTimeCancel}
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Press Enter to confirm, Escape to cancel
              </div>
            </div>
          ) : (
            /* Custom Day Input Form */
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Enter days (1-365):</div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  onKeyDown={handleCustomDayKeyPress}
                  placeholder="e.g. 7"
                  className="h-8 text-xs"
                  min="1"
                  max="365"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleCustomDaySubmit}
                    disabled={
                      !customDays ||
                      isNaN(parseInt(customDays)) ||
                      parseInt(customDays) <= 0
                    }
                  >
                    <Check className="w-3 h-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handleCustomDayCancel}
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Press Enter to confirm, Escape to cancel
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
