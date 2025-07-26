import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import receptionistReducer from "./slices/receptionistSlice";
import nurseSlice from "./slices/nurseSlice";
import doctorSlice from "./slices/doctorSlice";
import adminSlice from "./slices/adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    receptionistData: receptionistReducer,
    nurse: nurseSlice,
    doctor: doctorSlice,
    admin: adminSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
