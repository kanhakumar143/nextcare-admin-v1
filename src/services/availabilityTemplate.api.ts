import { api } from "@/lib/axios";

export interface CreateAvailabilityTemplatePayload {
  name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  recurring: "daily" | "weekly" | "monthly";
  holidays: string[];
  leaves: string[];
  working_days: string[];
  service_specialty_id: string;
  is_active: boolean;
  remark: string;
}

export interface AvailabilityTemplateResponse {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  recurring: string;
  holidays: string[];
  leaves: string[];
  working_days: string[];
  service_specialty_id: string;
  is_active: boolean;
  remark: string;
  created_at: string;
  updated_at: string;
}

// Create availability template
export const createAvailabilityTemplate = async (
  payload: CreateAvailabilityTemplatePayload
): Promise<AvailabilityTemplateResponse> => {
  const response = await api.post("schedule-templates/", payload);
  return response.data;
};

// Get all availability templates
export const getAvailabilityTemplates = async (): Promise<
  AvailabilityTemplateResponse[]
> => {
  const response = await api.get("schedule-templates/");
  return response.data;
};

// Get availability template by ID
export const getAvailabilityTemplateById = async (
  id: string
): Promise<AvailabilityTemplateResponse> => {
  const response = await api.get(`/availability-templates/${id}`);
  return response.data;
};

// Update availability template
export const updateAvailabilityTemplate = async (
  id: string,
  payload: Partial<CreateAvailabilityTemplatePayload>
): Promise<AvailabilityTemplateResponse> => {
  const response = await api.put(`/availability-templates/${id}`, payload);
  return response.data;
};

// Delete availability template
export const deleteAvailabilityTemplate = async (id: string): Promise<void> => {
  await api.delete(`/availability-templates/${id}`);
};

// Create schedule from Doctor
export const createSchedule = async (payload: any) => {
  const response = await api.post("schedule/", payload);
  return response.data;
};

// Create Slots for Schedule
export const createSlots = async (payload: any) => {
  const response = await api.post("schedule/generate-slots", payload);
  return response.data;
};

export const getAllSchedules = async () => {
  const response = await api.get("schedule/?skip=0&limit=1000");
  return response.data;
};
