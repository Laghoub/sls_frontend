import { Routes } from '@angular/router';
export const TRANSPORT_ROUTES: Routes=[{path:'',loadComponent:()=>import('./transport.component').then(m=>m.TransportComponent)}];
