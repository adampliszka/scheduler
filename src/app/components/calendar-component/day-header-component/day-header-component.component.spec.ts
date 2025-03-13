import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayHeaderComponent } from './day-header-component.component';

describe('DayHeaderComponent', () => {
  let component: DayHeaderComponent;
  let fixture: ComponentFixture<DayHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
