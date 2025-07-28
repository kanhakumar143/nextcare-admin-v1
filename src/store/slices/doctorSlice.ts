import {
  doctorSliceInitialStates,
  ConsultationData,
  LabTest,
  Medicine,
} from "@/types/doctor.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getAssignedAppointments } from "@/services/doctor.api";

// Async thunk for fetching assigned appointments
export const fetchAssignedAppointments = createAsyncThunk(
  "doctor/fetchAssignedAppointments",
  async (practitioner_id: string | null, { rejectWithValue }) => {
    try {
      const response = await getAssignedAppointments(practitioner_id);
      return response?.data;
    } catch (error: any) {
      console.error("Error fetching assigned appointments:", error);
      return rejectWithValue(error.message || "Failed to fetch appointments");
    }
  }
);

const initialState: doctorSliceInitialStates = {
  confirmConsultationModalVisible: false,
  patientQueueList: [],
  patientQueueListLoading: false,
  patientQueueListError: null,
  singlePatientDetails: null,
  consultationData: null,
  labTests: [],
  medicines: [],
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setConfirmConsultationModal: (state, action: PayloadAction<boolean>) => {
      state.confirmConsultationModalVisible = action.payload;
    },
    setSinglePatientDetails: (state, action: PayloadAction<any | null>) => {
      state.singlePatientDetails = action.payload;
    },
    setConsultationData: (
      state,
      action: PayloadAction<ConsultationData | null>
    ) => {
      state.consultationData = action.payload;
    },
    addLabTest: (state, action: PayloadAction<LabTest>) => {
      state.labTests.push(action.payload);
    },
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      state.medicines.push(action.payload);
    },
    clearLabTests: (state) => {
      state.labTests = [];
    },
    clearMedicines: (state) => {
      state.medicines = [];
    },
    clearConsultationOrders: (state) => {
      state.labTests = [];
      state.medicines = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedAppointments.pending, (state) => {
        state.patientQueueListLoading = true;
        state.patientQueueListError = null;
      })
      .addCase(fetchAssignedAppointments.fulfilled, (state, action) => {
        state.patientQueueListLoading = false;
        state.patientQueueList = action.payload || [];
        state.patientQueueListError = null;
      })
      .addCase(fetchAssignedAppointments.rejected, (state, action) => {
        state.patientQueueListLoading = false;
        state.patientQueueListError = action.payload as string;
      });
  },
});

export const {
  setConfirmConsultationModal,
  setSinglePatientDetails,
  setConsultationData,
  addLabTest,
  addMedicine,
  clearLabTests,
  clearMedicines,
  clearConsultationOrders,
} = doctorSlice.actions;
export default doctorSlice.reducer;
