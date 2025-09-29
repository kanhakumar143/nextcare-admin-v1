import { PractitionerData } from "@/types/doctorNew.types";
import { qrDecodedDetails } from "./receptionist.types";

export interface VisitCarePlan {
  id?: string;
  plan_type: string;
  goal: string;
  detail: string;
  followup_date?: string | null;
  consultation_mode?: string;
}

export interface VisitAssessment {
  id?: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
}

export interface VisitNote1 {
  id?: string;
  summary: string;
  follow_up: string;
  criticality_remark: string;
  chief_complaint: string;
  provisional_diagnosis: string;
  remarks: string;
  visit_care_plan: VisitCarePlan;
  visit_assessment: VisitAssessment;
  critical: boolean;
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
  appointmentIdTemp: string | null;
  aiSuggestedMedications: any[];
  aiSuggestedLabTests: any[];
  ConfirmReviewPrescriptionModalVisible: boolean;
  editVitalsModalVisible: boolean;
  patientQueueList: any[];
  labTestsReviewData: any[];
  singlePatientDetails: any | null;
  patientQueueListLoading: boolean;
  patientQueueListError: string | null;
  consultationData: ConsultationData | null;
  labTests: LabTest[];
  patientAppointmentHistory: any[];
  medicines: Medication[];
  currentVitals: VitalReading[];
  practitionerData: PractitionerData | null;
  practitionerDataLoading: boolean;
  practitionerDataError: string | null;
  consultationMode: "new" | "edit";
  isEditingConsultation: boolean;
  visitNote: VisitNote1;
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
  id?: string;
  isEditing?: boolean;
  addedFromAI?: boolean;
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
  patient: {
    patient_display_id: string;
    user: {
      name: string;
      phone: string;
    };
  };
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
  id?: string;
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
    id?: string;
    summary: string;
    follow_up: string;
    chief_complaint: string;
    critical: boolean;
    provisional_diagnosis: string;
    consultation_mode: string;
    followup_date: string | null;
    criticality_remark: string;
  };
  visit_care_plan?: {
    id?: string;
    plan_type: string;
    goal: string;
    detail: string;
  };
  visit_assessment?: {
    id?: string;
    code?: {
      system: string;
      code: string;
      display: string;
    };
    description: string;
    severity: "mild" | "moderate" | "severe";
  };
  lab_test_order: {
    id?: string;
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
  lab_test_note?: {
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
      is_active: boolean;
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
      is_active: boolean;
      tenant: {
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

export interface Medication {
  id?: string;
  medication_request_id?: string;
  name: string;
  addedFromAI?: boolean;
  isEditing?: boolean;
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

export interface Observation {
  patient_id: string;
  vital_def_id: string;
  appointment_id: string;
  recorded_by_id: string | null;
  value: ObservationValue;
  is_abnormal: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  vital_definition: VitalDefinition;
}

export interface ObservationValue {
  value?: number;
  systolic?: number;
  diastolic?: number;
}

export interface VitalDefinition {
  name: string;
  code: string;
  loinc_code: string;
  system: string;
  unit: string;
  data_type: "quantity" | "component";
  normal_min: number;
  normal_max: number;
  component_definitions: Record<
    string,
    ComponentDefinition | string | number | boolean
  >;
  multiple_results_allowed: boolean;
  is_active: boolean;
  id: string;
  tenant_id: string;
}

export interface ComponentDefinition {
  measurement_method?: string;
  site?: string;
  measurement_site?: string;
  loinc_code?: string;
  normal_min?: number;
  normal_max?: number;
}

export interface QuestionaryAnswer {
  appointment_id: string;
  questionary_id: string;
  answer: string;
  note: QuestionaryAnswerNote;
  id: string;
  created_at: string;
  updated_at: string;
  questionary: Questionary;
}

export interface QuestionaryAnswerNote {
  submitted_by: string;
}

export interface Questionary {
  title: string;
  question: string;
  options: QuestionaryOption[];
  note: string | null;
  type:
    | "multiple_choice"
    | "yes_no"
    | "radio"
    | "textarea"
    | "multi_select"
    | "number"
    | "text"
    | "date"
    | "time"
    | "datetime"
    | "slider";
  id: string;
  tenant_service_id: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionaryOption {
  label: string;
  value: string;
}

export interface LabTestOrder {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_code: string;
  test_display: string;
  status:
    | "active"
    | "completed"
    | "verified"
    | "confirmed"
    | "cancelled"
    | "entered-in-error"
    | "unknown"
    | string;
  intent:
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option"
    | string;
  priority: "routine" | "urgent" | "asap" | "stat" | string;
  id: string;
  authored_on: string;
  created_at: string;
  updated_at: string;
  notes: LabTestNote[];
}

export interface LabTestNote {
  lab_test_order_id: string;
  practitioner_id: string;
  author_name: string;
  text: string;
  id: string;
  time: string;
}

export interface VisitNote {
  appointment_id: string;
  practitioner_id: string;
  patient_id: string;
  summary: string;
  follow_up: string;
  id: string;
  created_at: string;
  updated_at: string;
  assessments: Assessment[];
  care_plans: CarePlan[];
}

export interface Prescription {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  status:
    | "active"
    | "on-hold"
    | "cancelled"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "draft"
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
  dispense_request: DispenseRequest | null;
  note: string;
  id: string;
  medication_display_id: string;
  authored_on: string;
  created_at: string;
  updated_at: string | null;
  medications: Medication[];
}

export interface DispenseRequest {
  validityPeriod?: {
    start?: string;
    end?: string;
  };
  numberOfRepeatsAllowed?: number;
  quantity?: {
    value: number;
    unit: string;
  };
  expectedSupplyDuration?: {
    value: number;
    unit: string;
  };
}
