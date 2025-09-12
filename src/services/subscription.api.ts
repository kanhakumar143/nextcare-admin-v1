// subscription.api.ts
import { api, axios } from "@/lib/axios";
import {
  PostSubscriptionPlan,
  GetSubscriptionPlan,
  GetSubscriptionPlansResponse,
  UpdateSubscriptionPlan,
} from "@/types/subscription.type";

// ✅ Create Subscription Plan
export async function createSubscriptionPlan(
  payload: PostSubscriptionPlan
): Promise<GetSubscriptionPlan> {
  try {
    const response = await api.post("subscription-plans/", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create subscription plan"
      );
    }
    throw new Error("Unexpected error occurred while creating subscription plan.");
  }
}

// ✅ Get Subscription Plans by Tenant
export const getSubscriptionPlansByTenant = async (
  tenantId: string
): Promise<GetSubscriptionPlansResponse> => {
  try {
    const response = await api.get("subscription-plans/by-tenant/", {
      params: { tenant_id: tenantId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch subscription plans"
      );
    }
    throw new Error("Unexpected error occurred while fetching subscription plans.");
  }
};

// ✅ Update Subscription Plan
export const updateSubscriptionPlan = async (
  payload: UpdateSubscriptionPlan // ✅ use correct type
): Promise<GetSubscriptionPlan> => {
  try {
    const response = await api.put("subscription-plans/", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update subscription plan"
      );
    }
    throw new Error("Unexpected error occurred while updating subscription plan.");
  }
};

// ✅ Delete Subscription Plan
export const deleteSubscriptionPlan = async (
  id: string
): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete("subscription-plans/?plan_id=", {
      params: { id },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete subscription plan"
      );
    }
    throw new Error("Unexpected error occurred while deleting subscription plan.");
  }
};
