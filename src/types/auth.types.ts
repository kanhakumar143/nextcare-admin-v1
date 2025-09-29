import { string } from "zod";

export interface generateAccessTokenPayload {
  user_id: string | null;
  user_type: string | null;
}

export interface authSliceInitialState {
  userLoginDetails: userLoginTypes;
  captureDtls: ScannedData | null;
  docDtls: any | null;
  checkUserPhoneNumber: string | null;
}

export interface ScannedData {
  name?: string;
  dob?: string;
  gender?: string;
  // aadhar_id?: string;
  // abha_address?: string | null;
  abha_number?: string | null;
  // license_number?: string | null;
  father_name?: string | null;
  issue_date?: string | null;
  valid_till?: string | null;
  address?: string | null;
  blood_group?: string | null;
  passport_number?: string | null;
  document_value?: string | null;
}

export interface userLoginTypes {
  user_id: string | null;
  user_role: string | null;
  practitioner_id?: string | null;
  access_token: string | null;
  org_id?: string | null;
}
