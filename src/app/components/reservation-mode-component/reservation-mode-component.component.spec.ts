import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationModeComponentComponent } from './reservation-mode-component.component';

describe('ReservationModeComponentComponent', () => {
  let component: ReservationModeComponentComponent;
  let fixture: ComponentFixture<ReservationModeComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationModeComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationModeComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
