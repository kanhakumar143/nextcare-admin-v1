import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PricingPayload, PricingResponse } from '@/types/pricing.types';
import { createPricing, getAllPricing, updatePricing, deletePricing } from '@/services/pricing.api';

interface PricingState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message?: string;
  items: PricingResponse[];
}

const initialState: PricingState = {
  loading: false,
  error: null,
  success: false,
  message: '',
  items: [],
};

// Create pricing
export const postPricing = createAsyncThunk<PricingResponse, PricingPayload>(
  'pricing/postPricing',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createPricing(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to post pricing');
    }
  }
);

// Fetch all pricing
export const fetchAllPricing = createAsyncThunk<PricingResponse[], string>(
  'pricing/fetchAllPricing',
  async (tenant_id, { rejectWithValue }) => {
    try {
      const data = await getAllPricing(tenant_id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pricing');
    }
  }
);

// Update pricing (payload includes `id`)
export const putPricing = createAsyncThunk<PricingResponse, { id: string; payload: PricingPayload }>(
  'pricing/putPricing',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await updatePricing(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update pricing');
    }
  }
);

// Delete pricing
export const removePricing = createAsyncThunk<string, string>(
  'pricing/removePricing',
  async (id, { rejectWithValue }) => {
    try {
      await deletePricing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete pricing');
    }
  }
);

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    resetPricingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // POST
      .addCase(postPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(postPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success ?? true;
        state.error = action.payload.success ? null : action.payload.message || null;
        state.message = action.payload.message || '';
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(postPricing.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.message = '';
      })

      // FETCH
      .addCase(fetchAllPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.success = true;
        state.error = null;
      })
      .addCase(fetchAllPricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // PUT
      .addCase(putPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(putPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success ?? true;
        state.error = action.payload.success ? null : action.payload.message || null;
        state.message = action.payload.message || '';

        // Update item in list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(putPricing.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.message = '';
      })

      // DELETE
      .addCase(removePricing.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(removePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removePricing.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPricingState } = pricingSlice.actions;
export default pricingSlice.reducer;
