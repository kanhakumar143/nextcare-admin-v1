import { authSliceInitialState, userLoginTypes } from "@/types/auth.types";
import { setLocalStorage } from "@/utils/localStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: authSliceInitialState = {
  userLoginDetails: {
    user_id: null,
    user_role: null,
    access_token: null,
    practitioner_id: null,
    org_id: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    storeLoginDetails: (state, action: PayloadAction<userLoginTypes>) => {
      const { user_id, user_role, access_token, org_id, practitioner_id } =
        action.payload;
      setLocalStorage("user_id", user_id || "");
      setLocalStorage("access_token", access_token || "");
      setLocalStorage("role", user_role || "");
      setLocalStorage("org_id", org_id || "");
      setLocalStorage("practitioner_id", practitioner_id || "");

      state.userLoginDetails.user_id = user_id;
      state.userLoginDetails.practitioner_id = practitioner_id;
      state.userLoginDetails.access_token = access_token;
      state.userLoginDetails.user_role = user_role;
      state.userLoginDetails.org_id = org_id;
    },
  },
});

export const { storeLoginDetails } = authSlice.actions;
export default authSlice.reducer;
