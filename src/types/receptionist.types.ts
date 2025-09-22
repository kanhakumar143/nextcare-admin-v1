import { ExtendedDoctorData, DoctorData } from "./admin.types";

// Simplified types for the new API response structure
export interface SimpleSlot {
  id: string;
  schedule_id: string;
  status: "free" | "booked" | "cancelled" | string;
  start: string;
  end: string;
  overbooked: boolean;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface SimpleSchedule {
  planning_start: string;
  planning_end: string;
  comment: string;
  practitioner_id: string;
  specialty_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  slots: SimpleSlot[];
  flag: string | null;
}

export interface SimpleTenant {
  id: string;
  active: boolean;
  name: string;
  alias: string[];
  contact: {
    name: string;
    telecom: {
      system: string;
      value: string;
      use: string | null;
    }[];
    address: any | null;
    purpose: any | null;
  }[];
}

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant: SimpleTenant;
}

export interface SimplePatient {
  id: string;
  patient_display_id: string;
  gender: string;
  birth_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user: SimpleUser;
}

export interface SimplePractitioner {
  practitioner_display_id: string;
  identifiers: {
    system: string;
    value: string;
  }[];
  name: {
    use: string;
    text: string;
    family: string;
    given: string[];
    prefix: string[];
    suffix: string | null;
    period: any | null;
  };
  telecom: {
    system: string;
    value: string;
    use: string;
    rank: number;
    period: any | null;
  }[];
  gender: string;
  birth_date: string;
  qualification: {
    year: string;
    degree: string;
    institution: string;
  }[];
  is_active: boolean;
  license_details: {
    expiry: string;
    number: string;
    issued_by: string;
  };
  profile_picture_url: string;
  license_url: string;
  e_sign_path: string | null;
  status: string;
  service_specialty_id: string | null;
  id: string;
  user_id: string;
  user: SimpleUser;
  availability_status: any | null;
}

export interface SimpleServiceSpecialty {
  system: string;
  code: string;
  display: string;
  specialty_label: string;
  description: string;
  is_active: boolean;
  id: string;
  tenant_service_id: string;
  created_at: string;
  updated_at: string;
}

export interface SimpleSubService {
  tenant_service_id: string;
  name: string;
  description: string;
  active: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  pricings: any[];
}

// Main simplified API response interface
export interface SimplifiedRegularSlotsResponse {
  reason: string;
  status: string;
  schedules: SimpleSchedule[];
  patient: SimplePatient;
  practitioner: SimplePractitioner;
  service_specialty: SimpleServiceSpecialty;
  sub_services: SimpleSubService[];
}

// Appointment booking interfaces
export interface AvailableSlot {
  slot_id: string;
  start: string;
  end: string;
  schedule_id: string;
  practitioner_id: string;
  schedule_panning_start: string;
  schedule_planning_end: string;
  rule_score: number;
  predicted_wait_time: number;
  cancellation_risk: number;
  final_score: number;
  reason: string[];
}

export interface ReferralData {
  referral: {
    id: string;
    reason: string;
    status: string;
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
    practitioner: {
      practitioner_display_id: string;
      name: {
        text: string;
        prefix: string[];
      };
    };
    service_specialty: {
      id: string;
      display: string;
      specialty_label: string;
      description: string;
    };
  };
  available_slots: AvailableSlot[];
  scoring_basis: {
    rule_based: string;
    ml_prediction: string;
    final_score: string;
    reasons: string;
  };
  sub_services?: SubService[];
}

export interface BookAppointmentProps {
  referralId: string;
}

// Regular slots interfaces
export interface RegularSlot {
  id: string;
  schedule_id: string;
  status: "free" | "booked" | "cancelled" | string;
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
  practitioner_id: string;
  specialty_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  slots: RegularSlot[];
  flag: string | null;
}

export interface RecentSuggestedSlotsData {
  reason: string;
  status: string;
  schedules: Schedule[];
  patient: {
    id: string;
    patient_display_id: string;
    gender: string;
    birth_date: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      user_role: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      tenant: {
        id: string;
        active: boolean;
        name: string;
        alias: string[];
        contact: {
          name: string;
          telecom: {
            system: string;
            value: string;
            use: string | null;
          }[];
          address: any | null;
          purpose: any | null;
        }[];
      };
    };
  };
  practitioner: {
    practitioner_display_id: string;
    identifiers: {
      system: string;
      value: string;
    }[];
    name: {
      use: string;
      text: string;
      family: string;
      given: string[];
      prefix: string[];
      suffix: string | null;
      period: any | null;
    };
    telecom: {
      system: string;
      value: string;
      use: string;
      rank: number;
      period: any | null;
    }[];
    gender: string;
    birth_date: string;
    qualification: {
      year: string;
      degree: string;
      institution: string;
    }[];
    is_active: boolean;
    license_details: {
      expiry: string;
      number: string;
      issued_by: string;
    };
    profile_picture_url: string;
    license_url: string;
    e_sign_path: string | null;
    status: string;
    service_specialty_id: string | null;
    id: string;
    user_id: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      user_role: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      tenant: {
        id: string;
        active: boolean;
        name: string;
        alias: string[];
        contact: {
          name: string;
          telecom: {
            system: string;
            value: string;
            use: string | null;
          }[];
          address: any | null;
          purpose: any | null;
        }[];
      };
    };
    availability_status: any | null;
  };
  service_specialty: {
    system: string;
    code: string;
    display: string;
    specialty_label: string;
    description: string;
    is_active: boolean;
    id: string;
    tenant_service_id: string;
    created_at: string;
    updated_at: string;
  };
  sub_services: SubService[];
}

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
  id?: string;
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
  referallId: string | null;
  health_points: {
    points_balance: number;
    id: string;
  } | null;
  paymentDetails: PendingOrdersResponse | null;
  subscriptionDetails: Subscription | null;
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

interface Subscription {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: string; // e.g., 'active', 'expired'
  allowances: Allowance[];
}

interface Allowance {
  subscription_id: string;
  feature_id: string;
  total_quantity: number;
  remaining_quantity: number;
  id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  feature: Feature;
}

interface Feature {
  name: string;
  description: string;
  feature_type: "consultation" | "lab" | string;
  quantity: number;
  discount_percent: number | null;
  sub_service_id: string;
  id: string;
  plan_id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  sub_service: SubService;
}

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

export interface PendingOrdersResponse {
  pending_orders: PendingOrder[];
  total_amount: number;
  currency: string;
  order_count: number;
}

export interface PendingOrder {
  patient_id: string;
  order_type: "lab_test" | string; // extend with other order types if needed
  status: "pending" | "completed" | "cancelled" | string;
  appointment_id: string;
  lab_test_order_id: string | null;
  sub_service_id: string;
  amount: string;
  currency: string;
  id: string;
  created_at: string;
  updated_at: string | null;
  sub_service: SubService;
}

export interface SubService {
  tenant_service_id: string;
  name: string;
  description: string;
  active: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  pricings: Pricing[];
}

export interface Pricing {
  sub_service_id: string;
  base_price: string;
  currency: string;
  tax_id: string;
  active: boolean;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNewAppointmentPayload {
  step_count?: number;
  id?: string;
  patient_id: string;
  status: string;
  sub_service_ids?: string[];
  description?: string;
  start?: string; // ISO datetime string
  end?: string; // ISO datetime string
  specialty_id?: string;
  participants?: {
    actor_reference: string;
    status: string;
  }[];
  reasons?: {
    concept_text: string;
    reference_resource_type: string;
    reference_resource_id: string;
    reference_display: string;
  }[];
  class_concept?: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
    text: string;
  };
  service_category?: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
    text: string;
  }[];
  service_id?: string | null;
  slot_id?: string | null;
  slot_info?: {
    start?: string | null;
    end?: string | null;
    id?: string | null;
    status: string;
    overbooked?: boolean | null;
  };
  recurrence_template?: {
    recurrence_type: "daily" | "weekly" | "monthly";
    occurrence_count: number;
    weekly_template?: {
      monday?: boolean;
      tuesday?: boolean;
      wednesday?: boolean;
      thursday?: boolean;
      friday?: boolean;
      saturday?: boolean;
      sunday?: boolean;
      week_interval: number;
    };
  };
}

export interface RedeemRewardPointsPayload {
  patient_id: string;
  points: number | string;
  status: string;
  meta_data: {
    note: string;
  };
}

export interface UpdateRedeemRewardPointsPayload {
  points: number | string;
  status: string;
  meta_data?: {
    note: string;
  };
}
