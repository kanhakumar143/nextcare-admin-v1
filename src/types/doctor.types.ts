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

export interface doctorSliceInitialStates {
  confirmConsultationModalVisible: boolean;
  ConfirmReviewPrescriptionModalVisible: boolean;
  patientQueueList: any[];
  singlePatientDetails: any | null;
  patientQueueListLoading: boolean;
  patientQueueListError: string | null;
  consultationData: ConsultationData | null;
  labTests: LabTest[];
  medicines: Medication[];
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
  testName: string;
  testDescription: string;
  comments: string;
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

export interface Medication {
  name: string;
  form: string;
  route: string;
  frequency: string;
  strength: string;
  duration: string;
  timing: MedicationTiming;
  dosage_instruction: string;
  note?: MedicationNote;
}

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
}
