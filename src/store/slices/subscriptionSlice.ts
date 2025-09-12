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
    // Set entire subscription plans (used after fetching updated list)
    setSubscriptionPlans: (state, action: PayloadAction<GetSubscriptionPlansResponse>) => {
      state.plans = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch
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

    // Create
    builder.addCase(
      addSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<GetSubscriptionPlan>) => {
        state.plans.push(action.payload);
      }
    );

    // Update
    builder.addCase(
      editSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<GetSubscriptionPlan>) => {
        state.plans = state.plans.map((plan) =>
          plan.id === action.payload.id ? action.payload : plan
        );
      }
    );

    // Delete
    builder.addCase(
      removeSubscriptionPlan.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      }
    );
  },
});

// Export reducer and actions
export const { setSubscriptionPlans } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

// ---------------------------
// Export reducer
// ---------------------------
// export default subscriptionSlice.reducer;
