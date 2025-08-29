
// import { EHRCreatePayload, EHRResponse } from "@/types/ehr.type";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;





// Create EHR record (POST to ehr/)
// export const createEHR = async (payload: EHRCreatePayload): Promise<EHRResponse> => {
//   const { data } = await axios.post(`${BASE_URL}ehr/`, payload, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   return data;
// };

export const getEHRsByPatient = async (patientId: string) => {
  const res = await axios.get(`${BASE_URL}ehr/by-patient/?patient_id=${patientId}`);
  return res.data;
};