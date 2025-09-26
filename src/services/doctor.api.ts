import { api, axios } from "@/lib/axios";
import { VisitSummaryPayload, VitalsResponse } from "@/types/doctor.types";
import { referConsultationPayload } from "@/types/doctorNew.types";

export const getAssignedAppointments = async (
  practitioner_id: string | null
) => {
  try {
    const response = await api.get(
      `appointment_participant/by-practitioner?practitioner_id=${practitioner_id}`
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Token generation failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAssignedAppointmentDtlsById = async (
  appointment_id: string | string[]
) => {
  try {
    const response = await api.get(
      `appointment/appointment-details-practitioner/${appointment_id}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Token generation failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const submitVisitSummary = async (payload: VisitSummaryPayload) => {
  try {
    const response = await api.post(`visit-note/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Token generation failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateVisitSummary = async (payload: VisitSummaryPayload) => {
  try {
    const response = await api.put(`visit-note/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Token generation failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateAppointmentStatus = async (payload: {
  id: string;
  status: string;
}) => {
  try {
    const response = await api.put(`appointment/update-status`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment status";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateGeneralVitals = async (payload: VitalsResponse) => {
  try {
    const response = await api.put(`bulk-observations/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error?.message || "Failed to fetch e-prescription details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getEprescriptionDetails = async (appt_id: string | string[]) => {
  try {
    const response = await api.get(
      `medication-request-by-appointment-id?appointment_id=${appt_id}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error?.message || "Failed to fetch e-prescription details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateEprescriptionStatus = async (payload: any) => {
  try {
    const response = await api.put(`medication-request/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update e-prescription";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getPractitionerDetails = async (user_id: string) => {
  try {
    const response = await api.get(`user_practitioner`, {
      params: { user_id },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to get practitioner details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updatePractitionerDetails = async (payload: any) => {
  try {
    const response = await api.put(`practitioner/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update practitioner details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const forwardReferralConsultation = async (
  payload: referConsultationPayload
) => {
  try {
    const response = await api.post(`appointment_referral/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update practitioner details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getMeetingURL = async (appointment_id: string) => {
  try {
    const response = await api.get(`meeting/appointment/${appointment_id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch meeting URL";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getTranscriptionText = async (payload: any) => {
  try {
    const response = await api.post(`ai/groq-audio/transcribe`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch meeting URL";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const analyzeConversation = async (payload: {
  conversation: string;
  appointment_id: string;
  groq_transcription_id: string;
}) => {
  try {
    const response = await api.post(`ai/gemini/analyze-conversation`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to analyze conversation";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const suggestMedicalRecommendations = async (payload: {
  chief_complaint: string;
  provisional_diagnosis: string;
  doctor_notes: string;
}) => {
  try {
    const response = await api.post(
      `ai/gemini/suggest-medical-recommendations`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error?.message || "Failed to suggest medical recommendations";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
