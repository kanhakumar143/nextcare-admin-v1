import {
  doctorSliceInitialStates,
  ConsultationData,
  LabTest,
  Medicine,
  VisitNote,
  Medication,
  EPrescription,
} from "@/types/doctor.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getAssignedAppointments } from "@/services/doctor.api";
import { set } from "zod";

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
  EprescriptionDetails: null,
  ConfirmReviewPrescriptionModalVisible: false,
  patientQueueList: [],
  patientQueueListLoading: false,
  patientQueueListError: null,
  singlePatientDetails: null,
  consultationData: null,
  labTests: [],
  medicines: [],
  visitNote: {
    summary: "",
    follow_up: "",
    visit_care_plan: {
      plan_type: "",
      goal: "",
      detail: "",
    },
    visit_assessment: {
      description: "",
      severity: "mild",
    },
  },
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setConfirmConsultationModal: (state, action: PayloadAction<boolean>) => {
      state.confirmConsultationModalVisible = action.payload;
    },
    setConfirmReviewPrescriptionModal: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.ConfirmReviewPrescriptionModalVisible = action.payload;
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
    setEprescriptionDetails: (state, action: PayloadAction<EPrescription>) => {
      state.EprescriptionDetails = action.payload;
    },
    updateVisitNote: (
      state,
      action: PayloadAction<{ field: string; value: string }>
    ) => {
      const { field, value } = action.payload;
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "visit_care_plan" && state.visitNote.visit_care_plan) {
          (state.visitNote.visit_care_plan as any)[child] = value;
        } else if (
          parent === "visit_assessment" &&
          state.visitNote.visit_assessment
        ) {
          (state.visitNote.visit_assessment as any)[child] = value;
        }
      } else {
        (state.visitNote as any)[field] = value;
      }
    },
    clearVisitNote: (state) => {
      state.visitNote = {
        summary: "",
        follow_up: "",
        visit_care_plan: {
          plan_type: "",
          goal: "",
          detail: "",
        },
        visit_assessment: {
          description: "",
          severity: "mild",
        },
      };
    },
    addLabTest: (state, action: PayloadAction<LabTest>) => {
      state.labTests.push(action.payload);
    },
    addMedicine: (state, action: PayloadAction<Medication>) => {
      state.medicines.push(action.payload);
    },
    updateLabTest: (
      state,
      action: PayloadAction<{ index: number; key: string; value: string }>
    ) => {
      const { index, key, value } = action.payload;
      if (state.labTests[index]) {
        (state.labTests[index] as any)[key] = value;
      }
    },
    updateMedicine: (
      state,
      action: PayloadAction<{ index: number; key: string; value: string | any }>
    ) => {
      const { index, key, value } = action.payload;
      if (state.medicines[index]) {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          if (parent === "note") {
            if (!state.medicines[index].note) {
              state.medicines[index].note = { info: "" };
            }
            (state.medicines[index].note as any)[child] = value;
          }
        } else {
          (state.medicines[index] as any)[key] = value;
        }
      }
    },
    deleteLabTest: (state, action: PayloadAction<number>) => {
      state.labTests.splice(action.payload, 1);
    },
    deleteMedicine: (state, action: PayloadAction<number>) => {
      state.medicines.splice(action.payload, 1);
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
      state.visitNote = {
        summary: "",
        follow_up: "",
        visit_care_plan: {
          plan_type: "",
          goal: "",
          detail: "",
        },
        visit_assessment: {
          description: "",
          severity: "mild",
        },
      };
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
  updateVisitNote,
  clearVisitNote,
  addLabTest,
  addMedicine,
  updateLabTest,
  setConfirmReviewPrescriptionModal,
  updateMedicine,
  deleteLabTest,
  deleteMedicine,
  setEprescriptionDetails,
  clearLabTests,
  clearMedicines,
  clearConsultationOrders,
} = doctorSlice.actions;
export default doctorSlice.reducer;
