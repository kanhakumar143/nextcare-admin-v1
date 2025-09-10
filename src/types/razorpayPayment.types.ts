export interface RazorpayConfig {
  key_id: string;
  currency: string;
  theme_color: string;
}

export interface CreateOrderPayload {
  amount: number;
  notes: {
    patient_name: string;
    patient_email: string;
    appointment_id?: string;
  };
}

export interface Order {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface CheckoutPreferencesPayload {
  order_id: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CheckoutPreferences {
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string | number | boolean>;
  theme: {
    color: string;
  };
}

export interface VerifyPaymentPayload {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    verified: boolean;
    payment_id: string;
    order_id: string;
  };
  message: string;
}

export interface PatientData {
  name: string;
  email: string;
  phone: string;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  order_id?: string;
  verified?: boolean;
  error?: string;
}

export interface RazorpayPaymentProps {
  amount: string | number;
  patientData: PatientData;
  appointmentId?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  // children?: React.ReactNode;
}

export interface PaymentData {
  amount: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_id?: string;
}

export interface RazorpayConfig {
  key_id: string;
  currency: string;
  theme_color: string;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  error?: {
    description?: string;
  };
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string | number | boolean>;
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: RazorpayError) => void): void;
}
