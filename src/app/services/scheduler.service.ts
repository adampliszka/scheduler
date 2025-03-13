import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, from, map, Observable, of, switchMap, tap} from 'rxjs';
import { Patient } from '../models/patient.model';
import { Physician } from '../models/physician.model';
import {Appointment, AppointmentDate} from '../models/appointment.model';
import { environment } from '../../environments/environment';
import {Firestore, collectionData, collection, addDoc} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class SchedulerService {
  private jsonServerUrl = 'http://localhost:3000';
  private restServerUrl = 'http://localhost:8080';
  private dbUrl = environment.dataSrc === 1 ? this.restServerUrl : this.jsonServerUrl;

  private physiciansSubject = new BehaviorSubject<Physician[]>([]);
  private patientsSubject = new BehaviorSubject<Patient[]>([]);

  firestore = inject(Firestore);
  private physiciansCollection = collection(this.firestore, 'physicians');
  private patientsCollection = collection(this.firestore, 'patients');


  constructor(private http: HttpClient) {
    this.loadData();
  }

  private loadData(): void {
    if (environment.dataSrc === 0) {
      this.loadFromFirestore();
    } else if (environment.dataSrc === 1) {
      this.loadFromRestApi();
    } else if (environment.dataSrc === 2) {
      this.loadFromJsonServer();
    }
  }

  private loadFromFirestore(): void {
    // const appointments = collectionData(this.appointmentsCollection) as Observable<AppointmentDate[]>;
    // const physicians = collectionData(this.physiciansCollection) as Observable<Physician[]>;
    // const patients = collectionData(this.patientsCollection) as Observable<Patient[]>;
  }

  private loadFromRestApi(): void {
    // this.http.get<AppointmentDate[]>(`${this.restServerUrl}/appointments`).subscribe((appointments) => {
    //   this.appointmentsSubject.next(appointments);
    // });
    this.http.get<Physician[]>(`${this.restServerUrl}/physicians`).subscribe((physicians) => {
      this.physiciansSubject.next(physicians);
    });
    this.http.get<Patient[]>(`${this.restServerUrl}/patients`).subscribe((patients) => {
      this.patientsSubject.next(patients);
    });
  }

  private loadFromJsonServer(): void {
    // this.http.get<AppointmentDate[]>(`${this.jsonServerUrl}/appointments`).subscribe((appointments) => {
    //   this.appointmentsSubject.next(appointments);
    // });
    this.http.get<Physician[]>(`${this.jsonServerUrl}/physicians`).subscribe((physicians) => {
      this.physiciansSubject.next(physicians);
    });
    this.http.get<Patient[]>(`${this.jsonServerUrl}/patients`).subscribe((patients) => {
      this.patientsSubject.next(patients);
    });
  }


  getPhysicians(): Observable<Physician[]> {
    if (environment.dataSrc === 0) {
      return collectionData(this.physiciansCollection) as Observable<Physician[]>;
    }
    else {
      return this.physiciansSubject.asObservable();
    }
  }
  getPhysician(id: number): Observable<Physician | undefined> {
    return this.getPhysicians().pipe(
      map((physicians) => {
        return physicians.find((p) => p.id === id);
      })
    );
  }
  getPatients(): Observable<Patient[]> {
    if (environment.dataSrc === 0) {
      return collectionData(this.patientsCollection) as Observable<Patient[]>;
    }
    else {
      return this.patientsSubject.asObservable();
    }
  }
  getPatient(id: number): Observable<Patient | undefined> {
    return this.getPatients().pipe(
      map((patients) => {
        return patients.find((p) => p.id === id);
      })
    );
  }
  // getAppointments(): Observable<AppointmentDate[]> {
  //   if (environment.dataSrc === 0) {
  //     return collectionData(this.appointmentsCollection) as Observable<AppointmentDate[]>;
  //   }
  //   else {
  //     return this.appointmentsSubject.asObservable();
  //   }
  // }

  // getAppointment(id: number): Observable<Appointment | undefined> {
  //   return this.getAppointments().pipe(
  //     map((appointments) => {
  //       return appointments.flatMap((a) => a.slots).find((a) => a.id === id);
  //     })
  //   );
  // }

  getAvailabilityForPhysicianById(physicianId: number | undefined, day: Date): Observable<string[]> {
    if (!physicianId) {
      return of([]);
    }
    return this.getPhysician(physicianId).pipe(
      map((physician) => {
        if(!physician){
          throw new Error('Physician not found');
        }
        return this.getAvailabilityForPhysician(physician, day);
      })
    );
  }
  getAvailabilityForPhysician(physician: Physician, day: Date): string[] {
      if (!physician) {
        throw new Error('Physician not found');
      }

      const selectedDate = new Date(day);
      selectedDate.setHours(0, 0, 0, 0);

      if (physician.absences.some((absence) => {
        const absenceDate = new Date(absence);
        absenceDate.setHours(0, 0, 0, 0);
        return absenceDate.getTime() === selectedDate.getTime();
      })) {
        return [];
      }

      const manualAvailability = physician.manualAvailability.find((manual) => {
        const manualDate = new Date(manual.date);
        manualDate.setHours(0, 0, 0, 0);
        return manualDate.getTime() === selectedDate.getTime();
      });
      if (manualAvailability) {
        return manualAvailability.slots;
      }

      const isInAvailablePeriod = physician.availableForThePeriods.some((period) => {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return selectedDate.getTime() >= start.getTime() && selectedDate.getTime() <= end.getTime();
      });
      if (!isInAvailablePeriod) {
        return [];
      }

      const dayOfWeek = selectedDate.getDay();
      if (!physician.workingDaysOfTheWeek[dayOfWeek]) {
        return [];
      }

      const timeslots: string[] = [];
      physician.workingHours.forEach((hours) => {
        const [startHour, startMinute] = hours.start.split(':').map(Number);
        const [endHour, endMinute] = hours.end.split(':').map(Number);

        let current = new Date(day);
        current.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(day);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (current < endTime) {
          timeslots.push(current.toTimeString().slice(0, 5)); // Format HH:mm
          current.setMinutes(current.getMinutes() + 30);
        }
      });
      return timeslots;
  }

  getPhysicianAppointments(physicianId: number | undefined): Observable<AppointmentDate[]> {
    return this.getPhysicians().pipe(
      map((physicians) => {
        const physician = physicians.find((p) => p.id === physicianId);
        if (!physician) {
          throw new Error('Physician not found {id: ' + physicianId + '}');
        }
        return physician.appointments;
      })
    );
  }

  checkAvailabilityForPhysician(physicianId: number | undefined, day: Date, time: string): Observable<boolean> {
    return this.getAvailabilityForPhysicianById(physicianId, day).pipe(
      switchMap((slots) => of(slots.includes(time)))
    );
  }

  addPatient(patient: Patient): Observable<Patient> {
    switch (environment.dataSrc) {
      case 0:
        return from(addDoc(this.patientsCollection, patient).then(() => {
          return patient;
        }));
      default:
        return this.http.post<Patient>(`${this.dbUrl}/patients`, patient).pipe(
          tap(() => this.loadData())
        );
    }
  }
  addPhysician(physician: Physician): Observable<Physician> {
    switch (environment.dataSrc) {
      case 0:
        return from(addDoc(this.physiciansCollection, physician).then(() => {
          return physician;
        }));
      default:
        return this.http.post<Physician>(`${this.dbUrl}/physicians`, physician).pipe(
          tap(() => this.loadData())
        );
    }
  }
  addAppointment(appointment: Appointment) {
    const physician = this.physiciansSubject.value.find((p) => p.id === appointment.physician_id);
    if (!physician) {
      throw new Error('Physician not found');
    }
    const patient = this.patientsSubject.value.find((p) => p.id === appointment.patient_id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    if(appointment.date < new Date()){
      throw new Error('Appointment date is in the past');
    }
    if(!this.checkAvailabilityForPhysician(appointment.physician_id, appointment.date, appointment.time)){
      throw new Error('Time slot is not available');
    }

    const existingAppointmentDate = physician.appointments.find((a) => {
      const aDate = new Date(a.date);
      aDate.setHours(0, 0, 0, 0);
      const appDate = new Date(appointment.date);
      appDate.setHours(0, 0, 0, 0);
      return aDate.getTime() === appDate.getTime();
    });
    if (!existingAppointmentDate) {
      physician.appointments.push({
        date: appointment.date,
        slots: [appointment],
      });
    } else {
      existingAppointmentDate.slots.push(appointment);
    }

    const existingAppointmentDatePatient = patient.appointments.find((a) => {
      const aDate = new Date(a.date);
      aDate.setHours(0, 0, 0, 0);
      const appDate = new Date(appointment.date);
      appDate.setHours(0, 0, 0, 0);
      return aDate.getTime() === appDate.getTime();
    });
    if (!existingAppointmentDatePatient) {
      patient.appointments.push({
        date: appointment.date,
        slots: [appointment],
      });
    } else {
      existingAppointmentDatePatient.slots.push(appointment);
    }

    this.updatePatient(patient).subscribe();
    this.updatePhysician(physician).subscribe();

    // switch (environment.dataSrc) {
    //   case 0:
    //     return from(addDoc(this.appointmentsCollection, appointment).then(() => {
    //       return appointment;
    //     }));
    //   default:
    //     return this.http.post<AppointmentDate>(`${this.dbUrl}/appointments`, {
    //       date: appointment.date,
    //       slots: [appointment]
    //     }).pipe(
    //       map((appointmentDate: AppointmentDate) => {
    //         const foundAppointment = appointmentDate.slots.find(slot => slot.id === appointment.id);
    //         if (!foundAppointment) {
    //           throw new Error('Appointment not found');
    //         }
    //         return foundAppointment;
    //       }),
    //       tap(() => this.loadData())
    //     );
    // }
  }

  updatePatient(patient: Patient): Observable<Patient> {
    switch (environment.dataSrc) {
      case 0:
        // TODO: Firestore
        // updateDoc(this.patientsCollection, patient.id, patient);
        // return from(addDoc(this.patientsCollection, patient).then(() => {
        //   return patient;
        // }));
      default:
        return this.http.put<Patient>(`${this.dbUrl}/patients/${patient.id}`, patient).pipe(
          tap(() => this.loadData())
        );
    }
  }
  updatePhysician(physician: Physician): Observable<Physician> {
    switch (environment.dataSrc) {
      case 0:
      // TODO: Firestore
      default:
        return this.http.put<Physician>(`${this.dbUrl}/physicians/${physician.id}`, physician).pipe(
          tap(() => this.loadData())
        );
    }
  }
  updateAppointment(appointment: Appointment) {
    // TODO: PUT?
    this.deleteAppointment(appointment.id);
    this.addAppointment(appointment);
  }

  deletePatient(id: number): Observable<void> {
    switch (environment.dataSrc) {
      case 0:
        //TODO: Firestore
      default:
        return this.http.delete<void>(`${this.dbUrl}/patients/${id}`).pipe(
          tap(() => this.loadData())
        );
    }
  }
  deletePhysician(id: number): Observable<void> {
    switch (environment.dataSrc) {
      case 0:
        //TODO: Firestore
      default:
        return this.http.delete<void>(`${this.dbUrl}/physicians/${id}`).pipe(
          tap(() => this.loadData())
        );
    }
  }
  deleteAppointment(id: number){  //TODO: FIX, NOT WORKING
    // const appointmentDate = this.appointmentsSubject.value.find((a) => a.slots.some((s) => s.id === id));
    const appointmentDate = this.physiciansSubject.value.flatMap((p) => p.appointments).find((a) => a.slots.some((s) => s.id === id));
    if (!appointmentDate) {
      throw new Error('Appointment not found');
    }
    const appointment = appointmentDate.slots.find((s) => s.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    const physician = this.physiciansSubject.value.find((p) => p.id === appointment.physician_id);
    if (!physician) {
      throw new Error('Physician not found');
    }
    const patient = this.patientsSubject.value.find((p) => p.id === appointment.patient_id);
    if (!patient) {
      throw new Error('Patient not found');
    }

    console.log(appointmentDate);
    const indexPhysician = physician.appointments.findIndex((a) => a.slots.some((s) => s.id === id));
    if (indexPhysician === -1) {
      throw new Error('Appointment not found in physician');
    }
    const indexAppointmentPhysician = physician.appointments[indexPhysician].slots.findIndex((a) => a.id === id);
    if (indexAppointmentPhysician === -1) {
      throw new Error('Appointment not found in physician');
    }
    physician.appointments[indexPhysician].slots.splice(indexAppointmentPhysician, 1);
    this.updatePhysician(physician).subscribe();

    const indexPatient = patient.appointments.findIndex((a) => a.slots.some((s) => s.id === id));
    if (indexPatient === -1) {
      throw new Error('Appointment not found in physician');
    }
    const indexAppointmentPatient = patient.appointments[indexPatient].slots.findIndex((a) => a.id === id);
    if (indexAppointmentPatient === -1) {
      throw new Error('Appointment not found in patient');
    }
    patient.appointments[indexPatient].slots.splice(indexAppointmentPatient, 1);
    this.updatePatient(patient).subscribe();

    // switch (environment.dataSrc) {
    //   case 0:
    //     //TODO: Firestore
    //   default:
    //     return this.http.delete<void>(`${this.dbUrl}/appointments/${appointmentDate.date}/${id}`).pipe(
    //       tap(() => this.loadData())
    //     );
    // }
  }

  // deleteAppointmentDate(date: Date): Observable<void> {
  //   const appointmentDate = this.appointmentsSubject.value.find((a) => {
  //     const aDate = new Date(a.date);
  //     aDate.setHours(0, 0, 0, 0);
  //     const appDate = new Date(date);
  //     appDate.setHours(0, 0, 0, 0);
  //     return aDate.getTime() === appDate.getTime();
  //   });
  //   if (!appointmentDate) {
  //     throw new Error('Appointment date not found');
  //   }
  //   appointmentDate.slots.forEach((slot) => {
  //     this.deleteAppointment(slot.id).subscribe();
  //   });
  //   return this.http.delete<void>(`${this.dbUrl}/appointments/${date}`).pipe(
  //     tap(() => this.loadData())
  //   );
  // }

  getPhysicianByName(userName: string) {
    return this.getPhysicians().pipe(
      map((physicians) => {
        return physicians.find((p) => p.name === userName);
      })
    );
  }

  getPatientByName(userName: string) {
    return this.getPatients().pipe(
      map((patients) => {
        return patients.find((p) => p.name === userName);
      })
    );
  }
}
