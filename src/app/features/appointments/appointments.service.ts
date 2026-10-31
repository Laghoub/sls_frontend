import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
@Injectable({providedIn:'root'})
export class AppointmentsService {
 private http=inject(HttpClient); private url=`${API_CONFIG.baseUrl}/appointments`;
 children(){return this.http.get<any[]>(`${this.url}/parent/children`)}
 teachers(id:number){return this.http.get<any[]>(`${this.url}/parent/children/${id}/teachers`)}
 parentList(){return this.http.get<any[]>(`${this.url}/parent`)}
 create(body:any){return this.http.post<any>(`${this.url}/parent`,body)}
 cancel(id:number){return this.http.post<any>(`${this.url}/parent/${id}/cancel`,{})}
 teacherStudents(){return this.http.get<any[]>(`${this.url}/teacher/students`)}
 teacherSummons(){return this.http.get<any[]>(`${this.url}/teacher/summons`)}
 createSummons(body:any){return this.http.post<any>(`${this.url}/teacher/summons`,body)}
 teacherList(){return this.http.get<any[]>(`${this.url}/teacher`)}
 adminList(status=''){return this.http.get<any[]>(`${this.url}/admin`,{params:status?new HttpParams().set('status',status):undefined})}
 confirm(id:number,body:any){return this.http.post<any>(`${this.url}/admin/${id}/confirm`,body)}
 reject(id:number,reason:string){return this.http.post<any>(`${this.url}/admin/${id}/reject`,{reason})}
 reschedule(id:number,body:any){return this.http.post<any>(`${this.url}/admin/${id}/reschedule`,body)}
 notifications(id:number){return this.http.get<any[]>(`${this.url}/admin/${id}/notifications`)}
}
