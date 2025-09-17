// Enum for feature_type
export enum FeatureTypeEnum {
  Consultation = "consultation",
  Lab = "lab",
  Imaging = "imaging",
  FamilySlot = "family_slot",
  Discount = "discount",
  Other = "other",
}

// Feature structure for subscription plan
export interface SubscriptionPlanFeature {
  id?: string; // present in update/get response
  name: string;
  sub_service_id: string | null; // ✅ can be null for custom/other
  description: string;
  feature_type: FeatureTypeEnum | ""; // allow empty for UI optional
  quantity: number;

  // Feature-specific discount (if type = lab/discount)
  discount_percent?: number | string | null;
}

// POST request type
export interface PostSubscriptionPlan {
  tenant_id: string;
  name: string;
  duration_days: number;
  price: string; // ✅ required, backend expects price
  features: SubscriptionPlanFeature[];
}

// PUT request type
export interface UpdateSubscriptionPlan {
  id: string; // required for update
  name?: string;
  duration_days?: number;
  price?: string; // ✅ string to match your API example
  currency?: string; // ✅ added currency field
  discount_percent?: number; // ✅ added discount field
  features?: SubscriptionPlanFeature[];
}

// GET response type
export interface GetSubscriptionPlan {
  id: string;
  tenant_id: string;
  name: string;
  price: number; // ✅ backend-calculated price
  currency?: string; // ✅ added currency field
  duration_days: number;
  discount_percent?: number; // ✅ added discount field
  features: SubscriptionPlanFeature[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type GetSubscriptionPlansResponse = GetSubscriptionPlan[];
