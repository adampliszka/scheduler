import {AppointmentDate} from './appointment.model';

export interface Physician {
  id: number;
  name: string;
  availableForThePeriods: { startDate: Date; endDate: Date }[];
  workingDaysOfTheWeek: boolean[]; // 0 (Sunday) to 7 (Sunday)
  workingHours: { start: string; end: string }[];
  absences: Date[];
  manualAvailability: { date: Date; slots: string[] }[];
  appointments: AppointmentDate[];
}
