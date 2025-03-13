import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationFormComponentComponent } from './reservation-form-component.component';

describe('ReservationFormComponentComponent', () => {
  let component: ReservationFormComponentComponent;
  let fixture: ComponentFixture<ReservationFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
