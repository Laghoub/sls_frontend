import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import { AuthService } from '../config/auth/services/auth.service';

export const changePasswordGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (currentUser) {

    if (currentUser.mustChangePassword) {
      return true;
    }

    return router.createUrlTree([
      '/dashboard'
    ]);
  }

  return authService
    .loadCurrentUser()
    .pipe(

      map(user => {

        if (user.mustChangePassword) {
          return true;
        }

        return router.createUrlTree([
          '/dashboard'
        ]);
      }),

      catchError(() => {

        authService.clearUser();

        return of(
          router.createUrlTree([
            '/login'
          ])
        );
      })

    );
};