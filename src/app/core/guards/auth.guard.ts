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

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  /*
   * Si l'utilisateur est déjà chargé en mémoire,
   * inutile de rappeler le backend.
   */
  const currentUser = authService.currentUser();

  if (currentUser) {

    if (currentUser.mustChangePassword) {
      return router.createUrlTree([
        '/change-password'
      ]);
    }

    return true;
  }

  /*
   * Lors d'un F5, l'état Angular est perdu,
   * mais le navigateur possède toujours la session JSESSIONID.
   *
   * On demande donc au backend qui est connecté.
   */
  return authService
    .loadCurrentUser()
    .pipe(

      map(user => {

        if (user.mustChangePassword) {

          return router.createUrlTree([
            '/change-password'
          ]);
        }

        return true;
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