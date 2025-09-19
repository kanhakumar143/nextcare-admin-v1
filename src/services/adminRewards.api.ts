import { api, axios } from "@/lib/axios";

export const searchRewardPrograms = async (
  tenant_id: string,
  name?: string
) => {
  try {
    const queryParams = new URLSearchParams({ tenant_id });
    if (name) {
      queryParams.append("name", name);
    }

    const response = await api.get(
      `reward-programs/search?${queryParams.toString()}`
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch reward programs";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
