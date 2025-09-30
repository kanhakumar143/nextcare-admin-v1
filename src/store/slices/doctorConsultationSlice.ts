import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DoctorConsultationState {
  aiSuggestedMedications: any[];
  aiSuggestedLabTests: any[];
}

const initialState: DoctorConsultationState = {
  aiSuggestedMedications: [],
  aiSuggestedLabTests: [],
};

const doctorConsultationSlice = createSlice({
  name: "doctorConsultation",
  initialState,
  reducers: {
    setAiSuggestedLabTests: (state, action: PayloadAction<any[]>) => {
      state.aiSuggestedLabTests = action.payload;
    },
    setAiSuggestedMedications: (state, action: PayloadAction<any[]>) => {
      state.aiSuggestedMedications = action.payload;
    },
    clearAiSuggestions: (state) => {
      state.aiSuggestedMedications = [];
      state.aiSuggestedLabTests = [];
    },
  },
});

export const {
  setAiSuggestedLabTests,
  setAiSuggestedMedications,
  clearAiSuggestions,
} = doctorConsultationSlice.actions;

export default doctorConsultationSlice.reducer;
