"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { DraggableSlot } from "./DraggableSlot";
import { SlotComponentProps } from "@/types/appointmentManagement.types";

export const DroppableSlot: React.FC<SlotComponentProps> = ({
  slot,
  scheduleId,
  doctorId,
}) => {
  const droppableId = doctorId
    ? `${doctorId}:${scheduleId}:${slot.id}`
    : `${scheduleId}:${slot.id}`;
  const isOverbooked = slot.overbooked;

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: droppableId,
    disabled: isOverbooked,
  });

  return (
    <div
      ref={setDroppableRef}
      className={`
        ${
          isOver && !isOverbooked
            ? "ring-2 ring-blue-400 ring-offset-2 rounded-lg"
            : ""
        }
      `}
    >
      <DraggableSlot slot={slot} scheduleId={scheduleId} doctorId={doctorId} />
      {isOver && !isOverbooked && (
        <div className="absolute inset-0 border-2 border-blue-400 bg-blue-100/50 border-dashed rounded-lg flex items-center justify-center z-10">
          <div className="text-xs font-bold text-blue-600 animate-pulse bg-white px-2 py-1 rounded shadow">
            📥 Drop here to transfer
          </div>
        </div>
      )}
    </div>
  );
};
