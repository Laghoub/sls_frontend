import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../config/auth/services/auth.service';

/**
 * Un enseignant ne doit jamais arriver sur le tableau de bord administratif.
 * Après authentification (authGuard parent), son espace d'accueil est /my-space.
 */
export const dashboardAccessGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const home = auth.homeRoute();
  if (home !== '/dashboard') {
    return router.createUrlTree([home]);
  }

  return true;
};
