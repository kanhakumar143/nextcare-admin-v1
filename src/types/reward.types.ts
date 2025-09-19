// Enums
export enum RewardTriggerTypeEnum {
  ON_SIGNUP = "on_signup",
  ON_BOOKING = "on_booking",
  ON_PRESCRIPTION_UPLOAD = "on_prescription_upload",
  MANUAL = "manual",
  OTHER = "other",
}

export enum RewardPeriodEnum {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  OTHER = "other",
}

export interface RewardRule {
  id: string;
  created_at: string;
  program_id: string;
  trigger_type: RewardTriggerTypeEnum;
  points: number;
  max_per_period: number;
  period_interval: RewardPeriodEnum;
  active: boolean;
}

export interface RewardRuleCreate {
  trigger_type: RewardTriggerTypeEnum;
  points: number;
  max_per_period: number;
  period_interval: RewardPeriodEnum;
  active: boolean;
}

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

export interface CreateRewardRequest {
  tenant_id: string;
  name: string;
  description: string;
  active: boolean;
  rules: RewardRuleCreate[];
}

export interface ExtendedRewardProgramData {
  tenant_id: string;
  name: string;
  description?: string;
  active: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  rules: RewardRule[];
}

export interface AdminRewardSliceInitialStates {
  items: Reward[];
  loading: boolean;
  error: string | null;
  isCreateModalOpen: boolean;

  rewardsPrograms: {
    loading: boolean;
    error: null | string;
    data: ExtendedRewardProgramData[];
  };
}
