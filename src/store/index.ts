import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import receptionistReducer from "./slices/receptionistSlice";
import nurseSlice from "./slices/nurseSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    receptionistData: receptionistReducer,
    nurse: nurseSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
