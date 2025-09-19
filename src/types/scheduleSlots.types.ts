import { ExtendedDoctorData } from "./admin.types";

export interface Slot {
  appointments: {
    id: string;
    patient: {
      user: {
        name: string;
      };
    };
  }[];
  id: string;
  schedule_id: string;
  status: string;
  start: string;
  end: string;
  overbooked: boolean;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  planning_start: string;
  planning_end: string;
  comment: string;
  practitioner_id: string | null;
  specialty_id: string | null;
  id: string;
  created_at: string;
  updated_at: string;
  slots: Slot[];
  flag: string | null;
}

export interface Break {
  start: string;
  end: string;
  purpose: string;
}

export interface SlotSubmissionData {
  name: string | null;
  id?: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  recurring: string | null;
  holidays: string[] | null;
  leaves: string[] | null;
  breaks?: Break[];
  working_days?: string[] | null;
  is_active?: boolean | null;
  remark?: string | null;
  practitioner_id?: string | null;
  specialty_id?: string | null;
  use_template?: boolean | null;
}

// Search appointment types
export interface SearchAppointmentResult {
  id: string;
  patient_id: string;
  status: string;
  appointment_display_id: string;
  slot_info: {
    id: string;
    status: string;
    start: string;
    end: string;
    overbooked: boolean;
    comment: string;
  };
  patient: {
    id: string;
    patient_display_id: string;
    gender: string;
    birth_date: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  service_specialty?: {
    specialty_label: string;
    description: string;
  };
}

export interface ScheduleSlotsState {
  schedules: Schedule[];
  doctors: ExtendedDoctorData[];
  selectedPractitionerId: string | null;
  submissionData: SlotSubmissionData | null;
  isLoadingSchedules: boolean;
  isLoadingDoctors: boolean;
  error: string | null;
  doctorsError: string | null;
  // Search appointments state
  searchResults: SearchAppointmentResult[];
  isSearchingAppointments: boolean;
  searchError: string | null;
}
