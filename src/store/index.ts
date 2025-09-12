import pricingReducer from "./slices/pricingSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import receptionistReducer from "./slices/receptionistSlice";
import practitionerReducer from "./slices/practitionerSlice";
import adminSlice from "./slices/adminSlice";
import specialtyReducer from "./slices/specialtySlice";
import servicesReducer from "./slices/servicesSlice";
import symptomReducer from "./slices/symptomsSlice";
import preQuestionaryReducer from "./slices/preQuestionarySlice";
import doctorReducer from "./slices/doctorSlice";
import nurseReducer from "./slices/nurseSlice";
import labOrderReducer from "./slices/labTechnicianSlice";
import allAppointmentsReducer from "./slices/allAppointmentSlice";
import ehrReducer from "./slices/ehrSlice";
import pharmacyReducer from "./slices/pharmacySlice";
import availabilityTemplateReducer from "./slices/availabilityTemplateSlice";
import scheduleSlotsReducer from "./slices/scheduleSlotsSlice";
import subServiceReducer from "./slices/subServicesSlice";
import taxManagementReducer from "./slices/taxManagementSlice";
import subscriptionReducer from "./slices/subscriptionSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    receptionistData: receptionistReducer,
    practitioner: practitionerReducer,
    admin: adminSlice,
    specialty: specialtyReducer,
    services: servicesReducer,
    symptom: symptomReducer,
    doctor: doctorReducer,
    nurse: nurseReducer,
    preQuestionary: preQuestionaryReducer,
    labOrder: labOrderReducer,
    allAppointments: allAppointmentsReducer,
    ehr: ehrReducer,
    pharmacy: pharmacyReducer,
    availabilityTemplate: availabilityTemplateReducer,
    scheduleSlots: scheduleSlotsReducer,
    pricing: pricingReducer,
    subService: subServiceReducer,
    taxManagement: taxManagementReducer, 
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
