import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LabOrder = {
  id: string;
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_code: string;
  test_display: string;
  status: string;
  intent: string;
  priority: string;
  test_report_path: string | null;
  authored_on: string;
  created_at: string;
  updated_at: string;
  notes: any[];
};

interface LabOrderState {
  selectedOrder: LabOrder | null;
  tempToken: string | null;
}

const initialState: LabOrderState = {
  selectedOrder: null,
  tempToken: null,
};

const labOrderSlice = createSlice({
  name: "labOrder",
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<LabOrder>) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setTempToken: (state, action: PayloadAction<string | null>) => {
      state.tempToken = action.payload;
    },
  },
});

export const { setSelectedOrder, clearSelectedOrder, setTempToken } =
  labOrderSlice.actions;
export default labOrderSlice.reducer;
