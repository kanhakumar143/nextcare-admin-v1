import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getEHRsByPatient } from "@/services/ehr.api";
import { AxiosError } from "axios";

// EHR interface matching your API response
export interface EHR {
  id: string;
  patient_id: string;
  author_id: string | null;
  status: string;
  type: string;
  file_url: string;
  file_type: string;
  file_size: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface EHRState {
  ehrList: EHR[];
  loading: boolean;
  error: string | null;
  isEhrViewModalOpen: boolean;
  selectedEhr: EHR | null;
}

const initialState: EHRState = {
  ehrList: [],
  loading: false,
  error: null,
  isEhrViewModalOpen: false,
  selectedEhr: null,
};

// Async thunk to fetch EHRs by patient ID
export const fetchEHRsByPatient = createAsyncThunk<
  EHR[], // return type
  string, // argument type (patientId)
  { rejectValue: string } // rejected value type
>("ehr/fetchByPatient", async (patientId, { rejectWithValue }) => {
  try {
    const data = await getEHRsByPatient(patientId);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const ehrSlice = createSlice({
  name: "ehr",
  initialState,
  reducers: {
    toggleEhrViewModal: (
      state,
      action: PayloadAction<{ isOpen: boolean; ehr?: EHR }>
    ) => {
      state.isEhrViewModalOpen = action.payload.isOpen;
      if (action.payload.isOpen && action.payload.ehr) {
        state.selectedEhr = action.payload.ehr;
      } else if (!action.payload.isOpen) {
        state.selectedEhr = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEHRsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEHRsByPatient.fulfilled,
        (state, action: PayloadAction<EHR[]>) => {
          state.loading = false;
          state.ehrList = action.payload;
        }
      )
      .addCase(fetchEHRsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch EHRs";
      });
  },
});

export const { toggleEhrViewModal } = ehrSlice.actions;

export default ehrSlice.reducer;
