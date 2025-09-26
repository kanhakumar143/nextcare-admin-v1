import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SubService, CreateSubServiceDto } from "@/types/subServices.type";
import { createSubService } from "@/services/subServices.api";
import { api, axios } from "@/lib/axios";

interface SubServiceState {
  items: SubService[];
  loading: boolean;
  error: string | null;
  editing: SubService | null;
}

const initialState: SubServiceState = {
  items: [],
  loading: false,
  error: null,
  editing: null,
};

// ✅ Fetch sub-services for a given service
export const fetchSubServicesByServiceId = createAsyncThunk<
  SubService[],
  string,
  { rejectValue: string }
>("subServices/fetchByServiceId", async (serviceId, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `sub-service/by-service?service_id=${serviceId}`
    );
    return response.data as SubService[];
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.message || "Failed to fetch sub-services");
    }
    return rejectWithValue("Unexpected error occurred.");
  }
});

// ✅ Add a new sub-service
export const addSubService = createAsyncThunk<
  SubService,
  CreateSubServiceDto, // 👈 only requires data without id
  { rejectValue: string }
>("subServices/add", async (payload, { rejectWithValue }) => {
  try {
    const response = await createSubService(payload);
    return response as SubService; // backend responds with SubService (with id)
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.message || "Failed to add sub-service");
    }
    return rejectWithValue("Unexpected error occurred.");
  }
});

// ✅ Update sub-service
export const updateSubService = createAsyncThunk<
  SubService,
  { id: string; data: { name: string; description: string; active: boolean } },
  { rejectValue: string }
>("subServices/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    // Send id in the body instead of URL
    const payload = { id, ...data };
    const response = await api.put("sub-service/", payload); // POST/PUT endpoint without id in URL
    return response.data as SubService;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.message || "Failed to update sub-service");
    }
    return rejectWithValue("Unexpected error occurred.");
  }
});

const subServiceSlice = createSlice({
  name: "subServices",
  initialState,
  reducers: {
    openEditModal: (state, action: PayloadAction<SubService>) => {
      state.editing = action.payload;
    },
    closeEditModal: (state) => {
      state.editing = null;
    },
    clearSubServices: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchSubServicesByServiceId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubServicesByServiceId.fulfilled, (state, action) => {
        state.loading = false;
        // Merge new sub-services with existing ones, avoiding duplicates
        const newSubServices = action.payload;
        const existingIds = new Set(state.items.map((item) => item.id));
        const uniqueNewSubServices = newSubServices.filter(
          (subService) => !existingIds.has(subService.id)
        );
        // state.items = [...state.items, ...uniqueNewSubServices];
        state.items = action.payload; // replace with latest fetch
      })
      .addCase(fetchSubServicesByServiceId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sub-services";
      })
      // add
      .addCase(addSubService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubService.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addSubService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add sub-service";
      })
      // update
      .addCase(updateSubService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubService.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((srv) =>
          srv.id === action.payload.id ? action.payload : srv
        );
        state.editing = null;
      })
      .addCase(updateSubService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update sub-service";
      });
  },
});

export const { openEditModal, closeEditModal } = subServiceSlice.actions;
export default subServiceSlice.reducer;
