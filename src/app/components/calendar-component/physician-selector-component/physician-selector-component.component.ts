// physician-selector.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { SchedulerService } from '../../../services/scheduler.service';
import { Observable } from 'rxjs';
import { Physician } from '../../../models/physician.model';
import {AsyncPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-physician-selector',
  templateUrl: './physician-selector-component.component.html',
  imports: [
    AsyncPipe,
    NgForOf
  ],
  styleUrls: ['./physician-selector-component.component.css']
})
export class PhysicianSelectorComponent implements OnInit {
  physicians$: Observable<Physician[]> | undefined;

  @Output() physicianSelected = new EventEmitter<number>();


  constructor(private schedulerService: SchedulerService) {}

  ngOnInit(): void {
    this.physicians$ = this.schedulerService.getPhysicians();
  }

  onPhysicianSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value: number = Number(target.value);
    this.physicianSelected.emit(value);
  }
}
