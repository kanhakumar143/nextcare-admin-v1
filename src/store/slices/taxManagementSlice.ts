import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { TaxRate, CreateTaxRateDto } from "@/types/taxManagement.type";
import { getTaxRates, createTaxRate, updateTaxRate } from "@/services/taxManagement.api";

interface TaxManagementState {
  taxRates: TaxRate[];
  editing: TaxRate | null;
  loading: boolean;
}

const initialState: TaxManagementState = {
  taxRates: [],
  editing: null,
  loading: false,
};

// Fetch all tax rates
export const fetchTaxRates = createAsyncThunk("tax/fetchAll", async () => {
  return await getTaxRates();
});

// Add a new tax rate
export const addTaxRateThunk = createAsyncThunk(
  "tax/add",
  async (payload: CreateTaxRateDto) => {
    return await createTaxRate(payload);
  }
);

// Update tax rate
export const updateTaxRateById = createAsyncThunk(
  "tax/update",
  async ({ id, data }: { id: string; data: CreateTaxRateDto }) => {
    return await updateTaxRate(id, data);
  }
);

const taxSlice = createSlice({
  name: "taxManagement",
  initialState,
  reducers: {
    openEditModal(state, action: PayloadAction<TaxRate>) {
      state.editing = action.payload;
    },
    closeEditModal(state) {
      state.editing = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxRates.fulfilled, (state, action) => {
        state.taxRates = action.payload;
      })
      .addCase(addTaxRateThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTaxRateThunk.fulfilled, (state, action) => {
        state.taxRates.push(action.payload);
        state.loading = false;
      })
      .addCase(addTaxRateThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateTaxRateById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaxRateById.fulfilled, (state, action) => {
        const index = state.taxRates.findIndex(t => t.id === action.payload.id);
        if (index >= 0) state.taxRates[index] = action.payload;
        state.loading = false;
        state.editing = null;
      })
      .addCase(updateTaxRateById.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { openEditModal, closeEditModal } = taxSlice.actions;
export default taxSlice.reducer;
