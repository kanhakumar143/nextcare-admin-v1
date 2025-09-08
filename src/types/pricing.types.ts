export interface PricingPayload {
  tenant_id: string;
  service_specialty_id?: string;
  base_price: number;
  tax_percentage: number;
  currency: string;
  remark?: string;
  id?: string;
}

// export interface PricingResponse {
//   success: boolean;
//   message: string;
//   data?: any;
// }
export interface PricingPlanFeatures {
  support?: string;
  priority_booking?: boolean;
  teleconsultation?: boolean;
  free_consultations?: number;
  lab_discount_percent?: number;
  health_reports_storage?: boolean;
  family_members?: number;
  diet_consultation?: boolean;
  annual_health_checkup?: boolean;
  fitness_tracking_integration?: boolean;
}

export interface PricingPlan {
  tenant_id: string;
  name: string;
  price: string;
  duration_days: number;
  features: PricingPlanFeatures;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PricingPlansResponse {
  plans: PricingPlan[];
}
export interface PricingResponse {
  id: string; // Add this
  tenant_id: string;
  service_specialty_id: string;
  base_price: number;
  tax_percentage: number;
  currency: string;
  remark: string;
  created_at: string;
  updated_at: string;
  success?: boolean;
  message?: string;
}

export interface UpdatePricingPayload {
  tenant_id: string;
  service_specialty_id: string;
  base_price: number;
  tax_percentage: number;
  currency: string;
  remark?: string; // optional
}
