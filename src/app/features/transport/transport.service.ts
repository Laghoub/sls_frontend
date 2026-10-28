import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';

export interface Vehicle { id?:number; code:string; registrationNumber:string; brand?:string; model?:string; capacity:number; insuranceExpiry?:string; technicalInspectionExpiry?:string; status:string; notes?:string; }
export interface Driver { id?:number; lastName:string; firstName:string; phone?:string; licenseNumber:string; licenseExpiry?:string; status:string; notes?:string; }
export interface Route { id?:number; schoolYearId:number; code:string; name:string; vehicleId?:number|null; driverId?:number|null; morningDeparture?:string; returnDeparture?:string; active:boolean; notes?:string; }
export interface Stop { id?:number; routeId?:number; name:string; stopOrder:number; morningTime?:string; returnTime?:string; address?:string; latitude?:number|null; longitude?:number|null; active:boolean; }
export interface Assignment { id?:number; studentEnrollmentId:number; routeId:number; stopId:number; serviceType:string; monthlyFee:number; startDate:string; endDate?:string|null; status?:string; }
@Injectable({providedIn:'root'})
export class TransportService {
 private http=inject(HttpClient); private base=`${API_CONFIG.baseUrl}/transport`;
 vehicles(){return this.http.get<Vehicle[]>(`${this.base}/vehicles`)}
 saveVehicle(v:Vehicle){return v.id?this.http.put<Vehicle>(`${this.base}/vehicles/${v.id}`,v):this.http.post<Vehicle>(`${this.base}/vehicles`,v)}
 drivers(){return this.http.get<Driver[]>(`${this.base}/drivers`)}
 saveDriver(v:Driver){return v.id?this.http.put<Driver>(`${this.base}/drivers/${v.id}`,v):this.http.post<Driver>(`${this.base}/drivers`,v)}
 routes(year?:number|null){let p=new HttpParams();if(year)p=p.set('schoolYearId',year);return this.http.get<Route[]>(`${this.base}/routes`,{params:p})}
 saveRoute(v:Route){return v.id?this.http.put<Route>(`${this.base}/routes/${v.id}`,v):this.http.post<Route>(`${this.base}/routes`,v)}
 stops(routeId:number){return this.http.get<Stop[]>(`${this.base}/routes/${routeId}/stops`)}
 saveStop(routeId:number,v:Stop){return v.id?this.http.put<Stop>(`${this.base}/routes/${routeId}/stops/${v.id}`,v):this.http.post<Stop>(`${this.base}/routes/${routeId}/stops`,v)}
 assignments(){return this.http.get<Assignment[]>(`${this.base}/assignments`)}
 assign(v:Assignment){return this.http.post<Assignment>(`${this.base}/assignments`,v)}
 close(id:number){return this.http.post(`${this.base}/assignments/${id}/close`,{})}
 generate(id:number){return this.http.post<{created:number}>(`${this.base}/assignments/${id}/generate-charges`,{})}
}
