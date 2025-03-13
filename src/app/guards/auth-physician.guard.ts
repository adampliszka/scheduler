import {inject, Injectable} from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {doc, docData, Firestore} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthPhysicianGuard implements CanActivate {
  private firestore = inject(Firestore);

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // @ts-ignore
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (user) {
          const userRef = doc(this.firestore, `users/${user.uid}`);
          return docData(userRef).pipe(
            map(userData => {
              // @ts-ignore
              if (userData.roles.physician) {
                return true;
              } else {
                this.router.navigate(['/']);
                return false;
              }
            })
          );
        } else {
          this.router.navigate(['/']);
          return of(false);
        }
      })
    );
  }
}
