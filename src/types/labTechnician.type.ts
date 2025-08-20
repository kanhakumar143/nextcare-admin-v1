// Already existing
export interface UploadImageResponse {
  uploaded_files: {
    doc_type: string;
    file_url: string;
  }[];
  status: number;
  message?: string;
}

export interface fetchDetailsPayload {
  file_url: string;
}


// Single Lab Test Order
export interface LabOrder {
  id: string;
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_code: string;
  test_display: string;
  status: string;
  intent: string;
  priority: string;
  test_report_path: string | null;
  authored_on: string;
  created_at: string;
  updated_at: string;
  notes: any[];
}

// Appointment with lab orders
export interface LabAppointment {
  id: string;
  slot_info: {
    start: string;
    end: string;
  };
  service_category: { text: string }[];
  status: string;
  description: string;
  lab_test_orders?: LabOrder[]; 
}

// Patient details
export interface LabPatient {
  user_id: string;
  name: string;
  phone: string;
  patient_profile?: {
    gender?: string;
  };
}

// Full QR Details object for Lab Tech
export interface LabQrDetails {
  appointment: LabAppointment;
  patient: LabPatient;
}
