import {
  CheckoutPreferencesPayload,
  CreateOrderPayload,
  Order,
  RazorpayConfig,
  VerifyPaymentPayload,
} from "@/types/razorpayPayment.types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const razorpayBaseUrl = `${API_BASE_URL}api/v1/razorpay`;
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const headers = {
  headers: {
    "Content-Type": "application/json",
  },
};

class RazorpayService {
  config: RazorpayConfig | null;

  constructor() {
    this.config = null;
  }

  async loadConfig() {
    try {
      const response = await axios.get(`${razorpayBaseUrl}/config`, headers);
      if (response.data.success) {
        this.config = response.data.data;
        return this.config;
      }
      throw new Error("Failed to load Razorpay config");
    } catch (error) {
      console.error("Config loading failed:", error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderPayload) {
    try {
      const response = await axios.post(
        `${razorpayBaseUrl}/orders`,
        {
          amount: orderData.amount,
          notes: {
            patient_name: orderData.notes.patient_name,
            patient_email: orderData.notes.patient_email,
            appointment_id: orderData.notes.appointment_id,
          },
        },
        headers
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create order");
    } catch (error) {
      console.error("Order creation failed:", error);
      throw error;
    }
  }

  async getCheckoutPreferences(
    order: Order,
    customerData: CheckoutPreferencesPayload
  ) {
    try {
      const response = await axios.post(
        `${razorpayBaseUrl}/checkout/preferences`,
        {
          order_id: order.id,
          amount: customerData.amount,
          customer_name: customerData.customer_name,
          customer_email: customerData.customer_email,
          customer_phone: customerData.customer_phone,
        },
        headers
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to get checkout preferences");
    } catch (error) {
      console.error("Checkout preferences failed:", error);
      throw error;
    }
  }

  async verifyPayment(paymentData: VerifyPaymentPayload) {
    try {
      const response = await axios.post(
        `${razorpayBaseUrl}/payments/verify`,
        {
          order_id: paymentData.order_id,
          payment_id: paymentData.payment_id,
          signature: paymentData.signature,
        },
        headers
      );

      return response.data;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${razorpayBaseUrl}/health`, headers);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}

const razorpayService = new RazorpayService();
export default razorpayService;

export const loadRazorpayConfig = async () => {
  const service = new RazorpayService();
  return service.loadConfig();
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const service = new RazorpayService();
  return service.createOrder(payload);
};

export const getCheckoutPreferences = async (
  order: Order,
  customerData: CheckoutPreferencesPayload
) => {
  const service = new RazorpayService();
  return service.getCheckoutPreferences(order, customerData);
};

export const verifyPayment = async (payload: VerifyPaymentPayload) => {
  const service = new RazorpayService();
  return service.verifyPayment(payload);
};

export const updateBulkStatusPaymentRequest = async (payload: any) => {
  const { data } = await axios.put(
    `${baseUrl}order-requests/bulk-update/`,
    payload,
    headers
  );
  return data;
};
