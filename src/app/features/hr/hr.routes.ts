import { Routes } from '@angular/router';
export const HR_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent) },
  { path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
  { path: 'employees/:id', loadComponent: () => import('./pages/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent) },
  { path: 'teachers', loadComponent: () => import('./pages/teachers/teachers.component').then(m => m.TeachersComponent) },
  { path: 'teachers/:id', loadComponent: () => import('./pages/teacher-detail/teacher-detail.component').then(m => m.TeacherDetailComponent) },
  { path: 'assignments', loadComponent: () => import('./pages/assignments/assignments.component').then(m => m.AssignmentsComponent) },
  { path: 'compensation', loadComponent: () => import('./pages/compensation/compensation.component').then(m => m.CompensationComponent) },
  { path: 'subjects', loadComponent: () => import('./pages/subjects/subjects.component').then(m => m.SubjectsComponent) },
  { path: 'job-positions', loadComponent: () => import('./pages/job-positions/job-positions.component').then(m => m.JobPositionsComponent) },
];
