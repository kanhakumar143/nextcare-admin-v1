import { adminSliceInitialStates } from "@/types/admin.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: adminSliceInitialStates = {
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
