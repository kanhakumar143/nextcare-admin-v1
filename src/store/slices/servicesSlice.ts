// store/slices/servicesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOnlyServices, getServices } from "@/services/admin.api"; // your API file
import { ServicesState } from "@/types/services.types";

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async () => {
    const data = await getServices();
    return data;
  }
);

export const fetchOnlyServices = createAsyncThunk(
  "services/fetchOnlyServices",
  async () => {
    const data = await getOnlyServices();
    return data;
  }
);

const initialState: ServicesState = {
  items: [],
  loading: false,
  error: null,
  serviceSpecialityData: [],
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
      })
      // Handle fetchOnlyServices
      .addCase(fetchOnlyServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOnlyServices.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceSpecialityData = action.payload;
      })
      .addCase(fetchOnlyServices.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch service speciality data";
      });
  },
});

export default servicesSlice.reducer;
