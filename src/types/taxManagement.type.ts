// types/taxManagement.type.ts

export interface TaxRate {
  id: string;
  name: string;
  rate: number | string; // backend may return string for decimals
  description: string;
  active: boolean;
  tax_display_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxRateDto {
  name: string;
  rate: number;
  description: string;
  active: boolean;
}
