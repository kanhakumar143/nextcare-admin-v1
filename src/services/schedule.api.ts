import axios from "axios";
import { api } from "@/lib/axios";

export const deleteSingleSchedule = async (scheduleId: string) => {
  try {
    const response = await api.delete(`schedule/single/${scheduleId}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const deleteBulkSchedules = async (scheduleIds: string[]) => {
  try {
    const response = await api.delete(`schedule/bulk-delete`, {
      data: scheduleIds,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const deleteBulkSlots = async (slotIds: string[]) => {
  try {
    const response = await api.delete(`schedule/slot/bulk-delete`, {
      data: slotIds,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
