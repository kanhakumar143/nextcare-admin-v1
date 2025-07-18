import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NurseState {
  qrDtls: null | {
    appointment: {
      slot_info: {
        start: string;
        end: string;
      };
      id: string;
      service_category: {
        text: string;
      }[];
      status: string;
      description: string;
    };
    patient: {
      user_id: string;
      phone: string;
      name: string;
      patient_profile: {
        id: string;
        gender: string;
      };
    };
  };

  isConfirmModal: boolean;
}

const initialState: NurseState = {
  qrDtls: null,
  isConfirmModal: false,
};

export const nurseSlice = createSlice({
  name: "nurse",
  initialState,
  reducers: {
    setQrDetails: (state, action) => {
      state.qrDtls = action.payload;
    },
    setConfirmModal: (state, action: PayloadAction<boolean>) => {
      state.isConfirmModal = action.payload;
    },
  },
});

export const { setQrDetails, setConfirmModal } = nurseSlice.actions;
export default nurseSlice.reducer;
