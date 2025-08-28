export interface VitalValue {
  value?: number;
}

export interface VitalInput {
  vital_def_id: string;
  value?: VitalValue;
  is_abnormal: boolean;
}

export interface BulkVitalsPayload {
  patient_id: string;
  appointment_id: string;
  recorded_by_id?: string | null;
  vitals: VitalInput[];
}

export interface AnswerQuestionnairePayload {
  appointment_id: string;
  questionary_id: string;
  answer: string;
  note: {
    submitted_by: string;
  };
}

interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  title: string;
  question: string;
  type:
    | "multi_select"
    | "multiple_choice"
    | "radio"
    | "slider"
    | "text"
    | "textarea"
    | "yes_no"
    | "number"
    | "date"
    | "time"
    | "datetime";
  options: QuestionOption[];
  note?: {
    instruction?: string;
    mandatory?: boolean;
  };
  tenant_service_id: string;
  created_at: string;
  updated_at: string;
  answer: string | null;
}

export interface SubmitQuestionPayload {
  questionary_id: string;
  appointment_id: string | undefined;
  answer: any;
  note: {
    submitted_by: string;
  };
}

export interface NurseInitialState {
  qrDtls: null | {
    appointment: {
      slot_info: {
        start: string;
        end: string;
      };
      id: string;
      service_category: {
        text: string;
      }[];
      status: string;
      description: string;
      source: string;
    };
    patient: {
      user_id: string;
      phone: string;
      name: string;
      patient_profile: {
        id: string;
        gender: string;
      };
    };
  };
  nurseStepCompleted: {
    step1: boolean;
    step2: boolean;
  };
  isConfirmModal: boolean;
  preAppQuestionnaires: {
    loading: boolean;
    error: null | string;
    response: {
      data: Question[];
      id: string | null;
    };
  };
}
