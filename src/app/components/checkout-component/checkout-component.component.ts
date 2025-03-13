import {Component, inject, OnInit} from '@angular/core';
import {doc, docData, Firestore} from '@angular/fire/firestore';
import {SchedulerService} from '../../services/scheduler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Patient} from '../../models/patient.model';
import {Physician} from '../../models/physician.model';
import {map, Observable, of, switchMap} from 'rxjs';
import {ConsultationType, Appointment} from '../../models/appointment.model';
import {FormsModule} from '@angular/forms';
import {AsyncPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-checkout-component',
  templateUrl: './checkout-component.component.html',
  imports: [
    FormsModule,
    NgForOf,
    AsyncPipe
  ],
  styleUrls: ['./checkout-component.component.css']
})
export class CheckoutComponentComponent implements OnInit {
  day: string | undefined;
  hour: string | undefined;
  physicianId: number = 1;
  physician: Physician | undefined;
  consultationTypes = Object.keys(ConsultationType).filter(key => isNaN(Number(key)));
  selectedConsultationType: string | undefined;
  details: string = '';
  durationSlots: number = 1;
  availableSlots: Observable<number[]> = new Observable<number[]>();

  firestore = inject(Firestore);
  private userName: string | undefined;
  private patient: Patient | undefined;

  constructor(protected schedulerService: SchedulerService, private router: Router, private authService: AuthService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.day = params['day'];
      this.hour = params['hour'];
      this.physicianId = Number(params['physician']);
    });
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).subscribe(userData => {
          // @ts-ignore
          this.userName = userData.name;
          // @ts-ignore
          this.schedulerService.getPatientByName(this.userName).subscribe(
            patient => {
              this.patient = patient;
            }
          );
        });
      } else {
        this.userName = '';
      }
    });
    // @ts-ignore
    // this.physician = this.schedulerService.getPhysician(this.physicianId);
    // console.log(this.physicianId)
    // this.physician.subscribe(physician => {
    //     console.log(physician);
    // } );

    this.schedulerService.getPhysician(this.physicianId).subscribe(physician => {
        //console.log(physician);
        this.physician = physician;
    });

    this.availableSlots = this.calculateAvailableSlots();
  }

  checkIfTaken(day: Date, hour: string): Observable<boolean> {
    return this.schedulerService.getPhysicianAppointments(this.physicianId).pipe(
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
  calculateAvailableSlots(): Observable<number[]> {
    return this.schedulerService.getPhysician(this.physicianId).pipe(
      switchMap(physician => {
        if (!physician) {
          return of([]);
        }

        let slots = this.schedulerService.getAvailabilityForPhysician(physician, new Date(this.day!));
        let hourSplit = this.hour!.split(':');
        let hour = parseInt(hourSplit[0]);
        let minute = parseInt(hourSplit[1]);
        let hourString = this.hour!;
        // console.log(slots);
        // console.log(hourString);

        let maxSlots = 0;
        let avail: number[] = [];

        const checkSlot = (hourString: string): Observable<boolean> => {
          return this.checkIfTaken(new Date(this.day!), hourString);
        };

        const calculateSlots = (index: number): Observable<number[]> => {
          if (index >= slots.length) {
            return of(avail);
          }

          return checkSlot(hourString).pipe(
            switchMap(isTaken => {
              if (slots.some(slot => slot == hourString) && !isTaken) {
                // console.log(hourString);
                minute += 30;
                if (minute === 60) {
                  hour++;
                  minute = 0;
                }
                maxSlots++;
                hourString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                avail.push(maxSlots);
                return calculateSlots(index + 1);
              } else {
                return of(avail);
              }
            })
          );
        };

        return calculateSlots(0);
      })
    );
  }

  checkout(): void {
    if (this.patient && this.selectedConsultationType !== undefined) {
      const appointment: Appointment = {
        id: Date.now(), // Generate a unique ID
        date: new Date(this.day!),
        time: this.hour!,
        physician_id: this.physicianId,
        patient_id: this.patient.id,
        consultationType: ConsultationType[this.selectedConsultationType as keyof typeof ConsultationType],
        details: this.details,
        durationSlots: this.durationSlots,
        paid: false
      };
      console.log(appointment);
      console.log(typeof (ConsultationType[this.selectedConsultationType as keyof typeof ConsultationType]));
      this.schedulerService.addAppointment(appointment);
      this.router.navigate(['/cart']);
    }
  }
}
