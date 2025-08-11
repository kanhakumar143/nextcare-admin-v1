import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Specialty } from "@/types/specialty.type";
import {
  createSpecialty,
  getSpecialtiesByServiceId,
  getSpecialtyByTenantId,
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

export const updateSpecialtyName = createAsyncThunk<
  Specialty,
  { specialty: Specialty; id: string }
>("specialty/updateName", async ({ specialty, id }, thunkAPI) => {
  try {
    return await updateSpecialtyStatus(specialty, id);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchSpecialtiesByTenantId = createAsyncThunk(
  "specialty/fetchSpecialtiesByTenantId",
  async (tenantId: string | null, { rejectWithValue }) => {
    try {
      const res = await getSpecialtyByTenantId(tenantId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface SpecialtyState {
  items: Specialty[];
  loading: boolean;
  error: string | null;
  specialtyData: {
    data: Specialty[];
    loading: boolean;
    error: string | null;
  };
  confirmModalOpen: boolean;
  specialtyToToggle: Specialty | null;
  editModalOpen: boolean;
  specialtyToEdit: Specialty | null;
}

const initialState: SpecialtyState = {
  items: [],
  loading: false,
  error: null,
  specialtyData: {
    data: [],
    loading: false,
    error: null,
  },
  confirmModalOpen: false,
  specialtyToToggle: null,
  editModalOpen: false,
  specialtyToEdit: null,
};

const specialtySlice = createSlice({
  name: "specialty",
  initialState,
  reducers: {
    setConfirmModalOpen: (state, action: PayloadAction<boolean>) => {
      state.confirmModalOpen = action.payload;
    },
    setSpecialtyToToggle: (state, action: PayloadAction<Specialty | null>) => {
      state.specialtyToToggle = action.payload;
    },
    openConfirmModal: (state, action: PayloadAction<Specialty>) => {
      state.specialtyToToggle = action.payload;
      state.confirmModalOpen = true;
    },
    setEditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.editModalOpen = action.payload;
    },
    setSpecialtyToEdit: (state, action: PayloadAction<Specialty | null>) => {
      state.specialtyToEdit = action.payload;
    },
    openEditModal: (state, action: PayloadAction<Specialty>) => {
      state.specialtyToEdit = action.payload;
      state.editModalOpen = true;
    },
  },
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

      .addCase(fetchSpecialtiesByTenantId.pending, (state) => {
        state.specialtyData.loading = true;
        state.specialtyData.error = null;
      })
      .addCase(
        fetchSpecialtiesByTenantId.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.specialtyData.loading = false;
          state.specialtyData.data = action.payload;
        }
      )
      .addCase(fetchSpecialtiesByTenantId.rejected, (state, action) => {
        state.loading = false;
        state.specialtyData.error = action.payload as string;
      })

      // Add specialty
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
      })

      // Toggle status
      .addCase(toggleSpecialtyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        toggleSpecialtyStatus.fulfilled,
        (state, action: PayloadAction<Specialty>) => {
          state.loading = false;
          const idx = state.items.findIndex(
            (s) => s.code === action.payload.code
          );
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      )
      .addCase(toggleSpecialtyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update specialty name
      .addCase(updateSpecialtyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateSpecialtyName.fulfilled,
        (state, action: PayloadAction<Specialty>) => {
          state.loading = false;
          const idx = state.items.findIndex(
            (s) => s.code === action.payload.code
          );
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      )
      .addCase(updateSpecialtyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setConfirmModalOpen,
  setSpecialtyToToggle,
  openConfirmModal,
  setEditModalOpen,
  setSpecialtyToEdit,
  openEditModal,
} = specialtySlice.actions;

export default specialtySlice.reducer;
