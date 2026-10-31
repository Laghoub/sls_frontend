import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';

export interface CatchupLine {
  teacherId: number; classGroupId: number; subjectId: number; timeSlotId: number;
  date: string; status: 'PRESENT'|'ABSENT'|'RETARD'; lateMinutes: number;
  reason: string; notes: string;
}
export interface CatchupRecord {
  id:number; session_date:string; teacher_id:number; class_group_id:number;
  subject_id:number; time_slot_id:number; start_time:string; end_time:string;
  attendance_status:string; validation_status:string; late_minutes:number;
  reason:string|null; notes:string|null;
}
export interface HistoricPattern {
  teacherId:number; classGroupId:number; subjectId:number; timeSlotId:number; dayOfWeek:number;
}
export interface HistoricTemplate {
  id:number; name:string; from_date:string; to_date:string;
}
@Injectable({providedIn:'root'})
export class TeacherAttendanceCatchupService {
  private http=inject(HttpClient);
  private url=`${API_CONFIG.baseUrl}/teacher-attendance/catchup`;
  batch(lines:CatchupLine[]){return this.http.post<{created:number}>(
    `${this.url}/batch`,{lines});}
  list(from:string,to:string,teacherId?:number|null){
    let params=new HttpParams().set('from',from).set('to',to);
    if(teacherId)params=params.set('teacherId',teacherId);
    return this.http.get<CatchupRecord[]>(this.url,{params});
  }
  decide(id:number,decision:'validate'|'reject'){
    return this.http.patch(`${this.url}/${id}/${decision}`,{});
  }
  templates(){return this.http.get<HistoricTemplate[]>(`${this.url}/templates`);}
  createTemplate(name:string,fromDate:string,toDate:string,patterns:HistoricPattern[]){
    return this.http.post<{id:number}>(`${this.url}/templates`,{name,fromDate,toDate,patterns});
  }
  generate(id:number,fromDate:string,toDate:string,excludeHolidays:boolean){
    return this.http.post<{created:number;skippedConflicts:number}>(
      `${this.url}/templates/${id}/generate`,{fromDate,toDate,excludeHolidays});
  }
}
