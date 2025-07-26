export interface adminSliceInitialStates {
  isLocationAddModal: boolean;
}

export type Location = {
  id?: string;
  name: string;
  description?: string;
  organizationId?: string;
  position?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    text: string;
  };
  alias?: string[];
  status?: string;
  mode?: string;
  form?: {
    coding: {
      code: string;
      system: string;
    }[];
  };
  characteristic?: {
    coding: {
      code: string;
    }[];
  }[];
  hoursOfOperation?: {
    daysOfWeek: string[];
    openingTime: string;
    closingTime: string;
  }[];
  contact?: {
    name: {
      text: string;
    };
    telecom: {
      value: string;
      system: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
  operationalStatus?: string | null;
  partOfId?: string | null;
  type?: string | null;
  endpoint?: any;
  virtualService?: any;
  identifier?: any;
};

export type CreateLocationPayload = Partial<Location>;

export type AddLocationResponse = {
  organization_id: string;
  location_id: string;
};

export type AddServicePayload = {
  tenant_id: string;
  name: string;
}
