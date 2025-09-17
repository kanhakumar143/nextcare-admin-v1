"use client";

import React from "react";
import { DroppableSlot } from "./DroppableSlot";
import { SlotComponentProps } from "@/types/appointmentManagement.types";

export const SlotTile: React.FC<SlotComponentProps> = ({
  slot,
  scheduleId,
  doctorId,
}) => {
  return (
    <div className="relative">
      <DroppableSlot slot={slot} scheduleId={scheduleId} doctorId={doctorId} />
    </div>
  );
};
