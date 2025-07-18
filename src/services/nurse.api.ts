import { api, axios } from "@/lib/axios";
import { BulkVitalsPayload } from "@/types/nurse.types";

export const fetchVitals = async () => {
  try {
    const { data } = await axios.get(`vital_definition/`);

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
