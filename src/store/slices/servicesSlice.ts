// store/slices/servicesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getServices } from "@/services/admin.api"; // your API file

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async () => {
    const data = await getServices();
    return data;
  }
);

interface ServicesState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch services";
      });
  },
});

export default servicesSlice.reducer;
