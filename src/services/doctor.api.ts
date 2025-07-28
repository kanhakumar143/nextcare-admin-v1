import { api, axios } from "@/lib/axios";
import { VisitSummaryPayload } from "@/types/doctor.types";

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
    const response = await api.get(`appointment/single/${appointment_id}`);

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
