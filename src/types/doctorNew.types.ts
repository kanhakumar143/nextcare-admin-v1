export interface ScenarioQuestion {
  scenario_title: string;
  scenario_question: string;
  associated_title: string;
  associated_question: string;
}

export interface SymptomQuestionary {
  question: string | ScenarioQuestion[];
  answer: string | object;
}
export interface QuestionarySymptomNCData {
  appointment_id?: string;
  id?: string;
  patient_id?: string;
  remark?: string;
  answer: string;
  nc_patient_data: {
    phone: string;
  };
  created_at: string;
  updated_at: string;
  expires_at: string;
  symptom_data: SymptomQuestionary[];
  ai_summary: null | string;
  diagnosis: null | string;
}

interface PreAppointmentQAAISummary {
  id: string;
  appointment_id: string;
  summary: string;
  key_findings: string[];
  summary_type: string;
  remark: {
    ai_model: string;
    total_questions: number;
    prompt_type: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AppointmentDtlsForDoctor {
  id: string;
  appointment_display_id: string;
  status: string;
  start: string | null;
  end: string | null;
  description: string;
  qr_code_url: string;
  patient: Patient;
  observations: Observation[];
  questionary_answers: QuestionaryAnswer[];
  slot: Slot;
  prescriptions: Prescription[];
  visit_notes: VisitNote[];
  cancellation_record: any;
  lab_test_orders: LabTestOrder[];
  source: string;
  symptom_data_nc: QuestionarySymptomNCData;
  pre_appointment_qa_ai_summaries: PreAppointmentQAAISummary[];
}

interface LabTestOrder {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_code: string;
  test_display: string;
  status: string;
  intent: string;
  priority: string;
  test_report_path?: string;
  id: string;
  authored_on: string;
  created_at: string;
  updated_at: string;
  notes: any[];
}

interface Patient {
  id: string;
  patient_display_id: string;
  gender: string;
  birth_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant?: {
    id: string;
    active: boolean;
    name: string;
    alias: string[];
    contact: Array<{
      name: string;
      telecom: Array<{
        system: string;
        value: string;
        use: string | null;
      }>;
      address: any;
      purpose: any;
    }>;
  };
}

interface Observation {
  patient_id: string;
  vital_def_id: string;
  appointment_id: string;
  recorded_by_id: string | null;
  value: Record<string, number>;
  is_abnormal: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  vital_definition: VitalDefinition;
}

interface VitalDefinition {
  name: string;
  code: string;
  loinc_code: string;
  system: string;
  unit: string;
  data_type: string;
  normal_min: number;
  normal_max: number;
  component_definitions: Record<string, any>;
  multiple_results_allowed: boolean;
  is_active: boolean;
  id: string;
  tenant_id: string;
}

interface QuestionaryAnswer {
  appointment_id: string;
  questionary_id: string;
  answer: string;
  note: {
    submitted_by: string;
  };
  id: string;
  created_at: string;
  updated_at: string;
  questionary: Questionary;
}

interface Questionary {
  title: string;
  question: string;
  options: Option[];
  note: string | null;
  type:
    | "text"
    | "textarea"
    | "number"
    | "yes_no"
    | "radio"
    | "multi_select"
    | "slider"
    | "date"
    | "time"
    | "datetime";
  id: string;
  tenant_service_id: string;
  created_at: string;
  updated_at: string;
}

interface Option {
  label: string;
  value: string;
}

interface Slot {
  id: string;
  identifiers: string | null;
  status: string;
  start: string;
  end: string;
  overbooked: boolean;
  comment: string;
}

interface Prescription {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  status: string;
  intent: string;
  dispense_request: any;
  note: string;
  id: string;
  medication_display_id: string;
  authored_on: string;
  created_at: string;
  updated_at: string | null;
  medications: Medication[];
}

interface Medication {
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
  note: {
    info: string;
  };
  id: string;
}

interface VisitNote {
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

interface Assessment {
  visit_note_id: string;
  code: string | null;
  description: string;
  severity: string;
  id: string;
}

interface CarePlan {
  visit_note_id: string;
  plan_type: string;
  goal: string;
  detail: string;
  id: string;
}

export interface PractitionerData {
  user_data: {
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
      contact: Array<{
        name: string;
        telecom: Array<{
          system: string;
          value: string;
          use: string | null;
        }>;
        address: any;
        purpose: any;
      }>;
    };
  };
  practitioner_data: {
    practitioner_display_id: string;
    identifiers: Array<{
      system: string;
      value: string;
    }>;
    name: {
      use: string | null;
      text: string | null;
      family: string;
      given: string[];
      prefix: string[];
      suffix: string | null;
      period: any;
    };
    telecom: Array<{
      system: string;
      value: string;
      use: string;
      rank: number | null;
      period: any;
    }>;
    gender: string;
    birth_date: string;
    qualification: Array<{
      year: string;
      degree: string;
      institution: string;
    }>;
    is_active: boolean;
    license_details: {
      expiry: string;
      number: string;
      issued_by: string;
    };
    profile_picture_url: string;
    license_url: string;
    e_sign_path: string | null;
    id: string;
    user_id: string;
  };
}
