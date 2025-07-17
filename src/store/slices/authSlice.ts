import { authSliceInitialState, userLoginTypes } from "@/types/auth.types";
import { setLocalStorage } from "@/utils/localStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: authSliceInitialState = {
  userLoginDetails: {
    user_id: null,
    user_role: null,
    access_token: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    storeLoginDetails: (state, action: PayloadAction<userLoginTypes>) => {
      const { user_id, user_role, access_token } = action.payload;
      setLocalStorage("user_id", user_id || "");
      setLocalStorage("access_token", access_token || "");
      setLocalStorage("role", user_role || "");

      state.userLoginDetails.user_id = user_id;
      state.userLoginDetails.access_token = access_token;
      state.userLoginDetails.user_role = user_role;
    },
  },
});

export const { storeLoginDetails } = authSlice.actions;
export default authSlice.reducer;
