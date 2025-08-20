import { fetchDetailsPayload, UploadImageResponse } from "@/types/labTechnician.type";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
import axios from "axios";

// Upload image to AWS
export const uploadImageToAws = async (
  payload: FormData
): Promise<UploadImageResponse> => {
  const { data } = await axios.post(`${baseUrl}upload/image`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Update Lab Test Order with report URL
export const updateLabTestOrder = async (payload: {
  id: string;
  test_code: string;
  test_display: string;
  status: string;
  intent: string;
  priority: string;
  test_report_path: string;
}) => {
  const { data } = await axios.put(`${baseUrl}lab-test-order/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};
