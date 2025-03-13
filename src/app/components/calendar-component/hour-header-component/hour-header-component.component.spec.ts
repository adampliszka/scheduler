import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourHeaderComponent } from './hour-header-component.component';

describe('HourHeaderComponent', () => {
  let component: HourHeaderComponent;
  let fixture: ComponentFixture<HourHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
