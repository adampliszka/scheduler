import { Component, Input } from '@angular/core';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-day-header',
  templateUrl: './day-header-component.component.html',
  imports: [
    DatePipe
  ],
  styleUrls: ['./day-header-component.component.css']
})
export class DayHeaderComponent {
  @Input() date: Date | undefined;
  @Input() appointments: number  | null | undefined;
}
