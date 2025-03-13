// timeslot.component.ts
import {Component, Input} from '@angular/core';
import {Appointment} from '../../../models/appointment.model';
import {NgClass, NgIf} from '@angular/common';
import {VisitInfoComponent} from '../visit-info-component/visit-info-component.component';

@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot-component.component.html',
  imports: [
    NgClass,
    VisitInfoComponent,
    NgIf
  ],
  styleUrls: ['./timeslot-component.component.css']
})
export class TimeslotComponent {
  @Input() appointment: Appointment | undefined | null;
  @Input() physicianId: number | undefined;
  @Input() day: Date | undefined | null;
  time: string | undefined | null;
  isHovered = false;

  ngOnInit(): void {
    this.time = this.appointment?.time
  }
  constructor() {}

  getTypeString(): string {
    //console.log(this.appointment?.consultationType);
    return `type${this.appointment?.consultationType}`;
  }
  onHoverStart(): void {
    this.isHovered = true;
  }
  onHoverEnd(): void {
    this.isHovered = false;
  }
}
