import { api, axios } from "@/lib/axios";
const headers = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const updateAppointmentBySlots = async (payload: {
  appointment_id: string;
  new_slot_id: string;
  reason: string;
  changed_by: string;
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
  reason: string;
  changed_by: string;
}) => {
  try {
    const { data } = await api.put(
      `appointment-management/shift-slots`,
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

export const searchAppointments = async (name: string, date: string) => {
  try {
    const { data } = await api.get(
      `appointment-management/appointment-by-patient?name=${name}&date=${date}`,
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

export const shiftAppointmentSlotsBydays = async (payload: {
  schedule_id: string;
  shift_value: number | string; //days
  reason: string;
  changed_by: string;
}) => {
  try {
    const { data } = await api.put(
      `appointment-management/shift-slots-day`,
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
