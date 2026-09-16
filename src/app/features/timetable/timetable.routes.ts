import {Routes} from '@angular/router'; export const TIMETABLE_ROUTES:Routes=[{path:'',loadComponent:()=>import('./pages/timetable.component').then(m=>m.TimetableComponent)}];
