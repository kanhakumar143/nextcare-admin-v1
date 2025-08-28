import {
  qrDecodedDetails,
  staffSliceInitialState,
  PractitionerAttendanceData,
} from "@/types/receptionist.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";
import { toast } from "sonner";
import { Medication } from "@/types/doctor.types";

// Async thunk to fetch QR details
export const fetchQrDetailsAsync = createAsyncThunk(
  "receptionist/fetchQrDetails",
  async (
    payload: { accessToken: string; staff_id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchDecodeQrDetails(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch QR details");
    }
  }
);

const initialState: staffSliceInitialState = {
  patientDetails: null,
  appoinmentDetails: null,
  medicationDetailsForReminder: null,
  practitionerAttendanceData: null,
  patientVerifiedModalVisible: false,
  imageModalVisible: false,
  checkinSuccessModalVisible: false,
  storedAccessToken: null,
  loading: false,
  error: null,
  downloadReportsData: null,
  scanQrMessage: null,
};

const receptionistSlice = createSlice({
  name: "receptionist",
  initialState,
  reducers: {
    setDecodedDetails: (
      state,
      action: PayloadAction<qrDecodedDetails | null>
    ) => {
      state.patientDetails = action.payload;
      state.appoinmentDetails = action.payload?.appointment || null;
    },
    setPractitionerAttendanceData: (
      state,
      action: PayloadAction<PractitionerAttendanceData | null>
    ) => {
      state.practitionerAttendanceData = action.payload;
    },
    setQrToken: (state, action: PayloadAction<string | null>) => {
      state.storedAccessToken = action.payload;
    },
    setCheckinSuccessModal: (state, action: PayloadAction<boolean>) => {
      state.checkinSuccessModalVisible = action.payload;
    },
    setImageModalVisible: (state, action: PayloadAction<boolean>) => {
      state.imageModalVisible = action.payload;
    },
    setVerifiedPatientModal: (state, action: PayloadAction<boolean>) => {
      state.patientVerifiedModalVisible = action.payload;
    },
    setDownloadReportsData: (state, action: PayloadAction<any | null>) => {
      state.downloadReportsData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.scanQrMessage = null;
    },
    setMedicationDetailsForReminder: (
      state,
      action: PayloadAction<any | null>
    ) => {
      state.medicationDetailsForReminder = action.payload;
    },
    clearPractitionerAttendanceData: (state) => {
      state.practitionerAttendanceData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQrDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQrDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // Populate both patientDetails and appoinmentDetails
          state.patientDetails = action.payload.data;
          state.appoinmentDetails = action.payload.data.appointment || null;
          state.error = null;
          state.scanQrMessage = null;
        } else {
          state.error = action.payload.message;
          state.scanQrMessage = action.payload.message;
          state.patientDetails = null;
          state.appoinmentDetails = null;
        }
      })
      .addCase(fetchQrDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.patientDetails = null;
        state.appoinmentDetails = null;
        toast.error("Couldn’t fetch details!");
      });
  },
});

export const {
  setDecodedDetails,
  setPractitionerAttendanceData,
  setQrToken,
  setCheckinSuccessModal,
  setVerifiedPatientModal,
  setImageModalVisible,
  setMedicationDetailsForReminder,
  clearError,
  setDownloadReportsData,
  clearPractitionerAttendanceData,
} = receptionistSlice.actions;

export default receptionistSlice.reducer;
