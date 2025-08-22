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
  service_id: string;
  name: string;
  active?: boolean;
};

export type AddDoctorPayload = {
  user: {
    tenant_id: string;
    name: string;
    email: string;
    hashed_password?: string;
    user_role: string;
    phone?: string;
  };
  practitioner: {
    identifiers: {
      system: string;
      value: string;
    }[];
    name: {
      prefix?: string[];
      given: string[];
      family: string;
    };
    telecom?: {
      system: string;
      value: string;
      use: string;
    }[];
    gender: string;
    birth_date: string;
    qualification: {
      degree: string;
      institution: string;
      year: string;
    }[];
    license_details: {
      number: string;
      issued_by: string;
      expiry: string;
    };
    profile_picture_url: string;
    license_url: string;
    is_active: boolean;
  };
  role: {
    tenant_id: string;
    code: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
      text: string;
    }[];
    specialty: {
      text: string;
    }[];
    location: {
      reference: string;
      display: string;
    }[];
    healthcare_service: {
      reference: string;
      display: string;
    }[];
    period: {
      start: string;
      end: string;
    };
    availability: {
      daysOfWeek: string[];
      availableTime: {
        start: string;
        end: string;
      }[];
    }[];
    not_available: {
      description: string;
      during: {
        start: string;
        end: string;
      };
    }[];
  };
};

export interface DoctorData {
  practitioner_display_id: null | string;
  is_active: boolean;
  gender: string | null;
  birth_date: string | null;
  license_url: string | null;
  profile_picture_url: string | null;
  user: {
    is_active: boolean;
    name: string;
    email?: string;
    phone?: string | null;
    user_role?: string;
  };
  license_details: {
    issued_by?: string | null;
    number?: string | null;
    expiry?: string | null;
  };
  qualification: {
    degree: string | null;
    institution: string | null;
    graduation_year: string | null;
  };
}

export type UpdateDoctorPayload = {
  id: string;
  user_id: string;
  practitioner_display_id: string;
  gender: string;
  birth_date: string;
  is_active: boolean;
  license_details: {
    number: string;
    issued_by: string;
    expiry: string;
  } | null;
  profile_picture_url: string;
  license_url: string;
  qualification?: {
    degree: string;
    institution: string;
    year: string;   // ✅ match API
  }[];
};


export type AddNursePayload = {
  user: {
    tenant_id: string;
    name: string;
    email: string;
    hashed_password?: string;
    user_role: string; // should be "nurse"
    phone?: string;
  };
  practitioner: {
    identifiers: {
      system: string;
      value: string;
    }[];
    name: {
      prefix?: string[];
      given: string[];
      family: string;
    };
    telecom?: {
      system: string;
      value: string;
      use: string;
    }[];
    gender: string;
    birth_date: string;
    qualification: {
      degree: string;
      institution: string;
      year: string;
    }[];
    license_details: {
      number: string;
      issued_by: string;
      expiry: string;
    };
    profile_picture_url: string;
    license_url: string;
    is_active: boolean;
  };
  role: {
    tenant_id: string;
    code: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
      text: string;
    }[];
    specialty: {
      text: string;
    }[];
    location: {
      reference: string;
      display: string;
    }[];
    healthcare_service: {
      reference: string;
      display: string;
    }[];
    period: {
      start: string;
      end: string;
    };
    availability: {
      daysOfWeek: string[];
      availableTime: {
        start: string;
        end: string;
      }[];
    }[];
    not_available: {
      description: string;
      during: {
        start: string;
        end: string;
      };
    }[];
  };
};

export interface NurseData {
  practitioner_display_id: null | string;
  is_active: boolean;
  gender: string | null;
  birth_date: string | null;
  license_url: string | null;
  profile_picture_url: string | null;
  user: {
    is_active: boolean;
    name: string;
    email?: string;
    phone?: string | null;
    user_role?: string; // will be "nurse"
  };
  license_details: {
    issued_by?: string | null;
    number?: string | null;
    expiry?: string | null;
  };
}

export type UpdateNursePayload = {
  id: string;
  user_id: string;
  practitioner_display_id: string;
  gender: string;
  birth_date: string;
  is_active: boolean;
  license_details: string | null;
  profile_picture_url: string;
  license_url: string;
};
