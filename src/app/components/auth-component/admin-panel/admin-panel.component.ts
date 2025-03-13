import { Component } from '@angular/core';
import {Firestore, collectionData, collection, doc, updateDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminComponent {
  users$: Observable<any[]>;

  constructor(private firestore: Firestore) {
    const usersCollection = collection(this.firestore, 'users');
    this.users$ = collectionData(usersCollection, { idField: 'id' });
  }

  async setAdmin(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.admin': true });
  }

  async removeAdmin(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.admin': false });
  }

  async setPhysician(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.physician': true });
  }

  async removePhysician(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.physician': false });
  }

  async banUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.user': false });
  }

  async unbanUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, { 'roles.user': true });
  }
}
