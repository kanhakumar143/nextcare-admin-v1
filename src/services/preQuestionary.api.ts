import { api, axios } from "@/lib/axios";
import { AddQuestionRequest, Question } from "@/types/admin.preQuestionary.types";

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


export const addPreQuestionary = async (question: AddQuestionRequest): Promise<Question> => {
  try {
    const response = await api.post(`pre-questionary/`, question);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to add question";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};


export const updatePreQuestionary = async (
  id: string,
  question: AddQuestionRequest
): Promise<Question> => {
  try {
    const response = await api.put(`pre-questionary/`, question);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update question";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
