import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
export interface AssessmentSchedule { id:number; title:string; class_group_id:number; class_name:string; school_year_id:number; school_year:string; assessment_type:'DEVOIR'|'EXAMEN'; term:number; status:'DRAFT'|'PUBLISHED'|'ARCHIVED'; entries?:AssessmentEntry[]; }
export interface AssessmentEntry { id:number; subject_id:number; subject_name:string; assessment_date:string; start_time:string; end_time:string; room?:string; instructions?:string; }
export interface PortalAssessment { schedule_id:number; title:string; assessment_type:string; term:number; class_name:string; assessment_date:string; start_time:string; end_time:string; subject_name:string; room?:string; instructions?:string; student_id?:number; student_first_name?:string; student_last_name?:string; }
@Injectable({providedIn:'root'}) export class AssessmentPlanningService {
 private http=inject(HttpClient); private base=`${API_CONFIG.baseUrl}/assessment-planning`;
 list(){return this.http.get<AssessmentSchedule[]>(this.base)}
 subjectsForSchedule(id:number){return this.http.get<{id:number;name:string}[]>(`${this.base}/${id}/subjects`)}
 detail(id:number){return this.http.get<AssessmentSchedule>(`${this.base}/${id}`)}
 create(data:object){return this.http.post<AssessmentSchedule>(this.base,data)}
 update(id:number,data:object){return this.http.put<AssessmentSchedule>(`${this.base}/${id}`,data)}
 remove(id:number){return this.http.delete<void>(`${this.base}/${id}`)}
 addEntry(id:number,data:object){return this.http.post(`${this.base}/${id}/entries`,data)}
 editEntry(id:number,entryId:number,data:object){return this.http.put(`${this.base}/${id}/entries/${entryId}`,data)}
 deleteEntry(id:number,entryId:number){return this.http.delete<void>(`${this.base}/${id}/entries/${entryId}`)}
 publish(id:number){return this.http.patch(`${this.base}/${id}/publish`,{})}
 archive(id:number){return this.http.patch(`${this.base}/${id}/archive`,{})}
 print(id:number){return this.http.get(`${this.base}/${id}/print`,{responseType:'blob'})}
 teacher(){return this.http.get<PortalAssessment[]>(`${this.base}/portal/teacher`)}
 parent(){return this.http.get<PortalAssessment[]>(`${this.base}/portal/parent`)}
}
