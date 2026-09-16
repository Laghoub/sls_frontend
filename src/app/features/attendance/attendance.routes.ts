import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: 'teachers',
    loadComponent: () => import('./pages/teacher-attendance/teacher-attendance.component').then((m) => m.TeacherAttendanceComponent),
  },
  {
    path: 'teachers/history',
    loadComponent: () => import('./pages/teacher-attendance-history/teacher-attendance-history.component').then((m) => m.TeacherAttendanceHistoryComponent),
  },
  { path: 'students', loadComponent: () => import('./pages/student-attendance/student-attendance.component').then((m) => m.StudentAttendanceComponent) },
  { path: 'students/history', loadComponent: () => import('./pages/student-attendance-history/student-attendance-history.component').then((m) => m.StudentAttendanceHistoryComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'teachers' },
];
