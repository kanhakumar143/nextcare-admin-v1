// 

// Request payload (POST/PUT)
export interface PricingPayload {
  sub_service_id: string;
  base_price: number;   // we’ll keep it number when sending
  currency: string;
  tax_id: string;
  active: boolean;
}

// Response object (GET)
export interface PricingResponse {
  id: string;
  sub_service_id: string;
  base_price: string;   // comes as string from API
  currency: string;
  tax_id: string;
  taxRate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  success?: boolean;
  message?: string;
}
