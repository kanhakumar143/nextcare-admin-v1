import {
  qrDecodedDetails,
  staffSliceInitialState,
} from "@/types/receptionist.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: staffSliceInitialState = {
  patientDetails: null,
  patientVerifiedModalVisible: false,
  imageModalVisible: false,
  checkinSuccessModalVisible: false,
  storedAccessToken: null,
};

const receptionistSlice = createSlice({
  name: "auth",
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
  },
});

export const {
  setDecodedDetails,
  setQrToken,
  setCheckinSuccessModal,
  setVerifiedPatientModal,
  setImageModalVisible,
} = receptionistSlice.actions;
export default receptionistSlice.reducer;
