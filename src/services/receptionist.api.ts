import { ORG_TENANT_ID } from "@/config/authKeys";
import { api, axios } from "@/lib/axios";
import {
  AppointmentBookingPayload,
  CreateNewAppointmentPayload,
  medicationReminderCreatePayload,
  MedicationReminderUpdatePayload,
  RedeemRewardPointsPayload,
  UpdateRedeemRewardPointsPayload,
  UserPatientProfileResponse,
} from "@/types/receptionist.types";

export const checkInPatient = async (payload: {
  appointment_id: string;
  user_id: string;
}) => {
  try {
    const response = await api.post("appointment/checked-in", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to checkin patient";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const fetchDecodeQrDetails = async ({
  accessToken,
  staff_id,
}: {
  accessToken: string | null;
  staff_id: string | null;
}) => {
  const payload = {
    encrypted: accessToken,
    practitioner_user_id: staff_id,
  };
  try {
    const response = await api.post("appointment/qr/decode", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const UpdatePatientAccountStatus = async (
  payload: UserPatientProfileResponse
) => {
  const { data } = await api.put("user/patient", payload);
  return data;
};

export const fetchDecodeQrDetailsForReports = async ({
  accessToken,
}: {
  accessToken: string | null;
}) => {
  const payload = {
    code: accessToken,
  };
  try {
    const response = await api.post(
      "visit-note/print-all-reports-by-qr",
      payload
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAppointmentEprescriptionDetails = async (
  appointmentId: string
) => {
  try {
    const response = await api.get(
      `medication-request-by-appointment-id?appointment_id=${appointmentId}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAllPricingPlansByTenant = async () => {
  try {
    const response = await api.get(
      `subscription-plans/by-tenant/?tenant_id=${ORG_TENANT_ID}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAllMedicationReminders = async (payload: string) => {
  try {
    const response = await api.get(
      `medication-reminders/patient/?patient_id=${payload}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const editMedicationReminders = async (
  payload: MedicationReminderUpdatePayload
) => {
  try {
    const response = await api.put(`medication-reminders/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const makeCheckinForDoctor = async (payload: {
  practitioner_id: string;
  status: string;
}) => {
  try {
    const response = await api.post(`attendance/check-in`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const makeCheckoutForDoctor = async (payload: {
  practitioner_id: string;
}) => {
  try {
    const response = await api.post(`attendance/check-out`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const makeBreakForDoctor = async (payload: {
  practitioner_id: string;
  break_type: string; // EMERGENCY, PERSONAL, MEDICAL, LUNCH, OTHER
  reason: string;
}) => {
  try {
    const response = await api.post(`attendance/break/start`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const endBreakForDoctor = async (payload: {
  practitioner_id: string;
  notes: string;
}) => {
  try {
    const response = await api.post(`attendance/break/end`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const reminderForMedication = async (
  payload: medicationReminderCreatePayload
) => {
  try {
    const response = await api.post(`medication-reminders/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getAiSuggestedSlots = async (referalId: string) => {
  try {
    const response = await api.post(
      `ai/referrals/recommend-slots/${referalId}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const getRecentSuggestedSlots = async (referalId: string) => {
  try {
    const response = await api.get(`appointment_referral/slots/${referalId}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateAppointmentReferral = async (
  payload: {
    booked_appointment_id?: string;
    payment_id?: string;
    status?: string;
  },
  referalId: string
) => {
  try {
    const response = await api.put(
      `appointment_referral/${referalId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const createNewAppointment = async (
  payload: CreateNewAppointmentPayload
) => {
  try {
    const response = await api.post(`appointment/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const redeemRewardPoints = async (
  payload: RedeemRewardPointsPayload
) => {
  try {
    const response = await api.post(`reward-redemption/`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const updateRedeemedRewardPoints = async (
  payload: UpdateRedeemRewardPointsPayload,
  redemption_id: string
) => {
  try {
    const response = await api.put(
      `reward-redemption/?redemption_id=${redemption_id}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const checkPatientExistence = async (email_phone: string) => {
  try {
    const response = await api.get(`user/exists?email_phone=${email_phone}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const fetchUserDetails = async (user_id: string) => {
  try {
    const response = await api.get(`user/?user_id=${user_id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const bookAppointmentWalkInByClinic = async (
  payload: AppointmentBookingPayload
) => {
  try {
    const response = await api.post(`appointment/by-admin`, payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to update appointment referral";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};
