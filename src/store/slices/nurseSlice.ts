import { fetchAllQuestionnairesByAppointmentId } from "@/services/nurse.api";
import { NurseInitialState } from "@/types/nurse.types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const fetchListAllQuestionnaires = createAsyncThunk(
  "doctor/fetchListAllQuestionnaires",
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchAllQuestionnairesByAppointmentId(
        appointmentId
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch practitioner details"
      );
    }
  }
);

const initialState: NurseInitialState = {
  qrDtls: null,
  isConfirmModal: false,
  nurseStepCompleted: {
    step1: false,
    step2: false,
  },
  preAppQuestionnaires: {
    loading: false,
    error: null,
    response: {
      data: [],
      id: null,
    },
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchListAllQuestionnaires.pending, (state) => {
        state.preAppQuestionnaires.loading = true;
        state.preAppQuestionnaires.error = null;
        state.preAppQuestionnaires.response.data = [];
        state.preAppQuestionnaires.response.id = null;
      })
      .addCase(fetchListAllQuestionnaires.fulfilled, (state, action) => {
        state.preAppQuestionnaires.loading = false;
        state.preAppQuestionnaires.error = null;
        state.preAppQuestionnaires.response = action.payload?.data;
      })
      .addCase(fetchListAllQuestionnaires.rejected, (state, action) => {
        state.preAppQuestionnaires.loading = false;
        state.preAppQuestionnaires.error = action.payload as string;
        state.preAppQuestionnaires.response.data = [];
        state.preAppQuestionnaires.response.id = null;
      });
  },
});

export const { setQrDetails, setConfirmModal, setNurseStepCompleted } =
  nurseSlice.actions;
export default nurseSlice.reducer;
