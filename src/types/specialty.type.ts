// types/specialty.type.ts

export interface Specialty {
  tenant_service_id: string; // UUID
  code: string;
  system: string; 
  display: string;
  specialty_label: string;
  description: string;
  is_active: boolean;
}

// Optional: Type for creating a new specialty (if backend generates some fields)
export type SpecialtyCreate = Omit<Specialty, "code" | "system" | "description"> & {
  code?: string;
  system?: string;
  description?: string;
};
