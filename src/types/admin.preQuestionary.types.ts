export enum QuestionType {
  MultiSelect = "multi_select",
  MultipleChoice = "multiple_choice",
  Radio = "radio",
  Text = "text",
  Textarea = "textarea",
  YesNo = "yes_no",
  Number = "number",
  Date = "date",
  Time = "time",
  DateTime = "datetime",
  Slider = "slider",
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionNote {
  mandatory: boolean;
  instruction: string;
}

// This is what you send to add a new question
export interface AddQuestionRequest {
  specialty_id: string;
  title: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  note: QuestionNote | null;
}

// This is the full Question object you might receive from backend (includes metadata)
export interface Question extends AddQuestionRequest {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ServicesState {
  data: Question[];
  loading: boolean;
  error: string | null;
}
