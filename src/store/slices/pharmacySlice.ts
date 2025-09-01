import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PharmacyState {
  selectedPrescriptionData: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PharmacyState = {
  selectedPrescriptionData: null,
  isLoading: false,
  error: null,
};

const pharmacySlice = createSlice({
  name: "pharmacy",
  initialState,
  reducers: {
    setSelectedPrescriptionData: (state, action: PayloadAction<any>) => {
      state.selectedPrescriptionData = action.payload;
    },
    clearSelectedPrescriptionData: (state) => {
      state.selectedPrescriptionData = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedPrescriptionData,
  clearSelectedPrescriptionData,
  setLoading,
  setError,
  clearError,
} = pharmacySlice.actions;

export default pharmacySlice.reducer;
