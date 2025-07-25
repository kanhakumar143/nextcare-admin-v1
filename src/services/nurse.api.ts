import { api, axios } from "@/lib/axios";
import {
  AnswerQuestionnairePayload,
  BulkVitalsPayload,
} from "@/types/nurse.types";

export const fetchVitals = async () => {
  try {
    const { data } = await api.get(`vital_definition/`);

    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch vitals";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const submitBulkVitals = async (payload: BulkVitalsPayload) => {
  try {
    const response = await api.post("bulk-observations", payload);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to submit vitals";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const fetchAllQuestionnairesByTenantServiceId = async (
  payload: string
) => {
  try {
    const { data } = await api.get(
      `pre-questionary/by-service?tenant_service_id=${payload}`
    );

    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch questionnaires";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const submitQuestionariesAnswersBulk = async (
  payload: AnswerQuestionnairePayload[]
) => {
  try {
    const { data } = await api.post(
      `appointment-questionary-answers/bulk`,
      payload
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch questionnaires";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
