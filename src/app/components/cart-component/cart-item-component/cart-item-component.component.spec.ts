import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartItemComponentComponent } from './cart-item-component.component';

describe('CartItemComponentComponent', () => {
  let component: CartItemComponentComponent;
  let fixture: ComponentFixture<CartItemComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartItemComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
