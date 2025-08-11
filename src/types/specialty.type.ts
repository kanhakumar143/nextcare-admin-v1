

export interface Specialty {
  id: string;
  tenant_service_id: string; // UUID
  code: string;
  system: string; 
  display: string;
  specialty_label: string;
  description: string;
  is_active: boolean;
}


export type SpecialtyCreate = Omit<Specialty, "code" | "system" | "description"> & {
  code?: string;
  system?: string;
  description?: string;
};
