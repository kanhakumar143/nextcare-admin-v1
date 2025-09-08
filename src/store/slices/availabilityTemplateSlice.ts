import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TimeSlot {
  start: string;
  end: string;
}

type RecurringType = "daily" | "weekly" | "monthly";

interface AvailabilityFormData {
  dateRangeType: "months" | "custom";
  monthsCount: number;
  startDate: Date;
  endDate: Date;
  timeSlot: TimeSlot;
  intervalType: "preset" | "custom";
  selectedInterval: number;
  customInterval: number;
  recurring: RecurringType;
  workingDays: string[];
  totalSlots: number;
  customSlotCount: number | null;
  clinicUnavailableDates: Date[];
  doctorLeaveDates: Date[];
}

interface AvailabilityFormState {
  formData: AvailabilityFormData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AvailabilityFormState = {
  formData: null,
  isLoading: false,
  error: null,
};

const availabilityTemplateSlice = createSlice({
  name: "availabilityTemplate",
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<AvailabilityFormData>) => {
      state.formData = action.payload;
    },
    clearFormData: (state) => {
      state.formData = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setFormData, clearFormData, setLoading, setError } =
  availabilityTemplateSlice.actions;

export default availabilityTemplateSlice.reducer;
