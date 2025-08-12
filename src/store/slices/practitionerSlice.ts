import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addPractitioner,
  getPractitionerByRole,
  updatePractitioner,
} from "@/services/admin.api";
import {
  AddDoctorPayload,
  AddNursePayload,
  DoctorData,
  NurseData,
  UpdateDoctorPayload,
  UpdateNursePayload,
} from "@/types/admin.types";

type Role = "doctor" | "nurse";

interface PractitionerState {
  doctors: DoctorData[];
  nurses: NurseData[];
  loading: boolean;
  error: string | null;
}

const initialState: PractitionerState = {
  doctors: [],
  nurses: [],
  loading: false,
  error: null,
};


export const fetchPractitioners = createAsyncThunk(
  "practitioner/fetchByRole",
  async (role: Role, { rejectWithValue }) => {
    try {
      const res = await getPractitionerByRole(role);
      return { role, data: res || [] };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch practitioners"
      );
    }
  }
);


export const createPractitioner = createAsyncThunk(
  "practitioner/add",
  async (
    payload: AddDoctorPayload | AddNursePayload & { role: Role },
    { rejectWithValue }
  ) => {
    try {
      const newData = await addPractitioner(payload);
      return { role: payload.role, data: newData };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add practitioner");
    }
  }
);


export const editPractitioner = createAsyncThunk(
  "practitioner/update",
  async (
    payload: (UpdateDoctorPayload | UpdateNursePayload) & { role: Role },
    { rejectWithValue }
  ) => {
    try {
      const updatedData = await updatePractitioner(payload);
      return { role: payload.role, data: updatedData };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update practitioner");
    }
  }
);

const practitionerSlice = createSlice({
  name: "practitioner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchPractitioners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPractitioners.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;
        if (role === "doctor") {
          state.doctors = data as DoctorData[];
        } else {
          state.nurses = data as NurseData[];
        }
      })
      .addCase(fetchPractitioners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add (instant update)
      .addCase(createPractitioner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;
        if (role === "doctor") {
          state.doctors.push(data as DoctorData);
        } else {
          state.nurses.push(data as NurseData);
        }
      })
      .addCase(createPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update (instant update)
      .addCase(editPractitioner.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;
        if (role === "doctor") {
          state.doctors = state.doctors.map((doc) =>
            doc.practitioner_display_id === data.practitioner_display_id
              ? (data as DoctorData)
              : doc
          );
        } else {
          state.nurses = state.nurses.map((nurse) =>
            nurse.practitioner_display_id === data.practitioner_display_id
              ? (data as NurseData)
              : nurse
          );
        }
      })
      .addCase(editPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default practitionerSlice.reducer;
