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
}

const initialState: LabOrderState = {
  selectedOrder: null,
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
  },
});

export const { setSelectedOrder, clearSelectedOrder } = labOrderSlice.actions;
export default labOrderSlice.reducer;
