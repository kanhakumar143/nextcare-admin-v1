
export interface PlanFeatures {
  support: string;
  priority_booking?: boolean;
  teleconsultation?: boolean;
  free_consultations?: number;
  lab_discount_percent?: number;
  health_reports_storage?: boolean;
  family_members?: number;
  diet_consultation?: boolean;
  annual_health_checkup?: boolean;
  fitness_tracking_integration?: boolean;
  priority_support?: boolean;
  max_users?: number;
}

export interface PostSubscriptionPlan {
  tenant_id: string;
  name: string;
  price: string;          // string because API sometimes returns "499 INR"
  duration_days: number;
  features: PlanFeatures;
}

export interface UpdateSubscriptionPlan {
  id: string;             // required for update
  name?: string;
  price?: string;
  duration_days?: number;
  features?: PlanFeatures;
}

export interface GetSubscriptionPlan extends PostSubscriptionPlan {
  id: string;
  created_at: string;     // ISO datetime string
  updated_at: string;     // ISO datetime string
}

export type GetSubscriptionPlansResponse = GetSubscriptionPlan[];
