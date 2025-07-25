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
  nurseStepCompleted: {
    step1: boolean;
    step2: boolean;
  };
  isConfirmModal: boolean;
}

const initialState: NurseState = {
  qrDtls: null,
  isConfirmModal: false,
  nurseStepCompleted: {
    step1: false,
    step2: false,
  },
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
    setNurseStepCompleted: (
      state,
      action: PayloadAction<{ step1?: boolean; step2?: boolean }>
    ) => {
      state.nurseStepCompleted = {
        step1: action.payload.step1 ?? state.nurseStepCompleted.step1,
        step2: action.payload.step2 ?? state.nurseStepCompleted.step2,
      };
    },
  },
});

export const { setQrDetails, setConfirmModal, setNurseStepCompleted } =
  nurseSlice.actions;
export default nurseSlice.reducer;
