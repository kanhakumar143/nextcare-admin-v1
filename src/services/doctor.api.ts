import { api, axios } from "@/lib/axios";

export const getAssignedAppointments = async (
  practitioner_id: string | null
) => {
  try {
    const response = await api.get(
      `appointment_participant/by-practitioner?practitioner_id=213f3516-e2ba-4269-92c8-a7833fe03a74`
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
