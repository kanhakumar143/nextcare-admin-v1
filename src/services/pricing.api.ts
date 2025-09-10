import { api, axios } from "@/lib/axios";
import { PricingPayload, PricingResponse } from "@/types/pricing.types";

// ✅ Create Pricing
export async function createPricing(
  payload: PricingPayload
): Promise<PricingResponse> {
  try {
    const response = await api.post("service-pricing/", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "Failed to add pricing");
    }
    throw new Error("Unexpected error occurred while creating pricing.");
  }
}

// ✅ Get Pricing by SubService
export const getAllPricing = async (
  subServiceId: string
): Promise<PricingResponse[]> => {
  try {
    const response = await api.get("service-pricing/by-sub-service", {
      params: { sub_service_id: subServiceId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch pricing");
    }
    throw new Error("Unexpected error occurred while fetching pricing.");
  }
};

// ✅ Update Pricing
export const updatePricing = async (
  payload: PricingPayload
): Promise<PricingResponse> => {
  try {
    const response = await api.put("service-pricing/", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update pricing");
    }
    throw new Error("Unexpected error occurred while updating pricing.");
  }
};

// ✅ Delete Pricing
export const deletePricing = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete("service-pricing/", {
      params: { id },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "Failed to delete pricing");
    }
    throw new Error("Unexpected error occurred while deleting pricing.");
  }
};
