import { api, axios } from "@/lib/axios";
import { InvoiceGeneratePayload } from "@/types/invoice.types";

export const submitInvoiceGenerate = async (
  payload: InvoiceGeneratePayload
) => {
  try {
    const { data } = await api.post(`invoice/generate-invoice`, payload);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Failed to generate invoice";

      throw new Error(errorMessage);
    }
    throw new Error(
      "An unexpected error occurred while generating the invoice."
    );
  }
};
