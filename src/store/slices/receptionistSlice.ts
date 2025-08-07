import {
  qrDecodedDetails,
  staffSliceInitialState,
} from "@/types/receptionist.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";
import { act } from "react";
import { toast } from "sonner";

export const fetchQrDetailsAsync = createAsyncThunk(
  "receptionist/fetchQrDetails",
  async (
    payload: {
      accessToken: string;
      staff_id: string;
    },
    { rejectWithValue }
  ) => {
    setQrToken(payload.accessToken);
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
  patientVerifiedModalVisible: false,
  imageModalVisible: false,
  checkinSuccessModalVisible: false,
  storedAccessToken: null,
  loading: false,
  error: null,
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
    clearError: (state) => {
      state.error = null;
      state.scanQrMessage = null;
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
          state.patientDetails = action.payload.data;
          state.error = null;
        } else {
          state.error = action.payload.message;
          state.patientDetails = null;
          state.scanQrMessage = action.payload.message;
        }
      })
      .addCase(fetchQrDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.patientDetails = null;
        toast.error("Couldn’t fetch details!");
      });
  },
});

export const {
  setDecodedDetails,
  setQrToken,
  setCheckinSuccessModal,
  setVerifiedPatientModal,
  setImageModalVisible,
  clearError,
} = receptionistSlice.actions;
export default receptionistSlice.reducer;
