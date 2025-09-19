import { api, axios } from "@/lib/axios";
import { CreateRewardRequest, Reward } from "@/types/reward.types";

export const createReward = async (
  rewardData: CreateRewardRequest
): Promise<Reward> => {
  try {
    const response = await api.post("reward-programs/", rewardData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to create reward";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

