import { api, axios } from "@/lib/axios";
import { Symptom } from "@/types/symptoms.type";

export const getSymptomsByTenantId = async (tenantId: string): Promise<Symptom[]> => {
  try {
    const response = await api.get(`service-symptom/tenant`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch symptoms";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export async function createSymptom(
  data: Omit<Symptom, "id" | "created_at" | "updated_at">
): Promise<Symptom> {
  try {
    const response = await api.post("/service-symptom", data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to create symptom";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
}
