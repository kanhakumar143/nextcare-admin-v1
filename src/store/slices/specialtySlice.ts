import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Specialty } from "@/types/specialty.type";
import {
  createSpecialty,
  getSpecialtiesByServiceId,
  updateSpecialtyStatus,
} from "@/services/specialty.api";

export const fetchSpecialtiesByServiceId = createAsyncThunk<
  Specialty[],
  string
>("specialty/fetchByServiceId", async (tenantServiceId, thunkAPI) => {
  try {
    const res = await getSpecialtiesByServiceId(tenantServiceId);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const addSpecialty = createAsyncThunk<
  Specialty,
  Omit<Specialty, "code" | "system" | "description">
>("specialty/add", async (data, thunkAPI) => {
  try {
    return await createSpecialty(data);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});


export const toggleSpecialtyStatus = createAsyncThunk<
  Specialty,
  { specialty: Specialty; id: string }
>("specialty/toggleStatus", async ({ specialty, id }, thunkAPI) => {
  try {
    return await updateSpecialtyStatus(specialty, id);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

interface SpecialtyState {
  items: Specialty[];
  loading: boolean;
  error: string | null;
}

const initialState: SpecialtyState = {
  items: [],
  loading: false,
  error: null,
};

const specialtySlice = createSlice({
  name: "specialty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchSpecialtiesByServiceId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpecialtiesByServiceId.fulfilled,
        (state, action: PayloadAction<Specialty[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchSpecialtiesByServiceId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add specialty
      .addCase(addSpecialty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSpecialty.fulfilled, (state, action: PayloadAction<Specialty>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addSpecialty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleSpecialtyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSpecialtyStatus.fulfilled, (state, action: PayloadAction<Specialty>) => {
        state.loading = false;
        const idx = state.items.findIndex((s) => s.code === action.payload.code);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(toggleSpecialtyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default specialtySlice.reducer;
