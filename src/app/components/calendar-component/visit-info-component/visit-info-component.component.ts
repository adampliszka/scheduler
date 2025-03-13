import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-visit-info',
  templateUrl: './visit-info-component.component.html',
  styleUrls: ['./visit-info-component.component.css']
})
export class VisitInfoComponent {
  @Input() patientName: string | undefined;
  @Input() visitTime!: string | undefined;
  @Input() visitDate!: Date | undefined;
  @Input() visitDetails!: string | undefined;
}
