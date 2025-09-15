// Enum for feature_type
export enum FeatureTypeEnum {
  Consultation = "consultation",
  Lab = "lab",
  Imaging = "imaging",
  FamilySlot = "family_slot",
  Discount = "discount",
  Other = "other",
}

// Base feature structure
export interface SubscriptionPlanFeature {
  id?: string;                 // present in update or get
  name: string;
  description: string;
  feature_type: FeatureTypeEnum | ""; // allow empty string for optional selection
  quantity?: number | null;
  discount_percent?: number | string | null; // API seems to allow both number & string
}

// POST request type
export interface PostSubscriptionPlan {
  tenant_id: string;
  name: string;
  price: string;               // API sends as string
  duration_days: number;
  features: SubscriptionPlanFeature[];
}

// PUT request type
export interface UpdateSubscriptionPlan {
  id: string;                  // required for update
  name?: string;
  price?: string;
  duration_days?: number;
  features?: SubscriptionPlanFeature[];
}

// GET response type
export interface GetSubscriptionPlan {
  id: string;
  tenant_id: string;
  name: string;
  price: string;
  duration_days: number;
  features: SubscriptionPlanFeature[];
  created_at: string;          // ISO datetime string
  updated_at: string;          // ISO datetime string
}

export type GetSubscriptionPlansResponse = GetSubscriptionPlan[];
