import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Symptom } from "@/types/symptoms.type";
import {
  getSymptomsByTenantId,
  createSymptom,
  
} from "@/services/symptoms.api";

export const fetchSymptomsByTenantId = createAsyncThunk<
  Symptom[],
  string
>("symptom/fetchByTenantId", async (tenantId, thunkAPI) => {
  try {
    const res = await getSymptomsByTenantId(tenantId);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const addSymptom = createAsyncThunk<
  Symptom,
  Omit<Symptom, "id" | "created_at" | "updated_at">
>("symptom/add", async (data, thunkAPI) => {
  try {
    return await createSymptom(data);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// export const toggleSymptomStatus = createAsyncThunk<
//   Symptom,
//   { symptom: Symptom; id: string }
// >("symptom/toggleStatus", async ({ symptom, id }, thunkAPI) => {
//   try {
//     return await updateSymptomStatus(symptom, id);
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(err.message);
//   }
// });

interface SymptomState {
  items: Symptom[];
  loading: boolean;
  error: string | null;
}

const initialState: SymptomState = {
  items: [],
  loading: false,
  error: null,
};

const symptomSlice = createSlice({
  name: "symptom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSymptomsByTenantId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSymptomsByTenantId.fulfilled,
        (state, action: PayloadAction<Symptom[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchSymptomsByTenantId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add symptom
      .addCase(addSymptom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSymptom.fulfilled, (state, action: PayloadAction<Symptom>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addSymptom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle status
    //   .addCase(toggleSymptomStatus.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(toggleSymptomStatus.fulfilled, (state, action: PayloadAction<Symptom>) => {
    //     state.loading = false;
    //     const idx = state.items.findIndex((s) => s.id === action.payload.id);
    //     if (idx !== -1) {
    //       state.items[idx] = action.payload;
    //     }
    //   })
    //   .addCase(toggleSymptomStatus.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

export default symptomSlice.reducer;
