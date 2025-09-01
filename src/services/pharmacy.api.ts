import { api, axios } from "@/lib/axios";

export const fetchAllAppointmentsByDate = async (payload: string) => {
  //yyyy-mm-dd format
  try {
    const { data } = await api.get(
      `appointment/all-appointment-details-pharmacist/?date=${payload}`
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch appointments";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
