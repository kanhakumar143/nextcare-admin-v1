import { api, axios } from "@/lib/axios";
import { PricingPayload, PricingResponse } from "@/types/pricing.types";

const tenant_id = "4896d272-e201-4dce-9048-f93b1e3ca49f";

export async function createPricing(
  payload: PricingPayload
): Promise<PricingResponse> {
  try {
    const response = await api.post("service-specialty-pricing/", {
      ...payload,
      tenant_id,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to add pricing");
    }
    throw new Error("Unexpected error occurred.");
  }
}

export const getAllPricing = async (tenantId: string) => {
  try {
    const response = await api.get(`service-specialty-pricing/by-tenant`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to fetch pricing");
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updatePricing = async (
  payload: PricingPayload
): Promise<PricingResponse> => {
  try {
    const response = await api.put(`service-specialty-pricing/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.message || "Failed to update pricing");
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const deletePricing = async (id: string) => {
  try {
    const response = await api.delete(`service-specialty-pricing/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to delete pricing";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
