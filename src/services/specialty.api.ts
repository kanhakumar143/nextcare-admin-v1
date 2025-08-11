// services/specialty.api.ts
import { api, axios } from "@/lib/axios";
import { Specialty } from "@/types/specialty.type";

export const createSpecialty = async (
  data: Omit<Specialty, "code" | "system" | "description">
) => {
  const payload: Specialty = {
    ...data,
    code: data.specialty_label.substring(0, 4).toUpperCase(),
    system: "http://example.org/service-specialty",
    display: data.specialty_label,
    description: `${data.specialty_label} description`,
  };

  try {
    const response = await api.post("specialty/", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to add specialty";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
