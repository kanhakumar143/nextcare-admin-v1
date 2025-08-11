export interface Symptom {
  tenant_service_id: string;
  code: string;
  system: string;
  display: string;      // Symptom name
  description: string;
  is_active: boolean;
  id?: string;          // Optional: for existing symptoms, from backend
  created_at?: string;  // Optional: timestamps if returned by API
  updated_at?: string;
}
export type SymptomCreate = Omit<Symptom, "code" | "system" | "description"> & {
  code?: string;
  system?: string;
  description?: string;
};
