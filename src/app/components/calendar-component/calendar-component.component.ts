// calendar-component.component.ts
import {Component, inject, OnInit} from '@angular/core';
import { SchedulerService } from '../../services/scheduler.service';
import { map, Observable } from 'rxjs';
import { Physician } from '../../models/physician.model';
import { Appointment } from '../../models/appointment.model';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { PhysicianSelectorComponent } from './physician-selector-component/physician-selector-component.component';
import { DayHeaderComponent } from './day-header-component/day-header-component.component';
import { TimeslotComponent } from './timeslot-component/timeslot-component.component';
import { HourHeaderComponent } from './hour-header-component/hour-header-component.component';
import { Router } from '@angular/router';
import {doc, docData, Firestore} from '@angular/fire/firestore';
import {AuthService} from '../../services/auth.service';
import {Patient} from '../../models/patient.model';

@Component({
  selector: 'app-calendar',
  imports: [
    PhysicianSelectorComponent,
    DayHeaderComponent,
    TimeslotComponent,
    NgForOf,
    NgIf,
    AsyncPipe,
    HourHeaderComponent,
    NgClass
  ],
  templateUrl: './calendar-component.component.html',
  styleUrls: ['./calendar-component.component.css']
})
export class CalendarComponent implements OnInit {
  physicians$: Observable<Physician[]> | undefined;
  // appointmentDates$: Observable<AppointmentDate[]> | undefined;
  selectedPhysicianId: number | undefined;
  currentWeek: Date[] = [];
  displayedHours: string[] = [];
  private allHours: string[] = [];
  protected showAllHours: boolean = false;
  reserveMode: boolean = false;
  selectedTimeslot: { day: Date, hour: string } | null = null;

  isPhysician: boolean = true;
  userName: string = '';

  firestore = inject(Firestore);
  private patient: Patient | undefined;
  constructor(protected schedulerService: SchedulerService, private router: Router, private authService: AuthService) {} // Inject Router;


  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).subscribe(userData => {
          // @ts-ignore
          this.userName = userData.name;
          // @ts-ignore
          this.isPhysician = userData.roles.physician;
          if (!this.isPhysician) {
            this.schedulerService.getPatientByName(this.userName).subscribe(
              patient => {
                this.patient = patient;
                if(this.patient) {
                  this.isPhysician = false;
                }
              }
            );
          }
        });
      } else {
        this.userName = 'Register';
        this.isPhysician = true;
      }
    });


    this.physicians$ = this.schedulerService.getPhysicians();
    // this.appointmentDates$ = this.schedulerService.getAppointments();
    this.initializeCurrentWeek();
    this.initializeHours();
  }

  private initializeCurrentWeek(): void {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay(); // Get the start of the week (Sunday)
    this.currentWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(startOfWeek + i);
      return date;
    });
  }

  private initializeHours(): void {
    for (let hour = 8; hour < 18; hour++) {
      const hourString = hour.toString().padStart(2, '0');
      this.allHours.push(`${hourString}:00`);
      this.allHours.push(`${hourString}:30`);
    }
    this.setDisplayedHours();
  }

  private setDisplayedHours(): void {
    if (this.showAllHours) {
      this.displayedHours = this.allHours;
    } else {
      const currentHour = new Date().getHours();
      const closestHourIndex = this.allHours.findIndex(hour => parseInt(hour.split(':')[0]) >= currentHour);
      const start = Math.max(0, closestHourIndex - 3);
      const end = Math.min(this.allHours.length, start + 6);
      this.displayedHours = this.allHours.slice(start, end);
    }
  }

  toggleShowAllHours(): void {
    this.showAllHours = !this.showAllHours;
    this.setDisplayedHours();
  }

  selectPhysician(physicianId: number): void {
    this.selectedPhysicianId = physicianId;
  }

  previousWeek(): void {
    const firstDayOfCurrentWeek = this.currentWeek[0];
    firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7);
    this.updateCurrentWeek(firstDayOfCurrentWeek);
  }

  nextWeek(): void {
    const firstDayOfCurrentWeek = this.currentWeek[0];
    firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 7);
    this.updateCurrentWeek(firstDayOfCurrentWeek);
  }

  private updateCurrentWeek(startOfWeek: Date): void {
    this.currentWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  checkIfTaken(day: Date, hour: string): Observable<boolean> {
    return this.schedulerService.getPhysicianAppointments(this.selectedPhysicianId).pipe(
      map(appointments => {
        return appointments.some(appointment =>
          new Date(appointment.date).toDateString() === day.toDateString() &&
          appointment.slots.some(slot => {
            const slotTime = new Date(`${day.toDateString()} ${slot.time}`);
            const slotEndTime = new Date(slotTime);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + slot.durationSlots * 30);
            const currentTime = new Date(`${day.toDateString()} ${hour}`);
            return currentTime >= slotTime && currentTime < slotEndTime;
          })
        );
      })
    );
  }

  getTimeslot(day: Date, hour: string): Observable<Appointment | undefined> {
    return this.schedulerService.getPhysicianAppointments(this.selectedPhysicianId).pipe(
      map(appointments => {
        const appointmentsToday = appointments.find(appointment =>
          new Date(appointment.date).toDateString() === day.toDateString());
        if (appointmentsToday) {
          return appointmentsToday.slots.find(slot => {
            const slotTime = new Date(`${day.toDateString()} ${slot.time}`);
            const slotEndTime = new Date(slotTime);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + slot.durationSlots * 30);
            const currentTime = new Date(`${day.toDateString()} ${hour}`);
            return currentTime >= slotTime && currentTime < slotEndTime;
          });
        }
        return undefined;
      })
    );
  }

  getNumberOfAppointments(day: Date): Observable<number> {
    return this.schedulerService.getPhysicianAppointments(this.selectedPhysicianId).pipe(
      map(appointments => {
        return appointments.filter(appointment =>
          new Date(appointment.date).toDateString() === day.toDateString()).length;
      })
    );
  }

  isPast(hour: string, day: Date): boolean {
    const hourParts = hour.split(':');
    const hourNumber = parseInt(hourParts[0]);
    const minuteNumber = parseInt(hourParts[1]);

    const displayedDay = new Date(day);
    displayedDay.setHours(hourNumber);
    displayedDay.setMinutes(minuteNumber);
    const today = new Date();
    return today > displayedDay;
  }

  isToday(day: Date): boolean {
    return new Date().toDateString() === day.toDateString();
  }
  toggleReserveMode(): void {
    this.reserveMode = !this.reserveMode;
    this.selectedTimeslot = null;
  }

  selectTimeslot(day: Date, hour: string): void {
    if (this.reserveMode && !this.isPast(hour, day)) {
        this.selectedTimeslot = { day, hour };
    }
  }

  validateReservation(): boolean {
    if (!this.selectedTimeslot) {
      return false;
    }
    const { day, hour } = this.selectedTimeslot;
    if (this.isPast(hour, day)) {
      return false;
    }
    let isValid = false;
    this.checkIfTaken(day, hour).subscribe(isTaken => {
      isValid = !isTaken;
    });
    return isValid;
  }

  confirmReservation(): void {
    if (this.validateReservation()) {
      // @ts-ignore
      this.router.navigate(['/checkout'], { queryParams: { day: this.selectedTimeslot.day.toISOString(), hour: this.selectedTimeslot.hour, physician: this.selectedPhysicianId } });
    } else {
      alert('The selected timeslot is already taken.');
    }
  }
}
