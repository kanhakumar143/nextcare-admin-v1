import { api, axios } from "@/lib/axios";
import { TaxRate, CreateTaxRateDto } from "@/types/taxManagement.type";

// Fetch all tax rates
export async function getTaxRates(): Promise<TaxRate[]> {
  try {
    const response = await api.get("tax/all");
    return response.data as TaxRate[];
  } catch (error: any) {
    throw new Error(axios.isAxiosError(error) ? error.message : "Unexpected error occurred.");
  }
}

// Create a tax rate
export async function createTaxRate(payload: CreateTaxRateDto): Promise<TaxRate> {
  try {
    const response = await api.post("tax/", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(axios.isAxiosError(error) ? error.message : "Unexpected error occurred.");
  }
}

// Update a tax rate
export async function updateTaxRate(id: string, payload: CreateTaxRateDto): Promise<TaxRate> {
  try {
    const response = await api.put("tax/", { id, ...payload });
    return response.data;
  } catch (error: any) {
    throw new Error(axios.isAxiosError(error) ? error.message : "Unexpected error occurred.");
  }
}
