import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, Trash2, EllipsisVertical } from "lucide-react";
import { Schedule } from "@/types/scheduleSlots.types";

interface ScheduleAccordionProps {
  schedules: Schedule[];
  onDeleteSlots: (schedule: Schedule) => void;
  onDeleteSingleSchedule: (schedule: Schedule) => void;
}

const ScheduleAccordion: React.FC<ScheduleAccordionProps> = ({
  schedules,
  onDeleteSlots,
  onDeleteSingleSchedule,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTotalHours = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffInMs = endTime.getTime() - startTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours.toFixed(1);
  };

  return (
    <Accordion type="multiple" className="w-full">
      {schedules.map((schedule) => (
        <AccordionItem
          key={schedule.id}
          value={schedule.id}
          className="border rounded-lg mb-4 bg-card"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex flex-col items-start space-y-1">
                <h3 className="text-lg font-semibold text-left">
                  {formatDate(schedule.planning_start)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(schedule.planning_start)} -{" "}
                    {formatTime(schedule.planning_end)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {calculateTotalHours(
                    schedule.planning_start,
                    schedule.planning_end
                  )}{" "}
                  hours
                </Badge>
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {schedule.slots.filter((slot) => !slot.overbooked).length}{" "}
                    Available
                  </span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                    {schedule.slots.filter((slot) => slot.overbooked).length}{" "}
                    Overbooked
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisVertical />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSlots(schedule)}
                        className="w-full justify-start hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2 text-red-600" />
                        Delete Slots
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSingleSchedule(schedule)}
                        className="w-full justify-start hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2 text-red-600" />
                        Delete Schedule
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {/* Slots Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Available Time Slots</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use "Delete Slots" button above for bulk deletion actions
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
                {[...schedule.slots]
                  .sort(
                    (a, b) =>
                      new Date(a.start).getTime() - new Date(b.start).getTime()
                  )
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-2 rounded-md border text-center text-xs transition-all duration-200 ${
                        slot.overbooked
                          ? "bg-gray-100 text-gray-500 border-gray-300 opacity-60"
                          : slot.status === "free"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      <div className="font-medium text-lg">
                        {formatTime(slot.start)}
                      </div>
                      <div className=" opacity-80 leading-tight">
                        to {formatTime(slot.end)}
                      </div>
                      <div className="mt-3 mb-1">
                        {slot.overbooked ? (
                          <span className="text-md bg-red-100 text-red-600 px-3 py-1 rounded-full m-2">
                            Overbooked
                          </span>
                        ) : (
                          <span className="text-md bg-green-100 text-green-600 px-3 py-1 rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {schedule.slots.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No slots available for this date
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ScheduleAccordion;
