import { AdminSliceInitialStates } from "@/types/admin.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AdminSliceInitialStates = {
  isLocationAddModal: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setIsLocationAddModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLocationAddModal = action.payload;
    },
  },
});

export const { setIsLocationAddModalOpen } = adminSlice.actions;
export default adminSlice.reducer;
