import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Reward, CreateRewardRequest } from "@/types/reward.types";
import { createReward } from "@/services/reward.api";

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

interface RewardState {
  items: Reward[];
  loading: boolean;
  error: string | null;
  isCreateModalOpen: boolean;
}

const initialState: RewardState = {
  items: [],
  loading: false,
  error: null,
  isCreateModalOpen: false,
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
      // Add reward
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
      });
  },
});

export const { setCreateModalOpen, clearError } = rewardSlice.actions;

export default rewardSlice.reducer;