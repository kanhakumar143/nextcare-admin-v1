import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AvailableSlot,
  ReferralData,
  SubService,
} from "@/types/receptionist.types";

// Booking state interface
export interface BookingState {
  selectedSlot: AvailableSlot | null;
  referralData: ReferralData | null;
  subServices: SubService[];
  bookingInProgress: boolean;
  bookingError: string | null;
  setAppointmentId: string | null;
  paymentInProgress: boolean;
  paymentError: string | null;
}

// Initial state
const initialState: BookingState = {
  selectedSlot: null,
  referralData: null,
  subServices: [],
  bookingInProgress: false,
  setAppointmentId: null,
  bookingError: null,
  paymentInProgress: false,
  paymentError: null,
};

// Create the booking slice
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Set the selected slot for booking
    setSelectedSlot: (state, action: PayloadAction<AvailableSlot>) => {
      state.selectedSlot = action.payload;
      state.bookingError = null;
    },

    // Set the referral data
    setReferralData: (state, action: PayloadAction<ReferralData>) => {
      state.referralData = action.payload;
      state.bookingError = null;
    },

    // Set sub services
    setSubServices: (state, action: PayloadAction<SubService[]>) => {
      state.subServices = action.payload;
    },

    // Set both slot and referral data together
    setBookingData: (
      state,
      action: PayloadAction<{ slot: AvailableSlot; referralData: ReferralData }>
    ) => {
      state.selectedSlot = action.payload.slot;
      state.referralData = action.payload.referralData;
      state.bookingError = null;
    },

    // Set appointment ID
    setAppointmentId: (state, action: PayloadAction<string | null>) => {
      state.setAppointmentId = action.payload;
    },

    // Set booking progress state
    setBookingInProgress: (state, action: PayloadAction<boolean>) => {
      state.bookingInProgress = action.payload;
      if (action.payload) {
        state.bookingError = null;
      }
    },

    // Set booking error
    setBookingError: (state, action: PayloadAction<string>) => {
      state.bookingError = action.payload;
      state.bookingInProgress = false;
    },

    // Set payment progress state
    setPaymentInProgress: (state, action: PayloadAction<boolean>) => {
      state.paymentInProgress = action.payload;
      if (action.payload) {
        state.paymentError = null;
      }
    },

    // Set payment error
    setPaymentError: (state, action: PayloadAction<string>) => {
      state.paymentError = action.payload;
      state.paymentInProgress = false;
    },

    // Clear all booking data
    clearBookingData: (state) => {
      state.selectedSlot = null;
      state.referralData = null;
      state.subServices = [];
      state.bookingInProgress = false;
      state.bookingError = null;
      state.paymentInProgress = false;
      state.paymentError = null;
    },

    // Clear only errors
    clearBookingErrors: (state) => {
      state.bookingError = null;
      state.paymentError = null;
    },
  },
});

// Export actions
export const {
  setSelectedSlot,
  setReferralData,
  setSubServices,
  setBookingData,
  setBookingInProgress,
  setBookingError,
  setPaymentInProgress,
  setAppointmentId,
  setPaymentError,
  clearBookingData,
  clearBookingErrors,
} = bookingSlice.actions;

// Export reducer
export default bookingSlice.reducer;
