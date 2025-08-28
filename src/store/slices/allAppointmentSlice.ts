// // src/store/slices/appointmentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllAppointmentsByPractitioner } from "@/services/admin.api";

export interface Appointment {
  id: string;
  appointment_display_id: string;
  patient_name: string;
  patient_id: string;
  patient_phone: string;
  created_at: string;
  status: string;
}

interface AllAppointmentState {
  upcoming: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AllAppointmentState = {
  upcoming: [],
  loading: false,
  error: null,
};

export const fetchUpcomingAppointmentsByPractitioner = createAsyncThunk(
  "appointments/fetchUpcomingByPractitioner",
  async (practitionerId: string, { rejectWithValue }) => {
    try {
      const data = await getAllAppointmentsByPractitioner(practitionerId);
      // Only return upcoming appointments
      return data.upcoming || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch appointments");
    }
  }
);

const allAppointmentSlice = createSlice({
  name: "allAppointments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingAppointmentsByPractitioner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingAppointmentsByPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        state.upcoming = action.payload;
      })
      .addCase(fetchUpcomingAppointmentsByPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default allAppointmentSlice.reducer;