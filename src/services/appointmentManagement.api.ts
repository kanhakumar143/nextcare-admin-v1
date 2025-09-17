import { api, axios } from "@/lib/axios";
const headers = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const updateAppointmentBySlots = async (payload: {
  appointment_id: string;
  new_slot_id: string;
}) => {
  try {
    const { data } = await api.put(
      `appointment-management/update-slot`,
      payload,
      headers
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to fetch practitioner");
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const shiftAppointmentSlots = async (payload: {
  schedule_id: string;
  delay_minutes: number;
}) => {
  try {
    const { data } = await api.put(`schedule/shift-slots`, payload, headers);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to fetch practitioner");
    }
    throw new Error("Unexpected error occurred.");
  }
};
