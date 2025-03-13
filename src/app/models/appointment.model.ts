export enum ConsultationType {
  Checkup=0,
  Followup=1,
  Refill=2,
  Chronic=3,
  First=4,
  Primary=5
}
export interface AppointmentDate {
  date: Date;
  slots: Appointment[];
}
export interface Appointment {
  id: number;
  date: Date;
  time: string;
  physician_id: number;
  patient_id: number;
  consultationType: ConsultationType;
  details?: string;
  durationSlots: number;
  paid: boolean;
}

