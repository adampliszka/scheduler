import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  name: string = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.name, this.email, this.password);
  }
}
