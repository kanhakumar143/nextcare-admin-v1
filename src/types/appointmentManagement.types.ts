import { Slot } from "@/types/scheduleSlots.types";

// Type for practitioners (doctor or lab technician)
export interface PractitionerData {
  id: string;
  name: string;
  practitioner_display_id?: string;
  user?: {
    name: string;
  };
}

// Props for slot-related components
export interface SlotComponentProps {
  slot: Slot;
  scheduleId: string;
  doctorId?: string;
}

// Active slot state for drag and drop
export interface ActiveSlotState {
  slot: Slot;
  scheduleId: string;
  doctorId?: string;
}
