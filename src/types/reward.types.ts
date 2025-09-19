// Enums
export enum RewardTriggerTypeEnum {
  ON_SIGNUP = "on_signup",
  ON_BOOKING = "on_booking",
  ON_PRESCRIPTION_UPLOAD = "on_prescription_upload",
  MANUAL = "manual",
  OTHER = "other"
}

export enum RewardPeriodEnum {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  OTHER = "other"
}

// Rule interface
export interface RewardRule {
  trigger_type: RewardTriggerTypeEnum;
  points: number;
  period_interval: RewardPeriodEnum;
  max_per_period: number;
  active: boolean;
}

// Main reward interface
export interface Reward {
  id?: string;
  tenant_id: string;
  name: string;
  description: string;
  active: boolean;
  rules: RewardRule[];
  created_at?: string;
  updated_at?: string;
}

// API request/response types
export interface CreateRewardRequest {
  tenant_id: string;
  name: string;
  description: string;
  active: boolean;
  rules: RewardRule[];
}