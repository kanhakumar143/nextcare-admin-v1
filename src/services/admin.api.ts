// services/admin.api.ts

import axios from "axios";
import {
  CreateLocationPayload,
  AddLocationResponse,
  Location,
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
