export interface VisitCarePlan {
  plan_type: string;
  goal: string;
  detail: string;
}

export interface VisitAssessment {
  description: string;
  severity: "mild" | "moderate" | "severe";
}

export interface VisitNote {
  summary: string;
  follow_up: string;
  visit_care_plan: VisitCarePlan;
  visit_assessment: VisitAssessment;
}

export interface VitalReading {
  id?: string;
  patient_id?: string;
  vital_def_id?: string;
  appointment_id?: string;
  recorded_by_id?: string | null;
  vital_definition?: {
    id?: string;
    name: string;
    code: string;
    loinc_code?: string;
    system?: string;
    unit?: string;
    data_type?: string;
    normal_min?: string | number;
    normal_max?: string | number;
    component_definitions?: any;
    multiple_results_allowed?: boolean;
    is_active?: boolean;
    tenant_id?: string;
  };
  value: {
    value?: number | string;
    diastolic?: number | string;
    systolic?: number | string;
  };
  is_abnormal?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface doctorSliceInitialStates {
  confirmConsultationModalVisible: boolean;
  EprescriptionDetails: EPrescription | null;
  ConfirmReviewPrescriptionModalVisible: boolean;
  editVitalsModalVisible: boolean;
  patientQueueList: any[];
  singlePatientDetails: any | null;
  patientQueueListLoading: boolean;
  patientQueueListError: string | null;
  consultationData: ConsultationData | null;
  labTests: LabTest[];
  patientAppointmentHistory: any[];
  medicines: Medication[];
  currentVitals: VitalReading[];
  visitNote: VisitNote;
}

interface VitalObservation {
  vital_definition: {
    name: string;
  };
  value: {
    value: string;
  };
}

interface PreQa {
  questionary: {
    question: string;
  };
  answer: string | null;
}

export interface AppointmentDetails {
  appointment_display_id: string;
  vital_observations: VitalObservation[];
  pre_qa: PreQa[];
}

export interface LabTest {
  notes: string;
  test_display: string;
  intent:
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  priority: "routine" | "urgent" | "asap" | "stat";
}

export interface Medicine {
  name: string;
  composition: string;
  form: string;
  route: string;
  dosage: string;
  days: string;
  instructions: string;
  dosage_instructions?: string;
  notes?: string;
}

export interface ConsultationData {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    contact: string;
  };
  appointmentId: string | string[];
  appointmentDetails: AppointmentDetails | null;
  consultationSummary: string;
  consultationStatus: string;
  labTests: LabTest[];
  medicines: Medicine[];
  vitalObservations: VitalObservation[];
  preConsultationQA: PreQa[];
}

export interface PatientInfo {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  date: string;
  status: string;
  phone: string;
  age: number;
  bloodGroup: string;
  service_category: {
    text: string;
  }[];
}

export interface MedicationTiming {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

export interface MedicationNote {
  info: string;
}

// export interface Medication {
//   name: string;
//   form: string;
//   route: string;
//   frequency: string;
//   strength: string;
//   duration: string;
//   timing: MedicationTiming;
//   dosage_instruction: string;
//   note?: MedicationNote;
// }

export interface MedicationRequest {
  intent: "order" | "plan" | "proposal" | "reflex-order"; // standard FHIR values
  status: "active" | "completed" | "on-hold" | "cancelled"; // standard FHIR values
  note: string;
}

export interface VisitSummaryPayload {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  medication_request: MedicationRequest;
  medication: Medication[];
  visit_note: {
    summary: string;
    follow_up: string;
  };
  visit_care_plan: {
    plan_type: string;
    goal: string;
    detail: string;
  };
  visit_assessment: {
    code?: {
      system: string;
      code: string;
      display: string;
    };
    description: string;
    severity: "mild" | "moderate" | "severe";
  };
  lab_test_order: {
    test_code: string;
    test_display: string;
    status:
      | "active"
      | "completed"
      | "verified"
      | "confirmed"
      | "cancelled"
      | "entered-in-error"
      | "unknown";
    intent:
      | "proposal"
      | "plan"
      | "order"
      | "original-order"
      | "reflex-order"
      | "filler-order"
      | "instance-order"
      | "option";
    priority: "routine" | "urgent" | "asap" | "stat";
  }[];
  lab_test_note: {
    practitioner_id: string;
    author_name: string;
    text: string;
  }[];
}

export interface EPrescription {
  patient: {
    id: string;
    birth_date: string;
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
      email: string;
      phone: string | null;
      user_role: "doctor" | string;
    };
    licence_details: {
      number: string;
      issued_by: string;
    };
  };
  medication_request: {
    id: string;
    status: "active" | "completed" | "cancelled" | string;
    intent: "order" | "proposal" | string;
    authored_on: string; // ISO datetime
    note: string;
    dispense_request: string | null;
    medication_display_id: string;
    medications: Medication[];
  };
  visit_note: {
    id: string;
    summary: string;
    follow_up: string;
    assessments: Assessment[];
    care_plans: CarePlan[];
  };
}

export interface Medication {
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

export interface Vital {
  id: string; // observation id
  value: {
    value: number | string | undefined; // numeric or string value
    systolic: number | string | undefined;
    diastolic: number | string | undefined;
  };
  is_abnormal: boolean;
}

export interface VitalsResponse {
  vitals: Vital[];
}
