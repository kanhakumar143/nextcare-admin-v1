import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import receptionistReducer from "./slices/receptionistSlice";
import practitionerReducer from "./slices/practitionerSlice"; 
import adminSlice from "./slices/adminSlice";
import specialtyReducer from "./slices/specialtySlice";
import servicesReducer from "./slices/servicesSlice";
import symptomReducer from "./slices/symptomsSlice";
import preQuestionaryReducer from "./slices/preQuestionarySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    receptionistData: receptionistReducer,
    practitioner: practitionerReducer, 
    admin: adminSlice,
    specialty: specialtyReducer,
    services: servicesReducer,
    symptom: symptomReducer,
    preQuestionary: preQuestionaryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
