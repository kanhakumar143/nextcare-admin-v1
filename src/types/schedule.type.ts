// ---- Schedule Types ----
export interface CreateScheduleRequest {
  actor_reference: string; // e.g. "Practitioner/123"
  planning_start: string;  // ISO datetime
  planning_end: string;    // ISO datetime
  comment?: string;
  specialty_id: string;
}

export interface CreateScheduleResponse {
  id: string;
  actor_reference: string;
  planning_start: string;
  planning_end: string;
  comment?: string;
  specialty_id: string;
  created_at: string;
  updated_at: string;
}

// ---- Slot Types ----
export interface CreateSlotRequest {
  schedule_id: string;
  status: "free" | "busy";
  start: string; // ISO datetime
  end: string;   // ISO datetime
  overbooked: boolean;
  comment?: string;
}

export interface CreateSlotResponse {
  id: string;
  schedule_id: string;
  status: "free" | "busy";
  start: string;
  end: string;
  overbooked: boolean;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// ---- Generate Slots ----
export interface GenerateSlotsRequest {
  schedule_id: string;
  total_slots: number;
  interval_gap: number; // in minutes
}

export interface GenerateSlotsResponse {
  schedule_id: string;
  total_slots: number;
  interval_gap: number;
  slots: CreateSlotResponse[];
}
