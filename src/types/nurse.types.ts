export interface VitalValue {
  value?: number;
}

export interface VitalInput {
  vital_def_id: string;
  value?: VitalValue;
  is_abnormal: boolean;
}

export interface BulkVitalsPayload {
  patient_id: string;
  appointment_id: string;
  recorded_by_id: string | null;
  vitals: VitalInput[];
}
