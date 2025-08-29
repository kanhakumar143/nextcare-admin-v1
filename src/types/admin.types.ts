export enum PractitionerStatus {
  UNVERIFIED = "unverified",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  RESUBMIT_REQUIRED = "resubmit_required",
}

// export interface ExtendedDoctorData extends DoctorData {
//   name: string;
//   id: string;
//   user_id: string;
//   status: PractitionerStatus;
//   license_details: {
//     number: string;
//     issued_by: string;
//     expiry: string;
//   };
// }

export interface AdminSliceInitialStates {
  isLocationAddModal: boolean;
  editDoctorData: any;
  editNurseData: ExtendedNurseData | null;
}

export interface ExtendedNurseData extends NurseData {
  name: string;
  id: string;
  user_id: string;
  status: PractitionerStatus;
  license_details: {
    number: string;
    issued_by: string;
    expiry: string;
  };
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

// ================= DOCTOR PAYLOAD =================
export type AddDoctorPayload = {
  user: {
    tenant_id: string;
    name: string;
    email: string;
    hashed_password?: string;
    user_role: "doctor";
    phone?: string;
  };
  practitioner: {
    identifiers: { system: string; value: string }[];
    name: { prefix?: string[]; given: string[]; family: string };
    telecom?: { system: string; value: string; use: string }[];
    gender: string;
    birth_date: string;
    qualification: { degree: string; institution: string; year: string }[];
    license_details: { number: string; issued_by: string; expiry: string };
    profile_picture_url: string;
    license_url: string;
    is_active: boolean;
  };
  role: {
    tenant_id: string;
    code: {
      coding: { system: string; code: string; display: string }[];
      text: string;
    }[];
    specialty: { text: string }[];
    location: { reference: string; display: string }[];
    healthcare_service: { reference: string; display: string }[];
    period: { start: string; end: string };
    availability: {
      daysOfWeek: string[];
      availableTime: { start: string; end: string }[];
    }[];
    not_available: {
      description: string;
      during: { start: string; end: string };
    }[];
  };
};

export interface DoctorData {
  id: string;
  user_id: string;
  practitioner_display_id: string;
  is_active: boolean;
  e_sign_path: string | null;
  identifiers: {
    system: string;
    value: string;
  }[];
  status: string | null;
  gender: string | null;
  birth_date: string | null;
  license_url: string | null;
  profile_picture_url: string | null;
  user: {
    id: string;
    is_active: boolean;
    name: string;
    email: string;
    phone: string;
    user_role: string;
    created_at: string;
    updated_at: string;
    tenant: {
      id: string;
      active: boolean;
      name: string;
      alias: string[];
      contact: {
        name: string;
        telecom: {
          system: string;
          value: string;
          use: string | null;
        }[];
        address: any;
        purpose: any;
      }[];
    };
  };
  license_details: {
    issued_by: string;
    number: string;
    expiry: string;
  };
  qualification: {
    degree?: string;
    institution?: string;
    year?: string;
  }[];
  availability_status: {
    practitioner_id: string;
    practitioner_name: string;
    date: string;
    availability_status: string;
    attendance_details: {
      attendance_id: string;
      status: string;
      check_in_time: string | null;
      check_out_time: string | null;
      total_hours: string | null;
    } | null;
    break_details: any;
    check_in_time: string | null;
    check_out_time: string | null;
    total_hours: string | null;
  };
  name: {
    use: string | null;
    text: string | null;
    family: string;
    given: string[];
    prefix: string[];
    suffix: string | null;
    period: any;
  };
  telecom: {
    system: string;
    value: string;
    use: string;
    rank: number | null;
    period: any;
  }[];
}

// export type ExtendedDoctorData = DoctorData & {
//   name: string;
//   id: string;
//   user_id: string;
//   // license_details: {
//   //   number?: string;
//   //   issued_by?: string;
//   //   expiry?: string;
//   // };
//   // qualification: {
//   //   degree?: string;
//   //   institution?: string;
//   //   year?: string;
//   // }[];
//   // availability_status: {
//   //   availability_status: string;
//   // };
// };

export type UpdateDoctorPayload = {
  id: string;
  user_role?: string | null | undefined;
  user_id: string;
  practitioner_display_id: string;
  identifiers: {
    system: string;
    value: string;
  }[];
  name: {
    use?: string | null;
    text?: string | null;
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string | null;
    period?: string | null;
  };
  telecom: {
    system: string;
    value: string;
    use: string;
    rank?: number | null;
    period?: string | null;
  }[];
  gender: string;
  birth_date: string;
  qualification: {
    degree?: string;
    institution?: string;
    graduation_year?: string;
  }[];
  is_active: boolean;
  license_details: {
    number: string;
    issued_by: string;
    expiry: string;
  };
  profile_picture_url: string;
  license_url: string;
  e_sign_path?: string | null;
  status: string;
};

// ================= NURSE PAYLOAD =================
export type AddNursePayload = {
  user: {
    tenant_id: string;
    name: string;
    email: string;
    hashed_password?: string;
    user_role: "nurse";
    phone?: string;
  };
  practitioner: {
    identifiers: { system: string; value: string }[];
    name: { prefix?: string[]; given: string[]; family: string };
    telecom?: { system: string; value: string; use: string }[];
    gender: string;
    birth_date: string;
    qualification: { degree: string; institution: string; year: string }[];
    license_details: { number: string; issued_by: string; expiry: string };
    profile_picture_url: string;
    license_url: string;
    is_active: boolean;
  };
  role: {
    tenant_id: string;
    code: {
      coding: { system: string; code: string; display: string }[];
      text: string;
    }[];
    specialty: { text: string }[];
    location: { reference: string; display: string }[];
    healthcare_service: { reference: string; display: string }[];
    period: { start: string; end: string };
    availability: {
      daysOfWeek: string[];
      availableTime: { start: string; end: string }[];
    }[];
    not_available: {
      description: string;
      during: { start: string; end: string };
    }[];
  };
};

export interface NurseData {
  practitioner_display_id: string | null;
  is_active: boolean;
  status: string | null;
  gender: string | null;
  birth_date: string | null;
  license_url: string | null;
  profile_picture_url: string | null;
  user: {
    is_active: boolean;
    name: string;
    email?: string;
    phone?: string | null;
    user_role?: "nurse";
  };
  license_details: {
    issued_by?: string | null;
    number?: string | null;
    expiry?: string | null;
  };
  qualification?: {
    degree: string | null;
    institution: string | null;
    graduation_year: string | null;
    year?: string | null;
  }[];
}

export type UpdateNursePayload = {
  id: string;
  user_id: string;
  practitioner_display_id: string;
  identifiers: {
    system: string;
    value: string;
  }[];
  name: {
    use?: string | null;
    text?: string | null;
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string | null;
    period?: string | null;
  };
  telecom: {
    system: string;
    value: string;
    use: string;
    rank?: number | null;
    period?: string | null;
  }[];
  gender: string;
  birth_date: string;
  qualification: {
    degree?: string;
    institution?: string;
    graduation_year?: string;
  }[];
  is_active: boolean;
  license_details: {
    number: string;
    issued_by: string;
    expiry: string;
  };
  profile_picture_url: string;
  license_url: string;
  e_sign_path?: string | null;
  status: string;
};
