import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Reward,
  CreateRewardRequest,
  AdminRewardSliceInitialStates,
  ExtendedRewardProgramData,
} from "@/types/reward.types";
import { createReward } from "@/services/reward.api";
import { searchRewardPrograms } from "@/services/adminRewards.api";

export const addReward = createAsyncThunk<Reward, CreateRewardRequest>(
  "reward/add",
  async (rewardData, thunkAPI) => {
    try {
      return await createReward(rewardData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchRewardPrograms = createAsyncThunk<
  ExtendedRewardProgramData[],
  { tenant_id: string; name?: string },
  { rejectValue: string }
>(
  "adminReward/fetchRewardPrograms",
  async ({ tenant_id, name }, { rejectWithValue }) => {
    try {
      const data = await searchRewardPrograms(tenant_id, name);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch reward programs"
      );
    }
  }
);

const initialState: AdminRewardSliceInitialStates = {
  items: [],
  loading: false,
  error: null,
  isCreateModalOpen: false,
  rewardsPrograms: {
    loading: false,
    error: null,
    data: [],
  },
};

const rewardSlice = createSlice({
  name: "reward",
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReward.fulfilled, (state, action: PayloadAction<Reward>) => {
        state.loading = false;
        state.items.push(action.payload);
        state.isCreateModalOpen = false;
      })
      .addCase(addReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRewardPrograms.pending, (state) => {
        state.rewardsPrograms.loading = true;
        state.rewardsPrograms.error = null;
      })
      .addCase(fetchRewardPrograms.fulfilled, (state, action) => {
        state.rewardsPrograms.loading = false;
        state.rewardsPrograms.data = action.payload;
      })
      .addCase(fetchRewardPrograms.rejected, (state, action) => {
        state.rewardsPrograms.loading = false;
        state.rewardsPrograms.error = action.payload as string;
      });
  },
});

export const { setCreateModalOpen, clearError } = rewardSlice.actions;

export default rewardSlice.reducer;
