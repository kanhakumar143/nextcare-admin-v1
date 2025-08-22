import {
  doctorSliceInitialStates,
  ConsultationData,
  LabTest,
  Medication,
  EPrescription,
  VitalReading,
} from "@/types/doctor.types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssignedAppointments,
  getPractitionerDetails,
} from "@/services/doctor.api";

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

export const fetchPractitionerDetails = createAsyncThunk(
  "doctor/fetchPractitionerDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getPractitionerDetails(userId);
      return response?.data;
    } catch (error: any) {
      console.error("Error fetching practitioner details:", error);
      return rejectWithValue(
        error.message || "Failed to fetch practitioner details"
      );
    }
  }
);

const initialState: doctorSliceInitialStates = {
  confirmConsultationModalVisible: false,
  EprescriptionDetails: null,
  ConfirmReviewPrescriptionModalVisible: false,
  editVitalsModalVisible: false,
  patientQueueList: [],
  labTestsReviewData: [],
  patientAppointmentHistory: [],
  patientQueueListLoading: false,
  patientQueueListError: null,
  singlePatientDetails: null,
  consultationData: null,
  labTests: [],
  medicines: [],
  currentVitals: [],
  practitionerData: null,
  practitionerDataLoading: false,
  practitionerDataError: null,
  visitNote: {
    summary: "",
    follow_up: "",
    chief_complaint: "",
    provisional_diagnosis: "",
    remarks: "",
    visit_care_plan: {
      plan_type: "",
      goal: "",
      detail: "",
      followup_date: "",
      consultation_mode: "",
    },
    visit_assessment: {
      description: "",
      severity: "mild",
    },
    critical: false,
  },
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setConfirmConsultationModal: (state, action: PayloadAction<boolean>) => {
      state.confirmConsultationModalVisible = action.payload;
    },
    setEditVitalsModal: (state, action: PayloadAction<boolean>) => {
      state.editVitalsModalVisible = action.payload;
    },
    setCurrentVitals: (state, action: PayloadAction<VitalReading[]>) => {
      state.currentVitals = action.payload;
    },
    updateVitalReading: (
      state,
      action: PayloadAction<{ index: number; field: string; value: string }>
    ) => {
      const { index, field, value } = action.payload;
      if (state.currentVitals[index]) {
        if (field === "diastolic" || field === "systolic") {
          state.currentVitals[index].value[field] = Number(value) || value;
        } else if (field === "value") {
          state.currentVitals[index].value.value = Number(value) || value;
        }
      }
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
      action: PayloadAction<{ field: string; value: string | boolean }>
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
        chief_complaint: "",
        provisional_diagnosis: "",
        remarks: "",
        visit_care_plan: {
          plan_type: "",
          goal: "",
          detail: "",
          followup_date: "",
          consultation_mode: "",
        },
        visit_assessment: {
          description: "",
          severity: "mild",
        },
        critical: false,
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
        chief_complaint: "",
        provisional_diagnosis: "",
        remarks: "",
        visit_care_plan: {
          plan_type: "",
          goal: "",
          detail: "",
          followup_date: "",
          consultation_mode: "",
        },
        visit_assessment: {
          description: "",
          severity: "mild",
        },
        critical: false,
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
        state.patientQueueList = action.payload?.upcoming_consultation || [];
        state.patientAppointmentHistory =
          action.payload?.past_consultation || [];
        state.labTestsReviewData = action.payload?.lab_report_ready || [];
        state.patientQueueListError = null;
      })
      .addCase(fetchAssignedAppointments.rejected, (state, action) => {
        state.patientQueueListLoading = false;
        state.patientQueueListError = action.payload as string;
      })
      .addCase(fetchPractitionerDetails.pending, (state) => {
        state.practitionerDataLoading = true;
        state.practitionerDataError = null;
      })
      .addCase(fetchPractitionerDetails.fulfilled, (state, action) => {
        state.practitionerDataLoading = false;
        state.practitionerData = action.payload;
        state.practitionerDataError = null;
      })
      .addCase(fetchPractitionerDetails.rejected, (state, action) => {
        state.practitionerDataLoading = false;
        state.practitionerDataError = action.payload as string;
      });
  },
});

export const {
  setConfirmConsultationModal,
  setEditVitalsModal,
  setCurrentVitals,
  updateVitalReading,
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
