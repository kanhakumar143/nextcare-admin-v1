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

export interface Question {
  type: QuestionType;
  specialty_id: string;
  question: string;
  note: string | null;
  updated_at: string;
  id: string;
  title: string;
  options: QuestionOption[];
  created_at: string;
}

export interface ServicesState {
  data: Question[];
  loading: boolean;
  error: string | null;
}
