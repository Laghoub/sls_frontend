import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: 'teachers',
    loadComponent: () =>
      import('./pages/teacher-payroll/teacher-payroll.component').then(
        (m) => m.TeacherPayrollComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'teachers' },
];
