import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  PaymentData,
  PaymentResult,
  RazorpayConfig,
  RazorpayError,
  RazorpayInstance,
  RazorpayOptions,
  RazorpayResponse,
} from "@/types/razorpayPayment.types";
import razorpayService from "@/services/razorpay.api";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<RazorpayConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script with fallback mechanism
  // Note: Script is already loaded in layout.tsx, but this provides a safety net
  // for edge cases where payment is initiated before the global script loads
  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Initialize Razorpay config on mount
  useEffect(() => {
    const initConfig = async () => {
      try {
        const configData = await razorpayService.loadConfig();
        setConfig(configData);
      } catch (err) {
        setError("Failed to load Razorpay configuration");
        console.error(err);
      }
    };

    initConfig();
  }, []);

  // Main payment function following the guide pattern
  const initiatePayment = useCallback(
    async (paymentData: PaymentData): Promise<PaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Ensure Razorpay script is loaded (fallback mechanism)
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay script");
        }

        // Ensure config is loaded
        let currentConfig = config;
        if (!currentConfig) {
          currentConfig = await razorpayService.loadConfig();
          setConfig(currentConfig);
        }

        // Step 1: Create order
        const order = await razorpayService.createOrder({
          amount: paymentData.amount,
          notes: {
            patient_name: paymentData.patient_name,
            patient_email: paymentData.patient_email,
            appointment_id: paymentData.appointment_id,
          },
        });

        // Step 2: Get checkout preferences
        const preferences = await razorpayService.getCheckoutPreferences(
          order,
          {
            order_id: order.id,
            amount: paymentData.amount,
            customer_name: paymentData.patient_name,
            customer_email: paymentData.patient_email,
            customer_phone: paymentData.patient_phone,
          }
        );

        // Step 3: Initialize Razorpay checkout
        return new Promise<PaymentResult>((resolve, reject) => {
          if (!currentConfig) {
            reject(new Error("Razorpay configuration not available"));
            return;
          }

          const options: RazorpayOptions = {
            ...preferences,
            key: currentConfig.key_id,
            handler: async function (response: RazorpayResponse) {
              try {
                // Verify payment
                const verification = await razorpayService.verifyPayment({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                });

                if (verification.success && verification.data.verified) {
                  toast.success("Payment successful!");
                  resolve({
                    success: true,
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    verified: true,
                  });
                } else {
                  reject(new Error("Payment verification failed"));
                }
              } catch (error) {
                reject(error);
              }
            },
            modal: {
              ondismiss: function () {
                // toast.error("Payment cancelled");
                reject(new Error("Payment cancelled by user"));
              },
            },
            theme: {
              color: "#667eea",
            },
          };

          const rzp = new window.Razorpay(options);

          rzp.on("payment.failed", function (response: RazorpayError) {
            const errorMsg = response.error?.description || "Payment failed";
            toast.error(errorMsg);
            reject(new Error(errorMsg));
          });

          rzp.open();
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Payment initiation failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [config, loadRazorpayScript]
  );

  return {
    initiatePayment,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error,
    config,
    healthCheck: razorpayService.healthCheck,
  };
};
