import {Component, inject, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import { AuthService } from '../../services/auth.service';
import {doc, docData, Firestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-global-menu',
  templateUrl: './global-menu.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./global-menu.component.css']
})
export class GlobalMenuComponent implements OnInit {
  userName: string = '';
  isLoggedIn: boolean = false;
  isPatient: boolean = false;
  isPhysician: boolean = false;
  isAdmin: boolean = false;

  private firestore = inject(Firestore);
  constructor(protected authService: AuthService) {}



  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.isLoggedIn = true;
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).subscribe(userData => {
          // @ts-ignore
          this.userName = userData.name;
          // @ts-ignore
          this.isPatient = userData.roles.patient;
          // @ts-ignore
          this.isPhysician = userData.roles.physician;
          // @ts-ignore
          this.isAdmin = userData.roles.admin;
        });
      } else {
        this.isLoggedIn = false;
        this.userName = 'Register';
        this.isPatient = false;
        this.isPhysician = false;
        this.isAdmin = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
