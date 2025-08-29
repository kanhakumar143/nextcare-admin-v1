import {
  qrDecodedDetails,
  staffSliceInitialState,
  PractitionerAttendanceData,
  MedicationReminder,
} from "@/types/receptionist.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";
import { getPractitionerByRole } from "@/services/admin.api";
import { toast } from "sonner";
import { Medication } from "@/types/doctor.types";
import { ExtendedDoctorData, DoctorData } from "@/types/admin.types";

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

// Async thunk to fetch practitioners by role
export const fetchPractitionersByRoleAsync = createAsyncThunk(
  "receptionist/fetchPractitionersByRole",
  async (role: "doctor" | "nurse", { rejectWithValue }) => {
    try {
      const response = await getPractitionerByRole(role);
      return response?.data || response || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch practitioners");
    }
  }
);

const initialState: staffSliceInitialState = {
  patientDetails: null,
  appoinmentDetails: null,
  medicationDetailsForReminder: null,
  practitionerAttendanceData: null,
  practitionersList: [],
  practitionersLoading: false,
  practitionersError: null,
  patientVerifiedModalVisible: false,
  imageModalVisible: false,
  checkinSuccessModalVisible: false,
  storedAccessToken: null,
  loading: false,
  error: null,
  downloadReportsData: null,
  scanQrMessage: null,
  editingMedicationReminder: null,
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
      action: PayloadAction<ExtendedDoctorData | null>
    ) => {
      state.practitionerAttendanceData = action.payload;
    },
    setPractitionersList: (state, action: PayloadAction<DoctorData[]>) => {
      state.practitionersList = action.payload;
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
      state.practitionersError = null;
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
    clearPractitionersList: (state) => {
      state.practitionersList = [];
    },
    setEditingMedicationReminder: (
      state,
      action: PayloadAction<MedicationReminder | null>
    ) => {
      state.editingMedicationReminder = action.payload;
    },
    clearEditingMedicationReminder: (state) => {
      state.editingMedicationReminder = null;
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
      })
      // Practitioners by role async thunk cases
      .addCase(fetchPractitionersByRoleAsync.pending, (state) => {
        state.practitionersLoading = true;
        state.practitionersError = null;
      })
      .addCase(fetchPractitionersByRoleAsync.fulfilled, (state, action) => {
        state.practitionersLoading = false;
        state.practitionersList = action.payload;
        state.practitionersError = null;
      })
      .addCase(fetchPractitionersByRoleAsync.rejected, (state, action) => {
        state.practitionersLoading = false;
        state.practitionersError = action.payload as string;
        state.practitionersList = [];
        toast.error("Failed to fetch practitioners!");
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
  setEditingMedicationReminder,
  clearEditingMedicationReminder,
} = receptionistSlice.actions;

export default receptionistSlice.reducer;
