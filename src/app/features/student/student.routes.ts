import { Routes } from '@angular/router';
export const STUDENT_ROUTES: Routes = [
  {
    path: 'students',
    loadComponent: () =>
      import('./students/student-list/student-list.component').then(
        (m) => m.StudentListComponent,
      ),
  },
  {
    path: 'students/:id',
    loadComponent: () =>
      import('./students/student-detail/student-detail.component').then(
        (m) => m.StudentDetailComponent,
      ),
  },
  {
    path: 'guardians',
    loadComponent: () =>
      import('./guardians/guardian-list/guardian-list.component').then(
        (m) => m.GuardianListComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'students' },
];
