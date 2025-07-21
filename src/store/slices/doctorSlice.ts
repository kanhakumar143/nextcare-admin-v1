import { doctorSliceInitialStates } from "@/types/doctor.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: doctorSliceInitialStates = {
  confirmConsultationModalVisible: false,
};

const doctorSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setConfirmConsultationModal: (state, action: PayloadAction<boolean>) => {
      state.confirmConsultationModalVisible = action.payload;
    },
  },
});

export const { setConfirmConsultationModal } = doctorSlice.actions;
export default doctorSlice.reducer;
