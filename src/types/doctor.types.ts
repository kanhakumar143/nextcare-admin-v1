export interface doctorSliceInitialStates {
  confirmConsultationModalVisible: boolean;
}

interface VitalObservation {
  vital_definition: {
    name: string;
  };
  value: {
    value: string;
  };
}

interface PreQa {
  questionary: {
    question: string;
  };
  answer: string | null;
}

export interface AppointmentDetails {
  vital_observations: VitalObservation[];
  pre_qa: PreQa[];
}
