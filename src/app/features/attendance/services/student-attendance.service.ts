import {inject,Injectable} from '@angular/core';
import {HttpClient,HttpParams} from '@angular/common/http';
import {API_CONFIG} from '../../../core/api.config';
import {ExpectedStudentAttendance,StudentAttendance,StudentAttendanceBatchRequest,StudentAttendanceFilters,StudentAttendanceSummary,StudentPageResponse} from '../models/student-attendance.model';
@Injectable({providedIn:'root'}) export class StudentAttendanceService{
 private http=inject(HttpClient); private root=`${API_CONFIG.baseUrl}/student-attendance`;
 expected(date:string,classGroupId:number,timeSlotId:number){return this.http.get<ExpectedStudentAttendance[]>(`${this.root}/expected`,{params:new HttpParams().set('date',date).set('classGroupId',classGroupId).set('timeSlotId',timeSlotId)});}
 saveBatch(r:StudentAttendanceBatchRequest){return this.http.put<StudentAttendance[]>(`${this.root}/batch`,r);}
 history(f:StudentAttendanceFilters){let p=new HttpParams().set('page',f.page??0).set('size',f.size??20); if(f.from)p=p.set('from',f.from);if(f.to)p=p.set('to',f.to);if(f.studentId)p=p.set('studentId',f.studentId);if(f.classGroupId)p=p.set('classGroupId',f.classGroupId);if(f.status)p=p.set('status',f.status);if(f.justified!==null&&f.justified!==undefined)p=p.set('justified',f.justified);return this.http.get<StudentPageResponse<StudentAttendance>>(this.root,{params:p});}
 summary(from?:string|null,to?:string|null,studentId?:number|null,classGroupId?:number|null){let p=new HttpParams();if(from)p=p.set('from',from);if(to)p=p.set('to',to);if(studentId)p=p.set('studentId',studentId);if(classGroupId)p=p.set('classGroupId',classGroupId);return this.http.get<StudentAttendanceSummary>(`${this.root}/summary`,{params:p});}
}
