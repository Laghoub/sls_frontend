import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { TeacherAssignment, TeacherAttendance, TeacherDashboard, TeacherEvaluation, TeacherExercise, TeacherGrade, TeacherMe, TeacherPayroll, TeacherSchedule, TeacherStudent } from '../models/employee-portal.model';
@Injectable({providedIn:'root'})
export class EmployeePortalService {
 private readonly http=inject(HttpClient); private readonly root=`${API_CONFIG.baseUrl}/teacher-portal`;
 me(){return this.http.get<TeacherMe>(`${this.root}/me`)}
 dashboard(){return this.http.get<TeacherDashboard>(`${this.root}/dashboard`)}
 assignments(){return this.http.get<TeacherAssignment[]>(`${this.root}/assignments`)}
 students(assignmentId:number){return this.http.get<TeacherStudent[]>(`${this.root}/assignments/${assignmentId}/students`)}
 timetable(schoolYearId:number){return this.http.get<TeacherSchedule[]>(`${this.root}/timetable`,{params:new HttpParams().set('schoolYearId',schoolYearId)})}
 attendance(from?:string,to?:string){let p=new HttpParams();if(from)p=p.set('from',from);if(to)p=p.set('to',to);return this.http.get<TeacherAttendance[]>(`${this.root}/attendance`,{params:p})}
 payroll(){return this.http.get<TeacherPayroll[]>(`${this.root}/payroll`)}
 exercises(){return this.http.get<TeacherExercise[]>(`${this.root}/exercises`)}
 createExercise(v:TeacherExercise){return this.http.post<TeacherExercise>(`${this.root}/exercises`,v)}
 updateExercise(id:number,v:TeacherExercise){return this.http.put<TeacherExercise>(`${this.root}/exercises/${id}`,v)}
 deleteExercise(id:number){return this.http.delete<void>(`${this.root}/exercises/${id}`)}
 evaluations(){return this.http.get<TeacherEvaluation[]>(`${this.root}/evaluations`)}
 createEvaluation(v:TeacherEvaluation){return this.http.post<TeacherEvaluation>(`${this.root}/evaluations`,v)}
 updateEvaluation(id:number,v:TeacherEvaluation){return this.http.put<TeacherEvaluation>(`${this.root}/evaluations/${id}`,v)}
 grades(id:number){return this.http.get<TeacherGrade[]>(`${this.root}/evaluations/${id}/grades`)}
 saveGrades(id:number,v:TeacherGrade[]){return this.http.put<TeacherGrade[]>(`${this.root}/evaluations/${id}/grades`,v.map(x=>({studentId:x.studentId,score:x.absent?null:x.score,absent:x.absent,comment:x.comment||''})))}
}