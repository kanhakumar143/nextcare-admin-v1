// subscription.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  GetSubscriptionPlan,
  GetSubscriptionPlansResponse,
  PostSubscriptionPlan,
  UpdateSubscriptionPlan,
} from "@/types/subscription.type";
import {
  createSubscriptionPlan,
  getSubscriptionPlansByTenant,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/services/subscription.api";

// ---------------------------
// Async Thunks
// ---------------------------

// ✅ Get plans by tenant
export const fetchPlansByTenant = createAsyncThunk<
  GetSubscriptionPlansResponse,
  string
>("subscription/fetchPlansByTenant", async (tenantId, { rejectWithValue }) => {
  try {
    return await getSubscriptionPlansByTenant(tenantId);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// ✅ Create new plan
export const addSubscriptionPlan = createAsyncThunk<
  GetSubscriptionPlan,
  PostSubscriptionPlan
>("subscription/addPlan", async (payload, { rejectWithValue }) => {
  try {
    return await createSubscriptionPlan(payload);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// ✅ Update plan
export const editSubscriptionPlan = createAsyncThunk<
  GetSubscriptionPlan,
  UpdateSubscriptionPlan
>("subscription/editPlan", async (payload, { rejectWithValue }) => {
  try {
    return await updateSubscriptionPlan(payload);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// ✅ Delete plan
export const removeSubscriptionPlan = createAsyncThunk<
  string, // return deleted plan id
  string
>("subscription/removePlan", async (id, { rejectWithValue }) => {
  try {
    await deleteSubscriptionPlan(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// ---------------------------
// Slice State
// ---------------------------
interface SubscriptionState {
  plans: GetSubscriptionPlansResponse;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
};

// ---------------------------
// Slice
// ---------------------------
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    // Replace all subscription plans
    setSubscriptionPlans: (
      state,
      action: PayloadAction<GetSubscriptionPlansResponse>
    ) => {
      state.plans = action.payload;
    },
    // Clear subscription state (useful on logout/tenant switch)
    clearSubscriptionPlans: (state) => {
      state.plans = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ---------------------------
    // Fetch Plans
    // ---------------------------
    builder.addCase(fetchPlansByTenant.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPlansByTenant.fulfilled,
      (state, action: PayloadAction<GetSubscriptionPlansResponse>) => {
        state.loading = false;
        state.plans = action.payload;
      }
    );
    builder.addCase(fetchPlansByTenant.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---------------------------
    // Create Plan
    // ---------------------------
    builder.addCase(addSubscriptionPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      addSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<GetSubscriptionPlan>) => {
        state.loading = false;
        state.plans.push(action.payload);
      }
    );
    builder.addCase(addSubscriptionPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---------------------------
    // Update Plan
    // ---------------------------
    builder.addCase(editSubscriptionPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      editSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<GetSubscriptionPlan>) => {
        state.loading = false;
        state.plans = state.plans.map((plan) =>
          plan.id === action.payload.id ? action.payload : plan
        );
      }
    );
    builder.addCase(editSubscriptionPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---------------------------
    // Delete Plan
    // ---------------------------
    builder.addCase(removeSubscriptionPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      removeSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      }
    );
    builder.addCase(removeSubscriptionPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Export reducer and actions
export const { setSubscriptionPlans, clearSubscriptionPlans } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
