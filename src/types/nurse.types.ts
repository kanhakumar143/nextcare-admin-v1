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
  note?: string;
  tenant_service_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitQuestionPayload {
  questionary_id: string;
  appointment_id: string;
  answer: any;
  note: {
    submitted_by: string;
  };
}
