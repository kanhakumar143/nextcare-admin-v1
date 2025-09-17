export interface SubService {
  id: string; // UUID
  tenant_service_id: string; // UUID
  name: string;
  description: string;
  active: boolean;
   pricings?: Pricing[];
}
export interface Pricing {
  sub_service_id: string;
  base_price: string;
  currency: string;
  id: string;
  tenant_service_id: string;
  active: boolean;
}

// 👇 Add this for creation payload (no id yet)
export type CreateSubServiceDto = Omit<SubService, "id">;
