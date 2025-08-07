export interface staffSliceInitialState {
  patientDetails: qrDecodedDetails | null;
  imageModalVisible: boolean;
  checkinSuccessModalVisible: boolean;
  patientVerifiedModalVisible: boolean;
  storedAccessToken: string | null;
  loading?: boolean;
  error?: string | null;
  scanQrMessage?: string | null;
}

export interface qrDecodedDetails {
  patient: {
    name: string;
    phone: string;
    user_id: string;

    patient_profile: {
      birth_date: string;
      gender: string;
      gov_url_path: string;
      verifications: {
        id: number;
        method: string;
        verification_status: string;
        verify_by: string;
      }[];
    };
  };
  appointment: {
    description: string;
    id: string;
    status: string;
    slot_info: {
      start: string;
      id: string;
      status: string;
      end: string;
    };
    patient_id: string;
    service_category: {
      text: string;
    }[];
  };
  time_alert: string;
}

export interface PatientVerification {
  id: number;
  verification_status: "verified" | "unverified" | string;
  method: string;
}

export interface PatientProfile {
  verifications: PatientVerification[];
}

export interface UserPatientProfileResponse {
  user_id: string;
  patient_profile: PatientProfile;
}
