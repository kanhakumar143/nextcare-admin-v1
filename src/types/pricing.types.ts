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
