// Lab test order interface
export interface LabTestOrder {
  id: string;
  appointment_id: string;
  test_name?: string; // adjust based on API response
  status?: string;
  created_at?: string;
  // add more fields if returned by API
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
  class_concept?: { system: string | null; code: string | null; display: string | null; text: string };
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
  appoinmentDetails: any | null;
  imageModalVisible: boolean;
  checkinSuccessModalVisible: boolean;
  patientVerifiedModalVisible: boolean;
  storedAccessToken: string | null;
  loading?: boolean;
  error?: string | null;
  scanQrMessage?: string | null;
}

// User profile response
export interface UserPatientProfileResponse {
  user_id: string;
  patient_profile: PatientProfile;
}
