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

export const submitCompleteAppointmentSummaryToAi = async (
  appointmentId: string
) => {
  try {
    const payload = {
      appointment_id: appointmentId,
      pre_appointment_summary_text:
        "Chief Complaint: New symptoms. Risk Factors: Hypertension, occasional tobacco use.",
      vitals: {
        bp: "120/80",
        pulse: "88 bpm",
        temperature: "101 F",
        spo2: "97%",
      },
      chief_complaint: "Headache, fever, and occasional vomiting.",
      provisional_diagnosis: "Suspected malaria.",
      doctor_notes: "Ordered CBC and malaria test to confirm.",
      investigations: ["CBC", "Malaria Test"],
      medicines: ["Paracetamol 500mg", "ORS solution"],
    };

    const { data } = await api.post(
      `ai/gemini/complete-appointment-summary`,
      payload
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Failed to generate complete appointment summary";

      throw new Error(errorMessage);
    }
    throw new Error(
      "An unexpected error occurred while processing the request."
    );
  }
};
