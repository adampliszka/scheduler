import { Component, Input } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-hour-header',
  templateUrl: './hour-header-component.component.html',
  imports: [
    NgIf,
  ],
  styleUrls: ['./hour-header-component.component.css']
})
export class HourHeaderComponent {
  @Input() time: string | undefined;
  currentHour = new Date();

  isCurrentHour(): boolean {
    // @ts-ignore
    const hourNumber = parseInt(this.time.split(':')[0], 10);
    // @ts-ignore
    const minuteNumber = parseInt(this.time.split(':')[1], 10);

    const minuteNumberRoundedTo30 = Math.round(this.currentHour.getMinutes() / 30) * 30;
    return hourNumber === this.currentHour.getHours() && minuteNumber === minuteNumberRoundedTo30 ;
  }
}
