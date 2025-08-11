import axios from "axios";
import { Symptom } from "@/types/symptoms.type";

const API_BASE = "/service-symptom";

export async function getSymptomsByTenantId(tenantId: string): Promise<{ data: Symptom[] }> {
  const response = await axios.get(`${API_BASE}/tenant`, {
    params: { tenant_id: tenantId },
  });
  return response.data;
}

export async function createSymptom(data: Omit<Symptom, "id" | "created_at" | "updated_at">): Promise<Symptom> {
  const response = await axios.post(API_BASE, data);
  return response.data;
}
