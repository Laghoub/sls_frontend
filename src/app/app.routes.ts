import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { changePasswordGuard } from './core/guards/change-password.guard';

export const routes: Routes = [
  /*
   * =========================
   * AUTHENTIFICATION
   * =========================
   */

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  {
    path: 'change-password',

    canActivate: [changePasswordGuard],

    loadComponent: () =>
      import('./features/auth/change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent,
      ),
  },

  /*
   * =========================
   * APPLICATION PRIVÉE
   * =========================
   */

  {
    path: '',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),

    children: [
      /*
       * Dashboard
       */
      {
        path: 'dashboard',

        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },

      /*
       * =========================
       * MODULE SCHOOL
       * =========================
       *
       * Toutes les routes :
       *
       * /school/school-years
       * /school/cycles
       * /school/levels
       * /school/campuses
       * /school/rooms
       * /school/classes
       * /school/time-slots
       * /school/calendar
       */

      {
        path: 'school',

        loadChildren: () =>
          import('./features/school/school.routes').then(
            (m) => m.SCHOOL_ROUTES,
          ),
      },

      {
        path: 'student',
        loadChildren: () =>
          import('./features/student/student.routes').then(
            (m) => m.STUDENT_ROUTES,
          ),
      },

      {
        path: 'registration',
        loadChildren: () =>
          import('./features/registration/registration.routes').then(
            (m) => m.REGISTRATION_ROUTES,
          ),
      },

      {
        path: 'finance',
        loadChildren: () =>
          import('./features/finance/finance.routes').then(
            (m) => m.FINANCE_ROUTES,
          ),
      },

      {
        path: 'hr',
        loadChildren: () =>
          import('./features/hr/hr.routes').then(
            (m) => m.HR_ROUTES,
          ),
      },

      {
        path: 'timetable',
        loadChildren: () => import('./features/timetable/timetable.routes').then((m) => m.TIMETABLE_ROUTES),
      },

      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then((m) => m.ATTENDANCE_ROUTES),
      },

      {
        path: 'payroll',
        loadChildren: () => import('./features/payroll/payroll.routes').then((m) => m.PAYROLL_ROUTES),
      },

      /*
       * Route par défaut
       */
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },

  /*
   * =========================
   * ROUTE INCONNUE
   * =========================
   */

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
