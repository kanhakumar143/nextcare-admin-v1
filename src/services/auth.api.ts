import { api, axios } from "@/lib/axios";
import { LoginFormInputs } from "@/schemas/auth.schema";
import { generateAccessTokenPayload } from "@/types/auth.types";

export const loginUser = async (data: LoginFormInputs) => {
  try {
    const response = await api.post("auth/login", {
      phone_or_email: data.email,
      password: data.password,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Login failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const generateAccessToken = async (data: generateAccessTokenPayload) => {
  try {
    const response = await api.post("auth/token", data);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Token generation failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
