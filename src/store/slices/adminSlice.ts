import {
  AdminSliceInitialStates,
  ExtendedDoctorData,
  ExtendedNurseData,
} from "@/types/admin.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AdminSliceInitialStates = {
  isLocationAddModal: false,
  editDoctorData: null,
  editNurseData: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setIsLocationAddModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLocationAddModal = action.payload;
    },
    setEditDoctorData: (
      state,
      action: PayloadAction<ExtendedDoctorData | null>
    ) => {
      state.editDoctorData = action.payload;
    },
    clearEditDoctorData: (state) => {
      state.editDoctorData = null;
    },
    setEditNurseData: (
      state,
      action: PayloadAction<ExtendedNurseData | null>
    ) => {
      state.editNurseData = action.payload;
    },
    clearEditNurseData: (state) => {
      state.editNurseData = null;
    },
  },
});

export const {
  setIsLocationAddModalOpen,
  setEditDoctorData,
  clearEditDoctorData,
  setEditNurseData,
  clearEditNurseData,
} = adminSlice.actions;
export default adminSlice.reducer;
