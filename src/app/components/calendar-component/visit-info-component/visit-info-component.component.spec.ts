import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitInfoComponent } from './visit-info-component.component';

describe('VisitInfoComponent', () => {
  let component: VisitInfoComponent;
  let fixture: ComponentFixture<VisitInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
