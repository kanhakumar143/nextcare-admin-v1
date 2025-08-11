import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Specialty } from "@/types/specialty.type";
import { createSpecialty } from "@/services/specialty.api";

// -----------------------------
// Async thunks
// -----------------------------

// export const fetchSpecialties = createAsyncThunk<Specialty[]>(
//   "specialty/fetchAll",
//   async (_, thunkAPI) => {
//     try {
//       return await getSpecialties();
//     } catch (err: any) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

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

// -----------------------------
// Slice
// -----------------------------

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
    // Fetch specialties
    // builder
    //   .addCase(fetchSpecialties.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(
    //     fetchSpecialties.fulfilled,
    //     (state, action: PayloadAction<Specialty[]>) => {
    //       state.loading = false;
    //       state.items = action.payload;
    //     }
    //   )
    //   .addCase(fetchSpecialties.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });

    // Add specialty
    builder
      .addCase(addSpecialty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addSpecialty.fulfilled,
        (state, action: PayloadAction<Specialty>) => {
          state.loading = false;
          state.items.push(action.payload);
        }
      )
      .addCase(addSpecialty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default specialtySlice.reducer;
