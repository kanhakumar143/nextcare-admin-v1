import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PricingPayload, PricingResponse } from "@/types/pricing.types";
import {
  createPricing,
  updatePricing,
  deletePricing,
  searchSubService,
  getPricingBySubServiceId,
} from "@/services/pricing.api";

// -------------------- State --------------------
interface PricingState {
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  success: boolean;
  message: string;
  items: PricingResponse[];
  subServicePricing: PricingResponse[]; // 👈 added for storing subservice pricing
}

const initialState: PricingState = {
  loading: false,
  searchLoading: false,
  error: null,
  success: false,
  message: "",
  items: [],
  subServicePricing: [],
};

// -------------------- Thunks --------------------

// Create pricing
export const postPricing = createAsyncThunk<PricingResponse, PricingPayload>(
  "pricing/postPricing",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createPricing({
        ...payload,
        base_price: Number(payload.base_price),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create pricing"
      );
    }
  }
);

// Update pricing
export const updatePricingThunk = createAsyncThunk<PricingResponse, PricingPayload>(
  "pricing/updatePricing",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await updatePricing({
        ...payload,
        base_price: Number(payload.base_price),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update pricing"
      );
    }
  }
);

// Delete pricing
export const removePricing = createAsyncThunk<string, string>(
  "pricing/removePricing",
  async (id, { rejectWithValue }) => {
    try {
      await deletePricing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete pricing"
      );
    }
  }
);

// Search pricing by sub-service name
export const searchSubServicePricing = createAsyncThunk<
  PricingResponse[],
  string
>("pricing/searchSubServicePricing", async (name, { rejectWithValue }) => {
  try {
    const data = await searchSubService(name);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to search pricing"
    );
  }
});

// ✅ Get Pricing by SubService Id
export const fetchPricingBySubServiceId = createAsyncThunk<
  PricingResponse[],
  string
>("pricing/fetchPricingBySubServiceId", async (subServiceId, { rejectWithValue }) => {
  try {
    const data = await getPricingBySubServiceId(subServiceId);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch subservice pricing"
    );
  }
});

// -------------------- Slice --------------------
const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    resetPricingState: (state) => {
      state.loading = false;
      state.searchLoading = false;
      state.error = null;
      state.success = false;
      state.message = "";
      state.items = [];
      state.subServicePricing = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(postPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })
      .addCase(postPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = "Pricing created successfully";
        state.items.push(action.payload);
      })
      .addCase(postPricing.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // UPDATE
      .addCase(updatePricingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })
      .addCase(updatePricingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = "Pricing updated successfully";
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePricingThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // DELETE
      .addCase(removePricing.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })
      .addCase(removePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.message = "Pricing deleted successfully";
      })
      .addCase(removePricing.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // SEARCH
      .addCase(searchSubServicePricing.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(searchSubServicePricing.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.success = true;
        state.error = null;
        state.items = action.payload || [];
        state.message = "Search results loaded";
      })
      .addCase(searchSubServicePricing.rejected, (state, action) => {
        state.searchLoading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // ✅ FETCH PRICING BY SUBSERVICE
      .addCase(fetchPricingBySubServiceId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricingBySubServiceId.fulfilled, (state, action) => {
        state.loading = false;
        state.subServicePricing = action.payload;
        state.success = true;
        state.message = "SubService pricing loaded";
      })
      .addCase(fetchPricingBySubServiceId.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

// -------------------- Export --------------------
export const { resetPricingState } = pricingSlice.actions;
export default pricingSlice.reducer;
