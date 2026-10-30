import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
export interface Campaign { id:number; title:string; trimester:number; status:string; opens_at:string; closes_at:string; }
@Injectable({providedIn:'root'})
export class TermEvaluationsService {
 private http=inject(HttpClient); private base=`${API_CONFIG.baseUrl}/term-evaluations`;
 campaigns(){return this.http.get<Campaign[]>(`${this.base}/campaigns`);}
 create(data:unknown){return this.http.post<Campaign>(`${this.base}/campaigns`,data);}
 schedule(id:number){return this.http.patch<Campaign>(`${this.base}/campaigns/${id}/schedule`,{});}
 progress(id:number){return this.http.get<Record<string,unknown>[]>(`${this.base}/admin/campaigns/${id}/progress`);}
 evaluations(id:number,filters?:{subjectId?:number;levelId?:number;classGroupId?:number}){const params:Record<string,string>={};if(filters?.subjectId)params['subjectId']=String(filters.subjectId);if(filters?.levelId)params['levelId']=String(filters.levelId);if(filters?.classGroupId)params['classGroupId']=String(filters.classGroupId);return this.http.get<Record<string,unknown>[]>(`${this.base}/admin/campaigns/${id}/evaluations`,{params});}
 expected(id:number){return this.http.get<Record<string,unknown>[]>(`${this.base}/admin/campaigns/${id}/expected`);}
 approveBulk(ids:number[]){return this.http.post<{approved:number}>(`${this.base}/admin/evaluations/approve-bulk`,{ids});}
 detail(id:number){return this.http.get<Record<string,unknown>>(`${this.base}/admin/evaluations/${id}`);}
 approve(id:number){return this.http.post(`${this.base}/admin/evaluations/${id}/approve`,{});}
 returnForCorrection(id:number,reason:string){return this.http.post(`${this.base}/admin/evaluations/${id}/return`,{reason});}
 teacherCampaigns(){return this.http.get<Campaign[]>(`${this.base}/teacher/campaigns`);}
 teacherEvaluation(id:number){return this.http.get<Record<string,unknown>>(`${this.base}/teacher/evaluations/${id}`);}
 teacherStudents(campaignId:number,classGroupId:number,subjectId:number){return this.http.get<Record<string,unknown>[]>(`${this.base}/teacher/students`,{params:{campaignId,classGroupId,subjectId}});}
 criteria(cycle?:string){return this.http.get<Record<string,unknown>[]>(`${this.base}/criteria`,{params:cycle?{cycle}:{}});}
 saveDraft(data:unknown){return this.http.post(`${this.base}/teacher/draft`,data);}
 submit(id:number){return this.http.post(`${this.base}/teacher/${id}/submit`,{});}
 publishStudent(campaignId:number,studentId:number){return this.http.post(`${this.base}/publications/campaigns/${campaignId}/students/${studentId}`,{});}
 parentReports(studentId:number){return this.http.get<Record<string,unknown>[]>(`${this.base}/parent/students/${studentId}/reports`);}
 parentAvailability(studentId:number){return this.http.get<Record<string,any>[]>(`${this.base}/parent/students/${studentId}/availability`);}
 parentReportPdf(id:number){return this.http.get(`${this.base}/parent/reports/${id}/pdf`,{responseType:'blob'});}
 stats(campaignId:number,endpoint:'summary'|'teachers'|'assignments'|'students',filters:Record<string,string>={}){return this.http.get<any>(`${this.base}/admin/campaigns/${campaignId}/statistics/${endpoint}`,{params:filters});}
}
