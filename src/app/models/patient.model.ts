import {AppointmentDate} from './appointment.model';

enum sex {
  MALE,
  FEMALE,
}
export interface Patient {
  id: number;
  name: string;
  patientSex: sex;
  age: number;
  appointments: AppointmentDate[];
}
