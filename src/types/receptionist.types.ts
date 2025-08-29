import { ExtendedDoctorData, DoctorData } from "./admin.types";

// Lab test order interface
export interface LabTestOrder {
  id: string;
  appointment_id: string;
  test_name?: string; // adjust based on API response
  status?: string;
  created_at?: string;
  // add more fields if returned by API
}

// Availability status interface
export interface AvailabilityStatus {
  practitioner_id: string;
  practitioner_name: string;
  date: string;
  availability_status: "AVAILABLE" | "UNAVAILABLE" | string;
  attendance_details: any | null;
  break_details: any | null;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: string | null;
}

// Practitioner identifier interface
export interface PractitionerIdentifier {
  system: string;
  value: string;
}
export type AttendanceStatus =
  | "PRESENT"
  | "ON_LEAVE"
  | "HALF_DAY"
  | "ABSENT"
  | "ON_BREAK";

// Practitioner name interface
export interface PractitionerName {
  use: string | null;
  text: string | null;
  family: string;
  given: string[];
  prefix: string[];
  suffix: string | null;
  period: any | null;
}

// Practitioner telecom interface
export interface PractitionerTelecom {
  system: "phone" | "email" | string;
  value: string;
  use: "mobile" | "work" | "home" | string;
  rank: number | null;
  period: any | null;
}

// Practitioner qualification interface
export interface PractitionerQualification {
  year?: string;
  degree?: string;
  institution?: string;
}

// License details interface
export interface LicenseDetails {
  number?: string;
  issued_by?: string;
  expiry?: string;
}

// Tenant contact interface
export interface TenantContact {
  name: string;
  telecom: {
    system: string;
    value: string;
    use: string | null;
  }[];
  address: any | null;
  purpose: any | null;
}

// Tenant interface
export interface Tenant {
  id: string;
  active: boolean;
  name: string;
  alias: string[];
  contact: TenantContact[];
}

// User interface for practitioner
export interface PractitionerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_role: "doctor" | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant: Tenant;
}

// Complete practitioner data interface
export interface PractitionerAttendanceData {
  practitioner_display_id: string;
  identifiers: PractitionerIdentifier[];
  name: PractitionerName;
  telecom: PractitionerTelecom[];
  gender: "male" | "female" | "other" | string;
  birth_date: string;
  qualification: PractitionerQualification[];
  is_active: boolean;
  license_details: LicenseDetails;
  profile_picture_url: string;
  license_url: string;
  e_sign_path: string | null;
  status: "verified" | "unverified" | string;
  id: string;
  user_id: string;
  user: PractitionerUser;
  availability_status: AvailabilityStatus;
}

// Appointment interface with lab orders
export interface AppointmentDetails {
  description: string;
  id: string;
  status: string;
  slot_info: {
    start: string;
    end: string;
    id: string;
    status: string;
  };
  patient_id: string;
  service_category: {
    text: string;
  }[];
  lab_test_orders?: LabTestOrder[]; // added lab orders
  appointment_display_id?: string;
  appointment_type?: string | null;
  class_concept?: {
    system: string | null;
    code: string | null;
    display: string | null;
    text: string;
  };
  created?: string;
  created_at?: string;
  cancellation_date?: string | null;
  cancellation_details?: string | null;
  cancellation_reason?: string | null;
  end?: string | null;
  identifiers?: any;
  minutes_duration?: number | null;
  note?: string | null;
  occurrence_changed?: any;
  originating_appointment_id?: any;
  previous_appointment_id?: any;
  priority?: any;
  qr_code_url?: string;
  reasons?: any[];
  recurrence_id?: any;
  recurrence_template?: any[];
  replaces?: any[];
  requested_period?: any;
  service_specialty?: { system?: string; code?: string; display?: string };
  slot_id?: string;
  specialty?: any;
  specialty_id?: string;
  step_count?: number;
  subject_reference?: any;
  supporting_information?: any;
  updated_at?: string;
  virtual_service?: any;
  vital_observations?: any;
}

// Patient verification
export interface PatientVerification {
  id: number;
  verification_status: "verified" | "unverified" | string;
  method: string;
  verify_by?: string;
}

// Patient profile
export interface PatientProfile {
  birth_date?: string;
  gender?: string;
  gov_url_path?: string;
  verifications: PatientVerification[];
}

// Patient details
export interface PatientDetails {
  name: string;
  phone: string;
  user_id: string;
  patient_profile: PatientProfile;
}

// Main QR decoded details
export interface qrDecodedDetails {
  patient: PatientDetails;
  appointment: AppointmentDetails;
  time_alert: string;
}

// Staff slice state
export interface staffSliceInitialState {
  patientDetails: qrDecodedDetails | null;
  medicationDetailsForReminder: any | null;
  appoinmentDetails: any | null;
  practitionerAttendanceData: ExtendedDoctorData | null;
  practitionersList: DoctorData[];
  practitionersLoading: boolean;
  practitionersError: string | null;
  imageModalVisible: boolean;
  checkinSuccessModalVisible: boolean;
  patientVerifiedModalVisible: boolean;
  storedAccessToken: string | null;
  loading?: boolean;
  error?: string | null;
  downloadReportsData: any | null;
  scanQrMessage?: string | null;
  editingMedicationReminder: MedicationReminder | null;
}

export type medicationReminderCreatePayload = {
  patient_id: string;
  medication_request_id: string;
  medication_id: string;
  reminder_time: string;
  start_date: string;
  end_date: string;
  frequency_per_day: number | string;
  created_by_id?: string;
  creator_role: string;
};

// User profile response
export interface UserPatientProfileResponse {
  user_id: string;
  patient_profile: PatientProfile;
}

export interface EPrescriptionDetails {
  patient: {
    id: string;
    patient_display_id: string;
    gender: "male" | "female" | "other";
    user: {
      name: string;
      email: string;
      phone: string;
      user_role: "patient" | string;
    };
  };
  practitioner: {
    id: string;
    practitioner_display_id: string;
    user: {
      name: string;
      is_active: boolean;
      email: string;
      phone: string | null;
      user_role: "doctor" | string;
      tenant: {
        id: string;
        name: string;
        active: boolean;
        contact: {
          name: string | null;
          telecom: {
            system: string | null;
            value: string | null;
          }[];
        }[];
      };
    };
  };
  medication_request: {
    id: string;
    status: "active" | "completed" | "cancelled" | string;
    intent: "order" | "proposal" | string;
    authored_on: string; // ISO datetime
    note: string;
    dispense_request: string | null;
    medication_display_id?: string | null;
    medications: Medication[];
  };
  visit_note: {
    id: string;
    summary: string;
    follow_up: string;
    chief_complaint: string;
    critical: boolean;
    provisional_diagnosis: string;
    consultation_mode: string;
    followup_date: string;
    criticality_remark: string;
    assessments: Assessment[];
    care_plans: CarePlan[];
  };
  lab_tests:
    | {
        authored_on: string | null;
        intent: string;
        test_display: string;
        priority: string;
        status: string;
        notes: {
          text: string;
          time: string | null;
        }[];
      }[]
    | null;
}

interface Medication {
  id?: string;
  name: string;
  form: string;
  route: string;
  frequency: string;
  strength: string;
  duration: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  dosage_instruction: string;
  note?: {
    info: string;
  };
}

interface Assessment {
  id: string;
  code: string | null;
  description: string;
  severity: "mild" | "moderate" | "severe" | string;
}

interface CarePlan {
  id: string;
  plan_type: string;
  goal: string;
  detail: string;
}

// Medication Reminder Interface
export interface MedicationReminder {
  medication: {
    medication_request_id: string;
    name: string;
    form: string;
    route: string;
    frequency: string;
    strength: string;
    duration: string;
    timing: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
      night: boolean;
    };
    dosage_instruction: string;
    note: string | null;
    id: string;
  };
  patient_id: string;
  medication_request_id: string;
  medication_id: string;
  reminder_time: string;
  start_date: string;
  end_date: string;
  frequency_per_day: number;
  id: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string | null;
  created_by_id: string;
  creator_role: string;
}

export interface MedicationReminderUpdatePayload {
  id: string;
  reminder_time: string;
  start_date: string;
  end_date: string;
  frequency_per_day: number;
}
