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

// ================== FETCH ==================
export const fetchPractitioners = createAsyncThunk(
  "practitioner/fetchByRole",
  async (role: Role, { rejectWithValue }) => {
    try {
      const res = await getPractitionerByRole(role);
      return { role, data: res || [] };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch practitioners");
    }
  }
);

// ================== CREATE ==================
export const createPractitioner = createAsyncThunk<
  { role: Role; data: DoctorData | NurseData },
  AddDoctorPayload | AddNursePayload
>("practitioner/add", async (payload, { rejectWithValue }) => {
  try {
    let newData: DoctorData | NurseData;
    if (payload.user.user_role === "doctor") {
      newData = await addPractitioner(payload as AddDoctorPayload);
    } else {
      newData = await addPractitioner(payload as AddDoctorPayload);
    }

    return { role: payload.user.user_role, data: newData };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to add practitioner");
  }
});

// ================== UPDATE ==================
export const editPractitioner = createAsyncThunk(
  "practitioner/update",
  async (
    payload: UpdateDoctorPayload | UpdateNursePayload,
    { rejectWithValue }
  ) => {
    try {
      const updatedData = await updatePractitioner(payload);
      const role = (payload as UpdateDoctorPayload).user_role || "doctor";
      return { role, data: updatedData };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update practitioner");
    }
  }
);

// ================== SLICE ==================
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
        if (role === "doctor") state.doctors = data as DoctorData[];
        else state.nurses = data as NurseData[];
      })
      .addCase(fetchPractitioners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(createPractitioner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;
        if (role === "doctor") state.doctors.push(data as DoctorData);
        else state.nurses.push(data as NurseData);
      })
      .addCase(createPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(editPractitioner.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;

        if (role === "doctor") {
          const updated = data as DoctorData;
          state.doctors = state.doctors.map((doc) =>
            doc.practitioner_display_id === updated?.practitioner_display_id
              ? updated
              : doc
          );
        } else {
          const updated = data as NurseData;
          state.nurses = state.nurses.map((nurse) =>
            nurse.practitioner_display_id === updated?.practitioner_display_id
              ? updated
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
