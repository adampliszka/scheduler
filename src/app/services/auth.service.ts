import {inject, Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user} from '@angular/fire/auth';
import {Firestore, doc, setDoc, updateDoc, docData} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private isLoggedIn: boolean = false;
  private userName = new Observable<string>();
  private isPatient = new Observable<boolean>();
  private isPhysician = new Observable<boolean>();
  private isAdmin = new Observable<boolean>();
  private isUnbanned = new Observable<boolean>();

  constructor(
    private router: Router
  ) {
    this.setCurrentUserData();
  }

  async register(name: string, email: string, password: string) {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, `users/${result.user.uid}`), {
      name: name,
      email: email,
      roles: { user: true, admin : false, physician: false }
    });
    await signInWithEmailAndPassword(this.auth, email, password);
    await this.router.navigate(['/calendar']);
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
    await this.router.navigate(['/calendar']);
  }

  async logout() {
    await signOut(this.auth);
    await this.router.navigate(['/calendar']);
  }

  getUser() {
    return user(this.auth);
  }

  async setAdmin(uid: string) {
    console.log(uid)
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.admin': true });
  }

  async setPhysician(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.physician': true });
  }

  async banUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.user': false });
  }

  async setCurrentUserData() {
    // user -> uid -> name in firestore -> physician from scheduler.service
    this.getUser().subscribe(user => {
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).subscribe((userData: any) => {
          //console.log(userData);
          this.isLoggedIn = true;
          this.userName = userData.name;
          this.isPatient = userData.roles.patient;
          this.isPhysician = userData.roles.physician;
          this.isAdmin = userData.roles.admin;
          this.isUnbanned = userData.roles.user;
        });
      }
    });
  }

  getCurrentUserData() {
    this.setCurrentUserData();
    return {
      userName: this.userName,
      isPatient: this.isPatient,
      isPhysician: this.isPhysician,
      isAdmin: this.isAdmin,
      isUnbanned: this.isUnbanned
    };
  }
}
