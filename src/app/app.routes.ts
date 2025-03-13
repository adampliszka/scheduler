import { Routes } from '@angular/router';
import {CalendarComponent} from './components/calendar-component/calendar-component.component';
import {ReservationFormComponentComponent} from './components/reservation-form-component/reservation-form-component.component';
import {CartComponentComponent} from './components/cart-component/cart-component.component';
import {CheckoutComponentComponent} from './components/checkout-component/checkout-component.component';
import {RegisterComponent} from './components/auth-component/register/register.component';
import {LoginComponent} from './components/auth-component/login/login.component';
import {AdminComponent} from './components/auth-component/admin-panel/admin-panel.component';
import {AvailabilityComponent} from './components/availability-component/availability.component';
import {BookedComponent} from './components/booked/booked.component';
import {AuthAdminGuard} from './guards/auth-admin.guard';
import {AuthUserGuard} from './guards/auth-user.guard';
import {AuthPhysicianGuard} from './guards/auth-physician.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'calendar', component: CalendarComponent },
  { path: 'cart', component: CartComponentComponent, canActivate: [AuthUserGuard] },
  { path: 'checkout', component: CheckoutComponentComponent },
  { path: 'reservation', component: ReservationFormComponentComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthAdminGuard] },
  { path: 'manage-schedule', component: AvailabilityComponent, canActivate: [AuthPhysicianGuard] },
  { path: 'my-schedule', component: BookedComponent, canActivate: [AuthUserGuard] }
];
