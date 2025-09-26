export interface ServicesState {
  items: any[];
  loading: boolean;
  error: string | null;
  serviceSpecialityData: TenantService[] | [];
  pricing?: any; // Add this line
}

export interface TenantService {
  id: string;
  active: boolean;
  name: string;
  category: string;
  tenant_id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  service_specialties: ServiceSpecialty[];
  sub_services: SubService[];
}

export interface ServiceSpecialty {
  system: string;
  code: string;
  display: string;
  specialty_label: string;
  description: string;
  is_active: boolean;
  id: string;
  tenant_service_id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface SubService {
  tenant_service_id: string;
  name: string;
  description: string;
  active: boolean;
  id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
