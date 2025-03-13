import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianSelectorComponent } from './physician-selector-component.component';

describe('PhysicianSelectorComponent', () => {
  let component: PhysicianSelectorComponent;
  let fixture: ComponentFixture<PhysicianSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhysicianSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
