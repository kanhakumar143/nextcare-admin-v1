import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getQuestionsBySpecialty } from "@/services/preQuestionary.api";
import { ServicesState } from "@/types/admin.preQuestionary.types";

export const fetchQuestionsBySpecialty = createAsyncThunk(
  "specialty/fetchQuestionsBySpecialty",
  async (specialtyId: string | null, { rejectWithValue }) => {
    try {
      const res = await getQuestionsBySpecialty(specialtyId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState: ServicesState = {
  data: [],
  loading: false,
  error: null,
};

const preQuestionarySlice = createSlice({
  name: "preQuestionary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionsBySpecialty.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = [];
      })
      .addCase(fetchQuestionsBySpecialty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(fetchQuestionsBySpecialty.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.error.message || "Failed to fetch preQuestionary";
      });
  },
});

export default preQuestionarySlice.reducer;
