

import { api, axios } from "@/lib/axios";
import {
  CreateLocationPayload,
  AddLocationResponse,
  Location,
  AddServicePayload,
  AddDoctorPayload,
} from "@/types/admin.types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const ORGANIZATION_ID = "97c2fffa-9e2b-4e29-90af-a5a53190013d";

const headers = {
  headers: {
    "Content-Type": "application/json",
  },
};

// Fetch locations
export const getLocations = async (): Promise<Location[]> => {
  const res = await axios.get(
    `${baseUrl}get-locations-by-org?organization_id=${ORGANIZATION_ID}`,
    headers
  );
  return res.data?.data ?? [];
};

// Add a new location
export const addLocation = async (
  data: CreateLocationPayload
): Promise<AddLocationResponse> => {
  const payload = {
    ...data,
    organization_id: ORGANIZATION_ID, // Ensure org ID is sent
  };
  const res = await axios.post(`${baseUrl}org-location/`, payload, headers);
  return res.data?.data;
};


export const getServices = async () => {
  try{
    const {data} = await api.get(`tenant-service/tenant/fdff6c62-2ed2-4a32-afcd-276dbbb7ba8f`);
    return data;
  }catch(error: any){
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch services";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const addService = async (payload: AddServicePayload) => {
  try{
    const response = await api.post(`tenant-service/`, payload);
    return response.data;
  }catch(error: any){
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to add service";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
}


export const updateService = async (
  serviceId: string,
  payload: AddServicePayload
) => {
  try {
    const res = await api.put(`tenant-service/${serviceId}`, payload);
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message || "Failed to update service");
    }
    throw new Error("Unexpected error");
  }
};

export const deleteService = async (serviceId: string) => {
  try {
    const response = await api.delete(`tenant-service/${serviceId}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to delete service";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const addDoctor = async (payload: AddDoctorPayload) => {
  try{
    const response = await api.post(`practitioner/`, payload);
    return response.data;
  }catch(error: any){
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to add doctor";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
}
