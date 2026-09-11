import { Routes } from '@angular/router';

export const SCHOOL_ROUTES: Routes = [
  { path: 'school-years', loadComponent: () => import('./school-years/school-year-list/school-year-list.component').then(m => m.SchoolYearListComponent) },
  { path: 'cycles', loadComponent: () => import('./cycles/cycle-list/cycle-list.component').then(m => m.CycleListComponent) },
  { path: 'levels', loadComponent: () => import('./levels/level-list/level-list.component').then(m => m.LevelListComponent) },
  { path: 'campuses', loadComponent: () => import('./campuses/campus-list/campus-list.component').then(m => m.CampusListComponent) },
  { path: 'rooms', loadComponent: () => import('./rooms/room-list/room-list.component').then(m => m.RoomListComponent) },
  { path: 'classes', loadComponent: () => import('./class-groups/class-group-list/class-group-list.component').then(m => m.ClassGroupListComponent) },
  { path: 'time-slots', loadComponent: () => import('./time-slots/time-slot-list/time-slot-list.component').then(m => m.TimeSlotListComponent) },
  { path: 'calendar', loadComponent: () => import('./calendar/calendar-list/calendar-list.component').then(m => m.CalendarListComponent) }
];
