import axios from "axios";
import { 
  CreateScheduleRequest, 
  CreateScheduleResponse, 
  CreateSlotRequest, 
  CreateSlotResponse, 
  GenerateSlotsRequest, 
  GenerateSlotsResponse 
} from "../types/schedule.type";

const API_BASE = "/schedule";

// ---- Create Schedule ----
export const createSchedule = async (
  data: CreateScheduleRequest
): Promise<CreateScheduleResponse> => {
  const res = await axios.post(`${API_BASE}/`, data);
  return res.data;
};

// ---- Create Single Slot ----
export const createSlot = async (
  data: CreateSlotRequest
): Promise<CreateSlotResponse> => {
  const res = await axios.post(`${API_BASE}/slot`, data);
  return res.data;
};

// ---- Generate Bulk Slots ----
export const generateSlots = async (
  data: GenerateSlotsRequest
): Promise<GenerateSlotsResponse> => {
  const res = await axios.post(`${API_BASE}/generate-slots`, data);
  return res.data;
};
