import { api, axios } from "@/lib/axios";
import { AIAnalysisPayload } from "@/types/ai.types";

export const submitQuestionnairesAnswerToAi = async (
  payload: AIAnalysisPayload
) => {
  try {
    const { data } = await api.post(`ai/gemini/summarize-medical-qa`, payload);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Failed to submit questionnaire answers to AI";

      throw new Error(errorMessage);
    }
    throw new Error(
      "An unexpected error occurred while processing the request."
    );
  }
};
