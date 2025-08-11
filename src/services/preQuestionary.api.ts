import { api, axios } from "@/lib/axios";

export const getQuestionsBySpecialty = async (specialtyId: string | null) => {
  try {
    const response = await api.get(`pre-questionary/by-specialty`, {
      params: { specialty_id: specialtyId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch specialties";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
