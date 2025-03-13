import {Component, inject, OnInit} from '@angular/core';
import {Physician} from '../../models/physician.model';
import {doc, docData, Firestore} from '@angular/fire/firestore';
import {AuthService} from '../../services/auth.service';
import {SchedulerService} from '../../services/scheduler.service';
import {Patient} from '../../models/patient.model';
import {Appointment} from '../../models/appointment.model';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-booked',
  templateUrl: './booked.component.html',
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    AsyncPipe
  ],
  styleUrls: ['./booked.component.css']
})
export class BookedComponent implements OnInit {
  userName: string = '';
  isPhysician: boolean = false;
  physician: Physician | undefined;
  patient: Patient | undefined;
  private firestore = inject(Firestore);

  constructor(protected authService: AuthService, protected schedulerService: SchedulerService) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).subscribe(userData => {
          // @ts-ignore
          this.userName = userData.name;
          // @ts-ignore
          this.isPhysician = userData.roles.physician;
          if (this.isPhysician) {
            this.schedulerService.getPhysicianByName(this.userName).subscribe(
              physician => {
                this.physician = physician;
              }
            );
          } else {
            this.schedulerService.getPatientByName(this.userName).subscribe(
              patient => {
                this.patient = patient;
              }
            );
          }
        });
      } else {
        this.userName = 'Register';
        this.isPhysician = false;
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (this.isPhysician && this.physician) {
      this.schedulerService.deleteAppointment(appointment.id);
    } else if (this.patient) {
      this.schedulerService.deleteAppointment(appointment.id);
    }
  }
}
