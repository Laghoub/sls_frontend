import { Routes } from '@angular/router';
export const EMPLOYEE_PORTAL_ROUTES: Routes = [
 {path:'',loadComponent:()=>import('./pages/home/employee-portal-home.component').then(m=>m.EmployeePortalHomeComponent)},
 {path:'classes',loadComponent:()=>import('./pages/classes/classes.component').then(m=>m.TeacherClassesComponent)},
 {path:'timetable',loadComponent:()=>import('./pages/timetable/timetable.component').then(m=>m.TeacherTimetableComponent)},
 {path:'attendance',loadComponent:()=>import('./pages/attendance/teacher-portal-attendance.component').then(m=>m.TeacherPortalAttendanceComponent)},
 {path:'payroll',loadComponent:()=>import('./pages/payroll/teacher-portal-payroll.component').then(m=>m.TeacherPortalPayrollComponent)},
 {path:'exercises',loadComponent:()=>import('./pages/exercises/exercises.component').then(m=>m.TeacherExercisesComponent)},
 {path:'term-evaluations',loadComponent:()=>import('../term-evaluations/teacher-term-evaluations.component').then(m=>m.TeacherTermEvaluationsComponent)},
 {path:'evaluations',loadComponent:()=>import('./pages/evaluations/teacher-evaluations.component').then(m=>m.TeacherEvaluationsComponent)}
];