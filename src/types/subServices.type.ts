export interface SubService {
  id: string; // UUID
  tenant_service_id: string; // UUID
  name: string;
  description: string;
  active: boolean;
}

// 👇 Add this for creation payload (no id yet)
export type CreateSubServiceDto = Omit<SubService, "id">;
