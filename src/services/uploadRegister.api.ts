import { api, axios } from "@/lib/axios";
import { createNewUserPayload } from "@/types/receptionist.types";

interface UploadImageResponse {
  uploaded_files: {
    doc_type: string;
    file_url: string;
  }[];
  status: number;
}

interface fetchDetailsPayload {
  file_url: string;
}

export const uploadImageToAws = async (
  payload: FormData
): Promise<UploadImageResponse> => {
  try {
    const response = await api.post(`upload/image`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to upload image";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAdhaarDetails = async (payload: fetchDetailsPayload) => {
  try {
    const response = await api.post(`auth/aadhar/scan`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch Adhaar details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getDlDetails = async (payload: fetchDetailsPayload) => {
  try {
    const response = await api.post(`auth/DL/scan`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch DL details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAbhaDetails = async (payload: fetchDetailsPayload) => {
  try {
    const response = await api.post(`auth/abha/scan`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch ABHA details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getPassportDetails = async (payload: fetchDetailsPayload) => {
  try {
    const response = await api.post(`auth/passport/scan`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch Passport details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const createNewUser = async (payload: createNewUserPayload) => {
  try {
    const response = await api.post(`auth/register`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch Passport details";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
