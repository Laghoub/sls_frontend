import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { changePasswordGuard } from './core/guards/change-password.guard';
import { dashboardAccessGuard } from './core/guards/dashboard-access.guard';
import { privateRoutePermissionGuard } from './core/guards/private-route-permission.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/website/public-website.component').then(m => m.PublicWebsiteComponent) },
  /*
   * =========================
   * AUTHENTIFICATION
   * =========================
   */


  {
    path: 'activation',
    loadComponent: () => import('./features/auth/activation/activation.component').then(m => m.ActivationComponent),
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/password-reset/password-reset.component').then(m => m.PasswordResetComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/password-reset/password-reset.component').then(m => m.PasswordResetComponent),
  },

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
    canActivateChild: [privateRoutePermissionGuard],

    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),

    children: [
      { path: 'access-denied', loadComponent: () => import('./features/access-denied/access-denied.component').then(m => m.AccessDeniedComponent) },
      { path: 'website-admin', loadComponent: () => import('./features/website/website-admin.component').then(m => m.WebsiteAdminComponent) },
      /*
       * Dashboard
       */
      {
        path: 'dashboard',

        canActivate: [dashboardAccessGuard],

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

      {
        path: 'my-space',
        loadChildren: () => import('./features/employee-portal/employee-portal.routes').then((m) => m.EMPLOYEE_PORTAL_ROUTES),
      },

      {
        path: 'transport',
        loadChildren: () => import('./features/transport/transport.routes').then((m) => m.TRANSPORT_ROUTES),
      },

      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit.component').then(m => m.AuditComponent),
      },

      {
        path: 'access-management',
        loadComponent: () => import('./features/access-management/access-management.component').then(m => m.AccessManagementComponent),
      },

      {
        path: 'term-evaluations/statistics',
        loadComponent: () => import('./features/term-evaluations/evaluation-statistics.component').then(m => m.EvaluationStatisticsComponent),
      },
      {
        path: 'term-evaluations',
        loadComponent: () => import('./features/term-evaluations/term-evaluations.component').then(m => m.TermEvaluationsComponent),
      },
      {path:'appointments-admin',loadComponent:()=>import('./features/appointments/admin-appointments.component').then(m=>m.AdminAppointmentsComponent)},
      {
        path: 'parent-space',
        loadComponent: () => import('./features/parent-portal/parent-portal.component').then(m => m.ParentPortalComponent),
      },
      {
        path: 'student-space',
        loadComponent: () => import('./features/student-portal/student-portal.component').then(m => m.StudentPortalComponent),
      },

      /*
       * Route par défaut
       */

    ],
  },

  /*
   * =========================
   * ROUTE INCONNUE
   * =========================
   */

  {
    path: '**',
    redirectTo: '',
  },
];
