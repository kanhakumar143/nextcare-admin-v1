"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import moment from "moment";
import { Users, Clock } from "lucide-react";
import { SlotComponentProps } from "@/types/appointmentManagement.types";

export const DraggableSlot: React.FC<SlotComponentProps> = ({
  slot,
  scheduleId,
  doctorId,
  scheduleDate,
}) => {
  const draggableId = doctorId
    ? `${doctorId}:${scheduleId}:${slot.id}`
    : `${scheduleId}:${slot.id}`;
  const isOverbooked = slot.overbooked;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    disabled: !isOverbooked,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const formatTime = (dateString: string) => {
    return moment(dateString).format("HH:mm");
  };

  return (
    <div
      ref={setDraggableRef}
      style={style}
      {...(isOverbooked ? listeners : {})}
      {...(isOverbooked ? attributes : {})}
      className={`
        p-3 rounded-lg border-2 transition-all duration-200 flex flex-col justify-between w-full
        ${
          isOverbooked
            ? "bg-red-50 border-red-200 text-red-800 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            : "bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
        }
        ${isDragging ? "opacity-50 scale-95 rotate-2" : ""}
        ${isOverbooked ? "transform hover:scale-[1.02]" : ""}
      `}
      title={
        isOverbooked ? "Drag to transfer appointment" : "Available for booking"
      }
      role={isOverbooked ? "button" : undefined}
      tabIndex={isOverbooked ? 0 : undefined}
      aria-label={
        isOverbooked
          ? `Occupied appointment slot from ${formatTime(
              slot.start
            )} to ${formatTime(slot.end)}. Press space or enter to drag.`
          : `Available appointment slot from ${formatTime(
              slot.start
            )} to ${formatTime(slot.end)}`
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {formatTime(slot.start)} - {formatTime(slot.end)}
          </span>
          <span className="text-xs opacity-75 font-medium">
            {isOverbooked ? "🔴 Occupied" : "🟢 Available"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isOverbooked ? (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {isDragging && <span className="text-xs">📤</span>}
            </div>
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </div>
      </div>
      {/* {slot.comment && (
        <p className="text-xs mt-1 opacity-75 truncate border-t pt-1">
          💬 {slot.comment}
        </p>
      )} */}
    </div>
  );
};
