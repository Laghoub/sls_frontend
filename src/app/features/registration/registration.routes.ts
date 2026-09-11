import { Routes } from '@angular/router';
export const REGISTRATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/registration-list/registration-list.component').then(
        (m) => m.RegistrationListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/registration-create/registration-create.component').then(
        (m) => m.RegistrationCreateComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/registration-detail/registration-detail.component').then(
        (m) => m.RegistrationDetailComponent,
      ),
  },
];
