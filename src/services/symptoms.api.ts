import { api, axios } from "@/lib/axios";
import { Symptom } from "@/types/symptoms.type";

export const getSymptomsByTenantId = async (tenantId: string)  => {
  try {
    const response = await api.get(`service-symptom/tenant`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch symptoms";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

// export async function createSymptom(
//   data: Omit<Symptom, "code" | "system" | "description">
// ): Promise<Symptom> {
//   try {
//     const response = await api.post("/service-symptom", data);
//     return response.data;
//   } catch (error: any) {
//     if (axios.isAxiosError(error)) {
//       const message = error?.message || "Failed to create symptom";
//       throw new Error(message);
//     }
//     throw new Error("Unexpected error occurred.");
//   }
// }

export const createSymptom = async(
  data : Omit<Symptom, "code" | "system" | "description">
  ) => {
    const payload : Symptom = {
      ...data,
      code: data.display.substring(0, 4).toUpperCase(),
      system: "http://example.org/service-symptom",
      description: `${data.display} description`,
    };
    try{ 
      const response = await api.post("service-symptom/", payload);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error?.message || "Failed to create symptom";
        throw new Error(message);
      }
      throw new Error("Unexpected error occurred.");
    }
  };

  export const updateSymptomStatus = async (symptom: Symptom, id: string) =>{
    try{
      const response = await api.put("service-symptom/", symptom, {
        params: {id},
      });
      return response.data;
    }catch (error: any) {
       if (axios.isAxiosError(error)) {
      const message = error.message || "Failed to update symptom status";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
