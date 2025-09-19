import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getAllSchedulesByPractitioner,
  getAllSchedules,
} from "@/services/availabilityTemplate.api";
import { searchAppointments } from "@/services/appointmentManagement.api";
import { getPractitionerByRole } from "@/services/admin.api";
import { DoctorData, ExtendedDoctorData } from "@/types/admin.types";
import {
  Schedule,
  ScheduleSlotsState,
  SlotSubmissionData,
  SearchAppointmentResult,
} from "@/types/scheduleSlots.types";

const initialState: ScheduleSlotsState = {
  schedules: [],
  doctors: [],
  selectedPractitionerId: null,
  submissionData: null,
  isLoadingSchedules: false,
  isLoadingDoctors: false,
  error: null,
  doctorsError: null,
  // Search appointments state
  searchResults: [],
  isSearchingAppointments: false,
  searchError: null,
};

// Async thunks
export const fetchDoctors = createAsyncThunk(
  "scheduleSlots/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPractitionerByRole("doctor");
      const data = (res?.data || []).map((doc: DoctorData) => ({
        ...doc,
        name: doc.user?.name,
      }));
      return data;
    } catch (error: any) {
      console.error("Failed to fetch practitioners:", error);
      return rejectWithValue(error.message || "Failed to fetch doctors");
    }
  }
);

export const fetchSchedulesByPractitioner = createAsyncThunk(
  "scheduleSlots/fetchSchedulesByPractitioner",
  async (practitionerId: string, { rejectWithValue }) => {
    try {
      const response = await getAllSchedulesByPractitioner(practitionerId);
      console.log("API Response:", response); // Debug log

      // Handle the response - it might be an array directly or have a data property
      const schedulesData = Array.isArray(response)
        ? response
        : response.data || response.results || [];

      // Reverse to show most recent first
      const sortedSchedules = schedulesData.reverse();
      return sortedSchedules;
    } catch (error: any) {
      console.error("Failed to fetch schedules:", error);
      return rejectWithValue(error.message || "Failed to fetch schedules");
    }
  }
);

export const fetchAllSchedules = createAsyncThunk(
  "scheduleSlots/fetchAllSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllSchedules();
      const schedulesData = Array.isArray(response)
        ? response
        : response.data || response.results || [];

      return schedulesData.reverse();
    } catch (error: any) {
      console.error("Failed to fetch all schedules:", error);
      return rejectWithValue(error.message || "Failed to fetch all schedules");
    }
  }
);

export const searchAppointmentsByPatient = createAsyncThunk(
  "scheduleSlots/searchAppointmentsByPatient",
  async (
    { name, date }: { name: string; date: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await searchAppointments(name, date);
      console.log("Search API Response:", response); // Debug log

      // Handle the response - it might be an array directly or have a data property
      const searchData = Array.isArray(response)
        ? response
        : response.data || response.results || [];

      return searchData;
    } catch (error: any) {
      console.error("Failed to search appointments:", error);
      return rejectWithValue(error.message || "Failed to search appointments");
    }
  }
);

const scheduleSlotsSlice = createSlice({
  name: "scheduleSlots",
  initialState,
  reducers: {
    setSelectedPractitionerId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedPractitionerId = action.payload;
    },
    setSubmissionData: (
      state,
      action: PayloadAction<SlotSubmissionData | null>
    ) => {
      state.submissionData = action.payload;
    },
    clearSchedules: (state) => {
      state.schedules = [];
    },
    clearError: (state) => {
      state.error = null;
      state.doctorsError = null;
    },
    resetState: (state) => {
      return initialState;
    },
    // Local delete actions (no API calls)
    deleteScheduleLocal: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(
        (schedule) => schedule.id !== action.payload
      );
    },
    deleteMultipleSchedulesLocal: (state, action: PayloadAction<string[]>) => {
      state.schedules = state.schedules.filter(
        (schedule) => !action.payload.includes(schedule.id)
      );
    },
    deleteSchedulesByDateRangeLocal: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      const { startDate, endDate } = action.payload;
      state.schedules = state.schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.planning_start);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return scheduleDate < start || scheduleDate > end;
      });
    },
    deleteSlotLocal: (
      state,
      action: PayloadAction<{ scheduleId: string; slotId: string }>
    ) => {
      const { scheduleId, slotId } = action.payload;
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        schedule.slots = schedule.slots.filter((slot) => slot.id !== slotId);
      }
    },
    deleteMultipleSlotsLocal: (
      state,
      action: PayloadAction<{ scheduleId: string; slotIds: string[] }>
    ) => {
      const { scheduleId, slotIds } = action.payload;
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        schedule.slots = schedule.slots.filter(
          (slot) => !slotIds.includes(slot.id)
        );
      }
    },
    setAllPractitioner: (
      state,
      action: PayloadAction<ExtendedDoctorData[]>
    ) => {
      state.doctors = action.payload;
    },
    deleteSlotsByTimeRangeLocal: (
      state,
      action: PayloadAction<{
        scheduleId: string;
        startTime: string;
        endTime: string;
      }>
    ) => {
      const { scheduleId, startTime, endTime } = action.payload;
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        schedule.slots = schedule.slots.filter((slot) => {
          const slotStart = new Date(slot.start);
          const rangeStart = new Date(startTime);
          const rangeEnd = new Date(endTime);
          return slotStart < rangeStart || slotStart > rangeEnd;
        });
      }
    },
    transferSlotLocal: (
      state,
      action: PayloadAction<{
        sourceScheduleId: string;
        sourceSlotId: string;
        targetScheduleId: string;
        targetSlotId: string;
      }>
    ) => {
      const { sourceScheduleId, sourceSlotId, targetScheduleId, targetSlotId } =
        action.payload;

      // Find source and target schedules
      const sourceSchedule = state.schedules.find(
        (s) => s.id === sourceScheduleId
      );
      const targetSchedule = state.schedules.find(
        (s) => s.id === targetScheduleId
      );

      if (sourceSchedule && targetSchedule) {
        // Find source and target slots
        const sourceSlot = sourceSchedule.slots.find(
          (slot) => slot.id === sourceSlotId
        );
        const targetSlot = targetSchedule.slots.find(
          (slot) => slot.id === targetSlotId
        );

        if (
          sourceSlot &&
          targetSlot &&
          sourceSlot.overbooked &&
          !targetSlot.overbooked
        ) {
          // Transfer the booking status
          sourceSlot.overbooked = false;
          targetSlot.overbooked = true;

          // Optionally transfer any comments or additional data
          if (sourceSlot.comment) {
            targetSlot.comment = sourceSlot.comment;
            sourceSlot.comment = "";
          }
        }
      }
    },
    // Search appointments reducers
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Doctors
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoadingDoctors = true;
        state.doctorsError = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoadingDoctors = false;
        state.doctors = action.payload;
        state.doctorsError = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoadingDoctors = false;
        state.doctorsError = action.payload as string;
      });

    // Fetch Schedules by Practitioner
    builder
      .addCase(fetchSchedulesByPractitioner.pending, (state) => {
        state.isLoadingSchedules = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByPractitioner.fulfilled, (state, action) => {
        state.isLoadingSchedules = false;
        state.schedules = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedulesByPractitioner.rejected, (state, action) => {
        state.isLoadingSchedules = false;
        state.schedules = [];
        state.error = action.payload as string;
      });

    // Fetch All Schedules
    builder
      .addCase(fetchAllSchedules.pending, (state) => {
        state.isLoadingSchedules = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.isLoadingSchedules = false;
        state.schedules = action.payload;
        state.error = null;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.isLoadingSchedules = false;
        state.schedules = [];
        state.error = action.payload as string;
      });

    // Search Appointments
    builder
      .addCase(searchAppointmentsByPatient.pending, (state) => {
        state.isSearchingAppointments = true;
        state.searchError = null;
      })
      .addCase(searchAppointmentsByPatient.fulfilled, (state, action) => {
        state.isSearchingAppointments = false;
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchAppointmentsByPatient.rejected, (state, action) => {
        state.isSearchingAppointments = false;
        state.searchResults = [];
        state.searchError = action.payload as string;
      });
  },
});

export const {
  setSelectedPractitionerId,
  setSubmissionData,
  clearSchedules,
  clearError,
  resetState,
  setAllPractitioner,
  deleteScheduleLocal,
  deleteMultipleSchedulesLocal,
  deleteSchedulesByDateRangeLocal,
  deleteSlotLocal,
  deleteMultipleSlotsLocal,
  deleteSlotsByTimeRangeLocal,
  transferSlotLocal,
  clearSearchResults,
  clearSearchError,
} = scheduleSlotsSlice.actions;

export default scheduleSlotsSlice.reducer;
