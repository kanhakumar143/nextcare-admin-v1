export interface AISubmitQuestionPayload {
  question: string;
  answer: any;
}

export interface AIAnalysisPayload {
  qa_data: AISubmitQuestionPayload[];
  summary_type: string;
  appointment_id: string;
}
