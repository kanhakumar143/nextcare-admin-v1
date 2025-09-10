import { api, axios } from "@/lib/axios";
import { SubService, CreateSubServiceDto } from "@/types/subServices.type";

// Create a new sub-service
export async function createSubService(
  payload: CreateSubServiceDto
): Promise<SubService> {
  try {
    const response = await api.post("sub-service/", payload); // ✅ trailing slash
    return response.data; // backend returns SubService with ID
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to create sub-service");
    }
    throw new Error("Unexpected error occurred.");
  }
}

// Update an existing sub-service
export async function updateSubService(
  id: string,
  payload: CreateSubServiceDto
): Promise<SubService> {
  try {
    const response = await api.put(`sub-service/${id}/`, payload); // ✅ trailing slash
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to update sub-service");
    }
    throw new Error("Unexpected error occurred.");
  }
}

// Get all sub-services for a given service
export async function getSubServicesByServiceId(
  serviceId: string
): Promise<SubService[]> {
  try {
    const response = await api.get(
      `sub-service/by-service?service_id=${serviceId}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to fetch sub-services");
    }
    throw new Error("Unexpected error occurred.");
  }
}
